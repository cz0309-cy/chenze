// 星域擂台 · 状态机
// 规则详见 PROJECT_AI_NOTE.md 第 13 / 13.1 / 13.2 节。
import { reactive, computed } from 'vue'
import {
  MODES, FIGHTERS, FOES, DIFFICULTY, ACTIONS, RULES, EFFECT_LABEL,
  STORE_REALM, STORE_POWER, STORE_RECORD
} from './roster.js'
import { useWallet } from '../../composables/useWallet.js'

// ---------- localStorage 安全读写 ----------
function lsGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val) } catch { /* 隐私模式忽略 */ }
}

// ---------- 修为 → 血条 ----------
// power 单位为「万」：1（=1万）→ 20，10^6（=100亿）→ 140，每 ×10 血条 +20
export function powerToHp(power) {
  const p = Math.min(Math.max(Number(power) || 1, 1), 1e6)
  const hp = RULES.hpMin + (Math.log10(p) - RULES.logMin) /
    (RULES.logMax - RULES.logMin) * (RULES.hpMax - RULES.hpMin)
  return Math.round(hp * 10) / 10
}

// 攻击 = 血条 × 固定小比例 × (1 + 境界 × 加成)
function atkOf(hp, realm) {
  return hp * RULES.attackRatio * (1 + realm * RULES.realmAtkBonus)
}

// 读取玩家修为（来自 /cultivate 存档）
function loadPlayerCultivation() {
  let realm = Number(lsGet(STORE_REALM))
  let power = Number(lsGet(STORE_POWER))
  if (!Number.isFinite(realm)) realm = 0
  realm = Math.min(Math.max(Math.round(realm), 0), 6)
  if (!Number.isFinite(power) || power <= 0) power = 1
  return { realm, power }
}

// 读取 / 更新战绩
function loadRecord() {
  try {
    const r = JSON.parse(lsGet(STORE_RECORD))
    if (r && typeof r === 'object') {
      return {
        wins: Number(r.wins) || 0, losses: Number(r.losses) || 0,
        streak: Number(r.streak) || 0, bestStreak: Number(r.bestStreak) || 0
      }
    }
  } catch { /* 忽略 */ }
  return { wins: 0, losses: 0, streak: 0, bestStreak: 0 }
}
function saveRecord(r) { lsSet(STORE_RECORD, JSON.stringify(r)) }

// ---------- 创建一个战斗单位 ----------
function makeSide(meta, realm, power) {
  const hp = powerToHp(power)
  return {
    id: meta.id, name: meta.name, en: meta.en, glyph: meta.glyph, color: meta.color,
    art: meta.art, desc: meta.desc, quote: meta.quote,
    realm,
    hp, maxHp: hp,
    mp: RULES.mpMax,
    atk: atkOf(hp, realm),
    speed: 8 + realm * 3
  }
}

// ---------- 单次伤害计算 ----------
// 返回 { dmg, crit, effect } —— effect 为秘法特效标识（若有）
function computeDamage(attacker, defender, actionKey, foeActionKey) {
  const isArt = actionKey === 'art'
  const canArt = attacker.mp >= RULES.artMp
  const act = isArt && canArt ? 'art' : (isArt ? 'attack' : actionKey)
  let mult = 1
  if (act === 'art') mult = RULES.artMul
  else if (act === 'guard' || act === 'focus') mult = 0.4 // 防御/凝神仍造成小幅伤害，避免僵持

  let raw = attacker.atk * mult

  // 境界压制：每差一境，高境 +8%，低境 -8%
  raw *= 1 + (attacker.realm - defender.realm) * RULES.suppressionPerTier
  // 防御减伤：对方境界阶 × 3%（下限 10% 保底）
  raw *= Math.max(0.1, 1 - defender.realm * RULES.defenseRatio)

  // 穿透：无视对方护体
  const pierce = act === 'art' && attacker.art.effect === 'pierce'
  if (foeActionKey === 'guard' && !pierce) raw *= 1 - RULES.guardReduction
  // 凝神易伤
  if (foeActionKey === 'focus') raw *= 1 + RULES.focusVuln

  // 暴击
  const critChance = Math.min(RULES.critCap, RULES.critBase + attacker.speed * RULES.critPerSpeed)
  const crit = Math.random() < critChance
  if (crit) raw *= RULES.critMul

  // 伤害浮动 0.9–1.1
  raw *= RULES.dmgJitter[0] + Math.random() * (RULES.dmgJitter[1] - RULES.dmgJitter[0])

  return { dmg: Math.max(1, Math.round(raw)), crit, act, effect: act === 'art' ? attacker.art.effect : null }
}

// ---------- AI 决策 ----------
function aiPick(side, smart) {
  const roll = Math.random()
  if (side.mp >= RULES.artMp && roll < (smart ? 0.45 : 0.3)) return 'art'
  if (roll < (smart ? 0.62 : 0.52)) return 'guard'
  if (roll < (smart ? 0.7 : 0.6)) return 'focus'
  return 'attack'
}

// =========================================================
//  createBattle() —— 组件唯一入口
// =========================================================
export function createBattle() {
  const state = reactive({
    phase: 'intro',        // intro | select | battle | over
    mode: 'ai',            // ai | pvp
    difficulty: 'hard',
    playerId: null,
    foeId: null,           // ai 模式对手
    side2Id: null,         // pvp 模式 P2 选的人
    turn: 0,               // 0 = 左侧下令, 1 = 右侧下令, 'handoff' = 交接遮挡
    pending: [null, null], // 本回合双方已下令但尚未结算
    pick: [null, null],    // 上一回合双方出的招（结算后才更新，交接期不泄露）
    sides: [null, null],   // 两个战斗单位
    round: 0,
    log: [],               // 航行日志文本
    floaters: [],          // 飘字 { side, text, kind }
    result: null,          // 'win' | 'lose' | 'draw' | 'pvp'
    reward: 0,
    rewarded: false,
    record: loadRecord(),
    cultivation: null      // 登台时快照的玩家修为
  })

  // 血条 / 念力百分比（页面级 computed，解构后在模板中自动解包）
  const hpPct = computed(() => state.sides.map(s => s ? Math.max(0, s.hp / s.maxHp * 100) : 0))
  const mpPct = computed(() => state.sides.map(s => s ? Math.max(0, s.mp / RULES.mpMax * 100) : 0))

  // 当前应由哪一方下令（pvp 交接期返回 -1）
  function activeSide() {
    if (state.mode === 'pvp') return state.turn === 1 ? 1 : (state.turn === 0 ? 0 : -1)
    return 0
  }

  function pushLog(text) {
    state.log.unshift(text)
    if (state.log.length > 40) state.log.pop()
  }
  function pushFloat(side, text, kind = 'dmg') {
    state.floaters.push({ side, text, kind, t: Date.now() + Math.random() })
    if (state.floaters.length > 12) state.floaters.shift()
  }

  // ---------- 选人 / 开始 ----------
  function setMode(mode) {
    if (state.phase !== 'intro') return
    state.mode = mode
    state.playerId = null; state.foeId = null; state.side2Id = null
  }
  function pickPlayer(id) {
    if (state.phase !== 'select') return
    state.playerId = id
  }
  function pickFoe(id) {
    if (state.phase !== 'intro' && state.phase !== 'select') return
    state.foeId = id
  }
  function pickSide2(id) {
    if (state.phase !== 'select') return
    state.side2Id = id
  }

  // 进入选人页
  function toSelect() {
    if (state.mode === 'pvp') {
      // 双人模式跳过选对手
      state.phase = 'select'
    } else {
      state.phase = 'select'
    }
  }

  // 真正登台：每次都重读玩家修为
  function startBattle() {
    const playerMeta = FIGHTERS.find(f => f.id === state.playerId) || FIGHTERS[0]
    const cult = loadPlayerCultivation()
    state.cultivation = { ...cult }
    const left = makeSide(playerMeta, cult.realm, cult.power)

    let right
    if (state.mode === 'pvp') {
      const s2 = FIGHTERS.find(f => f.id === state.side2Id) || FIGHTERS[1]
      // 镜像对决：双方用相同修为，不做难度缩放
      right = makeSide(s2, cult.realm, cult.power)
    } else {
      const foe = FOES.find(f => f.id === state.foeId) || FOES[0]
      const diff = DIFFICULTY.find(d => d.key === state.difficulty) || DIFFICULTY[1]
      const tier = Math.min(Math.max(foe.tier + diff.tierAdj, 0), 9)
      const power = Math.pow(10, tier) * diff.pow
      right = makeSide(foe, tier, power)
    }

    state.sides = [left, right]
    state.turn = 0
    state.pending = [null, null]
    state.pick = [null, null]
    state.round = 0
    state.log = []
    state.floaters = []
    state.result = null
    state.reward = 0
    state.rewarded = false
    state.phase = 'battle'
    pushLog(`登台：${left.name}（${cult.realm + 1}境）${state.mode === 'pvp' ? 'VS ' + right.name : '迎战 ' + right.name}`)
  }

  // 秘法是否可用（按当前下令方算）
  function canArtNow() {
    const idx = activeSide()
    if (idx < 0) return false
    const s = state.sides[idx]
    return s && s.mp >= RULES.artMp
  }

  // ---------- 下令 ----------
  // 人机：玩家下令后立即触发 AI，一起结算
  function choose(actionKey) {
    if (state.phase !== 'battle' || activeSide() !== 0) return
    const s0 = state.sides[0]
    if (actionKey === 'art' && s0.mp < RULES.artMp) return
    const ai = aiPick(state.sides[1], state.difficulty === 'abyss')
    resolveRound(actionKey, ai)
  }

  // 双人：P1 下令 → 进入交接，不结算
  function choosePvp(actionKey) {
    if (state.mode !== 'pvp' || state.phase !== 'battle' || state.turn !== 0) return
    const s0 = state.sides[0]
    if (actionKey === 'art' && s0.mp < RULES.artMp) return
    state.pending = [actionKey, null]
    state.turn = 'handoff'
  }
  // P2 下令 → 一起结算
  function submitPvp(actionKey) {
    if (state.mode !== 'pvp' || state.phase !== 'battle' || state.turn !== 1) return
    const s1 = state.sides[1]
    if (actionKey === 'art' && s1.mp < RULES.artMp) return
    state.pending = [state.pending[0], actionKey]
    resolveRound(state.pending[0], actionKey)
  }
  // 交接：点「我是 P2」
  function handoff() {
    if (state.turn !== 'handoff') return
    state.turn = 1
  }

  // ---------- 回合结算 ----------
  function resolveRound(a0, a1) {
    if (state.phase !== 'battle') return
    state.round++
    // 先手：速度高者；相同则左侧先
    const first = state.sides[0].speed >= state.sides[1].speed ? 0 : 1
    const actions = [a0, a1]
    const foeActions = [a1, a0]

    for (const i of [first, 1 - first]) {
      const atk = state.sides[i]
      const def = state.sides[1 - i]
      if (def.hp <= 0) break // 先手打死对手 → 后手当回合无法出手

      const actionKey = actions[i]
      // 自身指令的念力变化
      if (actionKey === 'guard') atk.mp = Math.min(RULES.mpMax, atk.mp + RULES.guardMp)
      else if (actionKey === 'focus') atk.mp = Math.min(RULES.mpMax, atk.mp + RULES.focusMp)
      else if (actionKey === 'art' && atk.mp >= RULES.artMp) atk.mp -= RULES.artMp

      const r = computeDamage(atk, def, actionKey, foeActions[i])
      def.hp = Math.max(0, def.hp - r.dmg)
      pushFloat(1 - i, (r.crit ? '暴击 ' : '') + '-' + r.dmg, r.crit ? 'crit' : 'dmg')

      // 秘法特效
      if (r.effect === 'drain') {
        const heal = Math.round(r.dmg * 0.3)
        atk.hp = Math.min(atk.maxHp, atk.hp + heal)
        pushFloat(i, '+' + heal, 'heal')
      } else if (r.effect === 'heal') {
        const heal = Math.round(atk.maxHp * 0.1)
        atk.hp = Math.min(atk.maxHp, atk.hp + heal)
        pushFloat(i, '+' + heal, 'heal')
      } else if (r.effect === 'drainMp') {
        const sip = Math.min(def.mp, 20)
        def.mp -= sip; atk.mp = Math.min(RULES.mpMax, atk.mp + sip)
        pushFloat(i, '吸念 +' + sip, 'mp')
      }
    }

    // 回合末：双方自然回念
    state.sides.forEach(s => { s.mp = Math.min(RULES.mpMax, s.mp + RULES.naturalMp) })
    // 结算后才更新上一回合选择（交接期不泄露 P1 这一手）
    state.pick = [a0, a1]
    state.pending = [null, null]

    const hp0 = state.sides[0].hp, hp1 = state.sides[1].hp
    pushLog(`第 ${state.round} 回合：${state.sides[0].name} ${hp0.toFixed(0)} / ${state.sides[1].name} ${hp1.toFixed(0)}`)

    if (hp0 <= 0 || hp1 <= 0) {
      finish()
    } else if (state.mode === 'pvp') {
      state.turn = 0 // PVP 下一回合仍从 P1 开始
    }
  }

  // ---------- 收尾 ----------
  function finish() {
    const hp0 = state.sides[0].hp, hp1 = state.sides[1].hp
    if (state.mode === 'pvp') {
      state.result = 'pvp'
      state.reward = 0
      pushLog('切磋结束：' + (hp0 > hp1 ? '左侧胜' : hp1 > hp0 ? '右侧胜' : '平局'))
    } else {
      const win = hp0 > 0 && hp1 <= 0
      const diff = DIFFICULTY.find(d => d.key === state.difficulty) || DIFFICULTY[1]
      state.result = win ? 'win' : 'lose'
      state.reward = win ? diff.reward : RULES.loseReward
      const r = { ...state.record }
      if (win) {
        r.wins++; r.streak++
        r.bestStreak = Math.max(r.bestStreak, r.streak)
      } else {
        r.losses++; r.streak = 0
      }
      state.record = r
      saveRecord(r)
      pushLog(win ? `胜利！获得 ${state.reward} 宇宙币` : `战败，补贴 ${state.reward} 宇宙币`)
    }
    state.phase = 'over'
    // 发币立刻执行（幂等），弹层延后由组件处理
    claimReward()
  }

  // 奖励幂等：只发一次
  function claimReward() {
    if (state.rewarded) return
    state.rewarded = true
    if (state.reward > 0) useWallet().earn(state.reward)
  }

  // 重置回选人页
  function reset() {
    state.phase = 'intro'
    state.playerId = null; state.foeId = null; state.side2Id = null
    state.sides = [null, null]
    state.result = null; state.reward = 0; state.rewarded = false
    state.pick = [null, null]; state.pending = [null, null]; state.turn = 0
  }

  return {
    state, hpPct, mpPct,
    // 常量暴露给模板
    MODES, FIGHTERS, FOES, DIFFICULTY, ACTIONS, RULES, EFFECT_LABEL,
    // 方法
    setMode, pickPlayer, pickFoe, pickSide2, toSelect, startBattle,
    canArtNow, activeSide, choose, choosePvp, submitPvp, handoff,
    claimReward, reset, powerToHp
  }
}

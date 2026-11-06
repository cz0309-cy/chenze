/**
 * 秘境寻宝 · 闯关状态机
 * ============================================================
 * 规则：
 *   - 6 关顺序闯，每关最多 2 次机会
 *   - 第 1 次失败 → 原地重试（replay）
 *   - 第 2 次失败 → 退回上一关（第 1 关则回到起点重开）
 *   - 退回后该关机会重新给满 2 次
 *
 * 阶段 phase：
 *   intro    报名页
 *   level    正在闯关（body 渲染对应关卡组件）
 *   verdict  判罚弹层（通关 / 可重试 / 退回上一关）
 *   treasure 六关闯完，开宝箱
 * ============================================================
 */
import { computed, reactive } from 'vue'
import { LEVELS, MAX_ATTEMPT, TOTAL_LEVELS, levelOf } from './levels.js'

export function createTreasureGame() {
  const state = reactive({
    phase: 'intro',
    level: 1,
    attempt: 1,
    runId: 0, // 每次重新进入关卡自增，用于强制重建关卡组件
    players: ['寻宝者'],
    responder: 0,
    retreats: 0,
    fails: 0,
    levelFails: {}, // { [level]: 累计失败次数 }
    history: [], // [{ level, attempt, result, reason }]
    verdict: null, // { type:'pass'|'fail', reason, retry, to }
    startedAt: 0,
    endedAt: 0,
    best: loadBest()
  })

  const current = computed(() => levelOf(state.level))
  const levelKey = computed(() => `${state.level}-${state.attempt}-${state.runId}`)
  const isLastLevel = computed(() => state.level === TOTAL_LEVELS)
  const responderName = computed(() => state.players[state.responder] || '寻宝者')
  const canSwitchResponder = computed(() => state.players.length > 1)

  // 已通关的关卡集合（用于进度条着色）
  const clearedSet = computed(() => {
    const s = new Set()
    for (const h of state.history) if (h.result === 'pass') s.add(h.level)
    return s
  })

  function startGame(names) {
    const list = (names || []).map((s) => String(s || '').trim()).filter(Boolean)
    state.players = list.length ? list.slice(0, 4) : ['寻宝者']
    state.responder = 0
    state.level = 1
    state.attempt = 1
    state.runId += 1
    state.retreats = 0
    state.fails = 0
    state.levelFails = {}
    state.history = []
    state.verdict = null
    state.startedAt = Date.now()
    state.endedAt = 0
    state.phase = 'level'
  }

  function pass() {
    state.history.push({ level: state.level, attempt: state.attempt, result: 'pass' })
    if (state.level === TOTAL_LEVELS) {
      state.endedAt = Date.now()
      state.verdict = null
      state.phase = 'treasure'
      saveBest()
      return
    }
    state.verdict = { type: 'pass', to: state.level + 1 }
    state.phase = 'verdict'
  }

  function fail(reason) {
    state.fails += 1
    state.levelFails[state.level] = (state.levelFails[state.level] || 0) + 1
    state.history.push({ level: state.level, attempt: state.attempt, result: 'fail', reason })

    if (state.attempt < MAX_ATTEMPT) {
      // 第一次失败：还能再试一次
      state.verdict = { type: 'fail', retry: true, reason }
    } else {
      // 第二次失败：退回上一关
      const target = Math.max(1, state.level - 1)
      state.verdict = {
        type: 'fail',
        retry: false,
        reason,
        to: target,
        atStart: state.level === 1
      }
    }
    state.phase = 'verdict'
  }

  /** 原地重试（消耗第二次机会） */
  function replay() {
    state.attempt = Math.min(state.attempt + 1, MAX_ATTEMPT)
    state.runId += 1
    state.verdict = null
    state.phase = 'level'
  }

  /** 通关后进入下一关 */
  function nextLevel() {
    if (state.level >= TOTAL_LEVELS) return
    state.level += 1
    state.attempt = 1
    state.runId += 1
    rotateResponder()
    state.verdict = null
    state.phase = 'level'
  }

  /** 第二次失败：退回上一关（第 1 关则原地重开） */
  function retreat() {
    state.retreats += 1
    state.level = Math.max(1, state.level - 1)
    state.attempt = 1
    state.runId += 1
    rotateResponder()
    state.verdict = null
    state.phase = 'level'
  }

  function rotateResponder() {
    if (state.players.length > 1) {
      state.responder = (state.responder + 1) % state.players.length
    }
  }

  /** 跳过当前主答人（不改变进度） */
  function switchResponder() {
    rotateResponder()
  }

  function reset() {
    state.phase = 'intro'
    state.level = 1
    state.attempt = 1
    state.runId += 1
    state.retreats = 0
    state.fails = 0
    state.levelFails = {}
    state.history = []
    state.verdict = null
    state.startedAt = 0
    state.endedAt = 0
  }

  function elapsedMs(now = Date.now()) {
    if (!state.startedAt) return 0
    return (state.endedAt || now) - state.startedAt
  }

  function saveBest() {
    const ms = elapsedMs()
    if (!state.best || ms < state.best.ms) {
      state.best = { ms, retreats: state.retreats, fails: state.fails, at: Date.now() }
      try {
        localStorage.setItem('ss_treasure_best', JSON.stringify(state.best))
      } catch (e) {
        /* 忽略隐私模式写入失败 */
      }
    }
  }

  return {
    state,
    current,
    levelKey,
    isLastLevel,
    responderName,
    canSwitchResponder,
    clearedSet,
    startGame,
    pass,
    fail,
    replay,
    nextLevel,
    retreat,
    reset,
    switchResponder,
    elapsedMs
  }
}

function loadBest() {
  try {
    const raw = localStorage.getItem('ss_treasure_best')
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export { LEVELS, TOTAL_LEVELS, MAX_ATTEMPT }

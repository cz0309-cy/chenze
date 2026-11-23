<template>
  <div class="page-shell bt-page">
    <SiteNav />

    <div class="page-inner">
      <!-- ================= ① 选模式 / 选对手 ================= -->
      <template v-if="state.phase === 'intro'">
        <header class="page-head">
          <div class="eyebrow">STAR ARENA · DUEL</div>
          <h1>星域擂台</h1>
          <p>
            以自身<b>修为</b>对战——血条来自你在「意识修炼」积累的境界与念力。
            <b>境界压制</b>清晰可见：差一境，伤害 ±8%。选模式、定对手，登台见真章。
          </p>
        </header>

        <section class="bt-board">
          <div class="bt-sec-title">对战模式</div>
          <div class="bt-modes">
            <button
              v-for="m in MODES"
              :key="m.key"
              type="button"
              class="bt-mode"
              :class="{ on: state.mode === m.key }"
              @click="setMode(m.key)"
            >
              <b>{{ m.label }}</b>
              <span>{{ m.desc }}</span>
            </button>
          </div>

          <template v-if="state.mode === 'ai'">
            <div class="bt-sec-title">选择强敌</div>
            <div class="bt-picks">
              <button
                v-for="f in FOES"
                :key="f.id"
                type="button"
                class="bt-pick"
                :class="{ on: state.foeId === f.id }"
                :style="{ '--pc': f.color }"
                @click="pickFoe(f.id)"
              >
                <span class="bt-pick-glyph">{{ f.glyph }}</span>
                <b>{{ f.name }}</b>
                <span class="bt-pick-en">{{ f.en }}</span>
                <span class="bt-pick-meta">{{ f.tier }} 境 · {{ f.desc }}</span>
              </button>
            </div>

            <div class="bt-sec-title">难度</div>
            <div class="bt-diffs">
              <button
                v-for="d in DIFFICULTY"
                :key="d.key"
                type="button"
                class="bt-diff"
                :class="{ on: state.difficulty === d.key }"
                @click="state.difficulty = d.key"
              >
                <b>{{ d.label }}</b>
                <span>{{ d.desc }}</span>
                <em>胜 +{{ d.reward }} 币</em>
              </button>
            </div>
          </template>

          <div class="bt-cultivation" v-if="cultivationPreview">
            <span>我的修为</span>
            <b>{{ cultivationPreview.realm + 1 }} 境 · {{ fmtPower(cultivationPreview.power) }} 念力</b>
            <span class="bt-cultivation-tip">（登台时重新读取）</span>
          </div>

          <button
            type="button"
            class="bt-primary"
            :disabled="state.mode === 'ai' && !state.foeId"
            @click="toSelect"
          >
            下一步 · 选出战者
          </button>
        </section>
      </template>

      <!-- ================= ② 选出战者 ================= -->
      <template v-else-if="state.phase === 'select'">
        <header class="page-head">
          <div class="eyebrow">CHOOSE YOUR FIGHTER</div>
          <h1>{{ state.mode === 'pvp' ? '双方选人' : '选择出战者' }}</h1>
          <p v-if="state.mode === 'pvp'">同屏双人：先由 <b>P1</b> 选，再由 <b>P2</b> 选。允许选同一人 = 镜像对决。</p>
          <p v-else>选择一位人物登台。人物数值由修为决定，秘法各有特效。</p>
        </header>

        <section class="bt-board">
          <div class="bt-sec-title">{{ state.mode === 'pvp' ? 'P1 出战者' : '出战者' }}</div>
          <div class="bt-picks">
            <button
              v-for="f in FIGHTERS"
              :key="'p1-' + f.id"
              type="button"
              class="bt-pick"
              :class="{ on: state.playerId === f.id }"
              :style="{ '--pc': f.color }"
              @click="pickPlayer(f.id)"
            >
              <span class="bt-pick-glyph">{{ f.glyph }}</span>
              <b>{{ f.name }}</b>
              <span class="bt-pick-en">{{ f.en }}</span>
              <span class="bt-pick-meta">{{ f.desc }}</span>
              <span class="bt-pick-art">秘法 · {{ f.art.name }}</span>
            </button>
          </div>

          <template v-if="state.mode === 'pvp'">
            <div class="bt-sec-title">P2 出战者</div>
            <div class="bt-picks">
              <button
                v-for="f in FIGHTERS"
                :key="'p2-' + f.id"
                type="button"
                class="bt-pick"
                :class="{ on: state.side2Id === f.id }"
                :style="{ '--pc': f.color }"
                @click="pickSide2(f.id)"
              >
                <span class="bt-pick-glyph">{{ f.glyph }}</span>
                <b>{{ f.name }}</b>
                <span class="bt-pick-en">{{ f.en }}</span>
                <span class="bt-pick-meta">{{ f.desc }}</span>
              </button>
            </div>
          </template>

          <div class="bt-select-actions">
            <button type="button" class="bt-ghost" @click="state.phase = 'intro'">返回</button>
            <button
              type="button"
              class="bt-primary"
              :disabled="!state.playerId || (state.mode === 'pvp' && !state.side2Id)"
              @click="startBattle"
            >
              登台对战
            </button>
          </div>
        </section>
      </template>

      <!-- ================= ③ 对战中 ================= -->
      <template v-else-if="state.phase === 'battle'">
        <div class="bt-arena">
          <!-- 对手 -->
          <div class="bt-fighter foe" :class="{ 'is-active': activeSide() === 1 }">
            <div class="bt-avatar" :style="{ '--pc': state.sides[1].color }">{{ state.sides[1].glyph }}</div>
            <div class="bt-fname">{{ state.sides[1].name }}</div>
            <div class="bt-fen">{{ state.sides[1].en }} · {{ state.sides[1].realm + 1 }} 境</div>
            <div class="bt-bar"><i class="bt-hp" :style="{ width: hpPct[1] + '%' }"></i><span>{{ state.sides[1].hp.toFixed(0) }} / {{ state.sides[1].maxHp.toFixed(0) }}</span></div>
            <div class="bt-bar mp"><i :style="{ width: mpPct[1] + '%' }"></i><span>念力 {{ state.sides[1].mp.toFixed(0) }}</span></div>
            <div class="bt-floaters">
              <span v-for="f in floatersOf(1)" :key="f.t" :class="'fl-' + f.kind">{{ f.text }}</span>
            </div>
          </div>

          <!-- 中间 VS / 回合 -->
          <div class="bt-center">
            <div class="bt-vs">VS</div>
            <div class="bt-round">第 {{ state.round }} 回合</div>
            <div class="bt-picks-line">
              <span>{{ pickLabel(state.pick[0]) }}</span>
              <em>／</em>
              <span>{{ pickLabel(state.pick[1]) }}</span>
            </div>
          </div>

          <!-- 我方 -->
          <div class="bt-fighter self" :class="{ 'is-active': activeSide() === 0 }">
            <div class="bt-avatar" :style="{ '--pc': state.sides[0].color }">{{ state.sides[0].glyph }}</div>
            <div class="bt-fname">{{ state.sides[0].name }}</div>
            <div class="bt-fen">{{ state.sides[0].en }} · {{ state.sides[0].realm + 1 }} 境</div>
            <div class="bt-bar"><i class="bt-hp" :style="{ width: hpPct[0] + '%' }"></i><span>{{ state.sides[0].hp.toFixed(0) }} / {{ state.sides[0].maxHp.toFixed(0) }}</span></div>
            <div class="bt-bar mp"><i :style="{ width: mpPct[0] + '%' }"></i><span>念力 {{ state.sides[0].mp.toFixed(0) }}</span></div>
            <div class="bt-floaters">
              <span v-for="f in floatersOf(0)" :key="f.t" :class="'fl-' + f.kind">{{ f.text }}</span>
            </div>
          </div>
        </div>

        <!-- 指令区 -->
        <div class="bt-command">
          <div class="bt-cmd-title" v-if="state.mode === 'pvp'">
            {{ state.turn === 1 ? 'P2 下令' : 'P1 下令' }}
          </div>
          <div class="bt-cmd-title" v-else>选择指令</div>
          <div class="bt-acts">
            <button
              v-for="a in ACTIONS"
              :key="a.key"
              type="button"
              class="bt-act"
              :class="{ disabled: a.key === 'art' && !canArtNow() }"
              :disabled="a.key === 'art' && !canArtNow()"
              @click="doAction(a.key)"
            >
              <span class="bt-act-icon">{{ a.icon }}</span>
              <b>{{ a.label }}</b>
              <em>{{ a.desc }}</em>
            </button>
          </div>
          <div class="bt-log">
            <div v-for="(l, i) in state.log.slice(0, 4)" :key="i">{{ l }}</div>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= ④ 双人交接全屏遮挡 ================= -->
    <Teleport to="body">
      <div v-if="state.turn === 'handoff'" class="bt-mask solid">
        <div class="bt-handoff">
          <div class="bt-handoff-eyebrow">HANDOFF</div>
          <h2>请把设备交给 P2</h2>
          <p>P1 的指令已锁定，屏幕已遮挡。P2 确认看不到刚才的选择后再继续。</p>
          <button type="button" class="bt-primary" @click="handoff">我是 P2</button>
        </div>
      </div>
    </Teleport>

    <!-- ================= ⑤ 结算弹层 ================= -->
    <Teleport to="body">
      <div v-if="showResult" class="bt-mask">
        <div class="bt-result">
          <div class="bt-result-eyebrow">BATTLE RESULT</div>
          <h2 v-if="state.result === 'win'">胜 利</h2>
          <h2 v-else-if="state.result === 'lose'">战 败</h2>
          <h2 v-else>切磋结束</h2>
          <p class="bt-result-sub">{{ resultSubtitle }}</p>

          <div class="bt-result-scores">
            <div>
              <span>{{ state.sides[0] ? state.sides[0].name : '' }}</span>
              <b>{{ state.sides[0] ? state.sides[0].hp.toFixed(0) : 0 }}</b>
            </div>
            <em>:</em>
            <div>
              <span>{{ state.sides[1] ? state.sides[1].name : '' }}</span>
              <b>{{ state.sides[1] ? state.sides[1].hp.toFixed(0) : 0 }}</b>
            </div>
          </div>

          <div v-if="state.mode === 'ai'" class="bt-result-reward">
            <span>获得</span> <b>+{{ state.reward }}</b> <span>宇宙币</span>
          </div>
          <div v-if="state.mode === 'pvp'" class="bt-result-note">切磋局 · 不发币 · 不计战绩</div>

          <div class="bt-result-record" v-if="state.mode === 'ai'">
            战绩 {{ state.record.wins }} 胜 {{ state.record.losses }} 负 ·
            连胜 {{ state.record.streak }}（最佳 {{ state.record.bestStreak }}）
          </div>

          <div class="bt-result-actions">
            <button type="button" class="bt-ghost" @click="reset">重新选人</button>
            <button type="button" class="bt-primary" @click="rematch">再来一局</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { createBattle } from '../game/battle/engine.js'
import { STORE_REALM, STORE_POWER } from '../game/battle/roster.js'

const {
  state, hpPct, mpPct,
  MODES, FIGHTERS, FOES, DIFFICULTY, ACTIONS, RULES, EFFECT_LABEL,
  setMode, pickPlayer, pickFoe, pickSide2, toSelect, startBattle,
  canArtNow, activeSide, choose, choosePvp, submitPvp, handoff,
  claimReward, reset, powerToHp
} = createBattle()

// 结算弹层延后 780ms（发币在引擎里已立刻执行）
const showResult = ref(false)
let resultTimer = null
watch(() => state.phase, (p) => {
  clearTimeout(resultTimer)
  if (p === 'over') {
    resultTimer = setTimeout(() => {
      claimReward()
      showResult.value = true
    }, 780)
  } else {
    showResult.value = false
  }
})
onBeforeUnmount(() => clearTimeout(resultTimer))

// 登台预览修为
const cultivationPreview = computed(() => {
  try {
    const realm = Number(localStorage.getItem(STORE_REALM)) || 0
    const power = Number(localStorage.getItem(STORE_POWER)) || 1
    return { realm: Math.min(Math.max(realm, 0), 6), power: Math.max(power, 1) }
  } catch { return null }
})

function fmtPower(v) {
  const n = Number(v) || 0
  if (n >= 1e8) return (n / 1e8).toFixed(1) + ' 亿'
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1) + ' 万'
  return String(n)
}

function doAction(key) {
  if (state.mode === 'pvp') {
    if (state.turn === 0) choosePvp(key)
    else if (state.turn === 1) submitPvp(key)
  } else {
    choose(key)
  }
}

function floatersOf(side) {
  return state.floaters.filter(f => f.side === side).slice(-3)
}
function pickLabel(k) {
  if (!k) return '待命'
  const a = ACTIONS.find(x => x.key === k)
  return a ? a.label : '待命'
}
const resultSubtitle = computed(() => {
  if (state.mode === 'pvp') {
    const a = state.sides[0]?.hp || 0, b = state.sides[1]?.hp || 0
    return a > b ? '左侧胜出' : b > a ? '右侧胜出' : '势均力敌'
  }
  return state.result === 'win' ? '以修为碾压对手，星域记下了你的名字。' : '修为尚浅，再练几年。'
})
function rematch() {
  showResult.value = false
  reset()
  // 直接回到选人，保留上次的模式
  state.phase = 'select'
}
</script>

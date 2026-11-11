<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner tg-page">
      <!-- ================= ① 报名 ================= -->
      <template v-if="state.phase === 'intro'">
        <header class="page-head tg-intro-head">
          <div class="eyebrow">SECRET REALM · TREASURE HUNT</div>
          <h1>秘境寻宝</h1>
          <p>
            六道关卡，一枚宝藏。<b>1–4 人</b>组队闯关，每关只有两次机会 ——
            第一次失手可以原地再来，<b>第二次失手就要退回上一关</b>。全部闯过，宝箱开启。<br />
            每关的题目在进入时<b>现场抽取</b>，换一队、重试、退回再进，拿到的都不会是同一道。
          </p>
        </header>

        <section class="tg-board tg-intro">
          <div class="tg-pick">
            <span class="tg-pick-label">队伍人数</span>
            <div class="tg-pick-btns">
              <button
                v-for="n in 4"
                :key="n"
                type="button"
                class="tg-pick-btn"
                :class="{ on: playerCount === n }"
                @click="playerCount = n"
              >
                {{ n }} 人
              </button>
            </div>
          </div>

          <div class="tg-names">
            <label v-for="i in playerCount" :key="i" class="tg-name-field">
              <span>玩家 {{ i }}</span>
              <input
                v-model="names[i - 1]"
                type="text"
                maxlength="8"
                :placeholder="PLACEHOLDERS[i - 1]"
                @keyup.enter="beginGame"
              />
            </label>
          </div>

          <div class="tg-rules">
            <div v-for="l in LEVELS" :key="l.id" class="tg-rule-row">
              <span class="tg-rule-id">{{ l.id }}</span>
              <span class="tg-rule-ico">{{ l.icon }}</span>
              <span class="tg-rule-name">{{ l.name }}</span>
              <span class="tg-rule-text">{{ l.rule }}</span>
            </div>
          </div>

          <button type="button" class="tg-btn tg-gold tg-btn-lg tg-start" @click="beginGame">
            进入秘境
          </button>
          <p v-if="state.best" class="tg-best">
            最快通关：{{ fmt(state.best.ms) }} · 退关 {{ state.best.retreats }} 次 · 失败
            {{ state.best.fails }} 次
          </p>
        </section>
      </template>

      <!-- ================= ② 闯关 ================= -->
      <template v-else-if="state.phase === 'level' || state.phase === 'verdict'">
        <header class="tg-bar-top">
          <div class="tg-progress">
            <div
              v-for="l in LEVELS"
              :key="l.id"
              class="tg-step"
              :class="{
                done: clearedSet.has(l.id),
                now: l.id === state.level,
                lock: l.id > state.level && !clearedSet.has(l.id)
              }"
            >
              <span class="tg-step-dot">{{ clearedSet.has(l.id) ? '✓' : l.id }}</span>
              <span class="tg-step-name">{{ l.name }}</span>
            </div>
          </div>
          <div class="tg-meta">
            <span class="tg-timer">⏱ {{ fmt(elapsed) }}</span>
            <span v-if="canSwitchResponder" class="tg-responder" @click="switchResponder">
              主答：<b>{{ responderName }}</b> ⇄
            </span>
            <button type="button" class="tg-quit" @click="quit">退出</button>
          </div>
        </header>

        <section class="tg-board">
          <div class="tg-level-head">
            <span class="tg-level-ico">{{ current.icon }}</span>
            <div class="tg-level-title">
              <div class="tg-level-tag">{{ current.tag }} · 第 {{ state.level }} 关</div>
              <h2>{{ current.name }}</h2>
            </div>
            <div class="tg-attempt" :class="{ warn: state.attempt > 1 }">
              {{ state.attempt > 1 ? '最后一次机会' : '两次机会' }}
              <i v-for="n in 2" :key="n" :class="{ used: state.attempt > n }"></i>
            </div>
          </div>

          <p class="tg-level-rule">{{ current.rule }}</p>

          <component :is="levelComp" :key="levelKey" @pass="onPass" @fail="onFail" />
        </section>

        <!-- 判罚弹层：必须 Teleport 到 body —— .tg-page 有 animation(transform)，
             会成为 position:fixed 的包含块，否则遮罩只盖住内容区而不是整个视口 -->
        <Teleport to="body">
          <div v-if="state.phase === 'verdict'" class="tg-mask">
            <div class="tg-modal" :class="state.verdict.type">
              <div class="tg-modal-ico">
                {{ state.verdict.type === 'pass' ? '🌟' : state.verdict.retry ? '💥' : '🔥' }}
              </div>

              <template v-if="state.verdict.type === 'pass'">
                <h3>第 {{ state.level }} 关 · 通过</h3>
                <p>秘境又深了一层，前方是第 {{ state.verdict.to }} 关。</p>
                <button type="button" class="tg-btn tg-gold tg-btn-lg" @click="nextLevel">
                  进入第 {{ state.verdict.to }} 关
                </button>
              </template>

              <template v-else-if="state.verdict.retry">
                <h3>这关没过</h3>
                <p class="tg-reason">{{ state.verdict.reason }}</p>
                <p class="tg-sub">还有最后 <b>1</b> 次机会 —— 再失败就要退回上一关。</p>
                <button type="button" class="tg-btn tg-gold tg-btn-lg" @click="replay">再试一次</button>
              </template>

              <template v-else>
                <h3>两次都没过</h3>
                <p class="tg-reason">{{ state.verdict.reason }}</p>
                <p v-if="state.verdict.atStart" class="tg-sub">已经退无可退，回到起点重开第 1 关。</p>
                <p v-else class="tg-sub">按规则退回第 {{ state.verdict.to }} 关，那一关的机会重新给满。</p>
                <button type="button" class="tg-btn tg-gold tg-btn-lg" @click="retreat">
                  {{ state.verdict.atStart ? '重开第 1 关' : `退回第 ${state.verdict.to} 关` }}
                </button>
              </template>
            </div>
          </div>
        </Teleport>
      </template>

      <!-- ================= ③ 宝藏 ================= -->
      <template v-else-if="state.phase === 'treasure'">
        <section class="tg-treasure">
          <div class="tg-chest">
            <div class="tg-chest-glow"></div>
            <div class="tg-chest-rays"></div>
            <div class="tg-chest-ico">💎</div>
          </div>
          <div class="eyebrow">TREASURE FOUND</div>
          <h1>宝藏到手</h1>
          <p class="tg-treasure-sub">六关全通，秘境的宝箱终于为你开启。</p>

          <div class="tg-stats">
            <div class="tg-stat">
              <span class="tg-stat-num">{{ fmt(elapsed) }}</span>
              <span class="tg-stat-label">总用时</span>
            </div>
            <div class="tg-stat">
              <span class="tg-stat-num">{{ state.retreats }}</span>
              <span class="tg-stat-label">退关次数</span>
            </div>
            <div class="tg-stat">
              <span class="tg-stat-num">{{ state.fails }}</span>
              <span class="tg-stat-label">失败次数</span>
            </div>
            <div class="tg-stat">
              <span class="tg-stat-num">{{ state.players.length }}</span>
              <span class="tg-stat-label">寻宝者</span>
            </div>
          </div>

          <div class="tg-team">
            <span v-for="(p, i) in state.players" :key="p + i" class="tg-team-chip">{{ p }}</span>
          </div>

          <div class="tg-actions tg-actions-center">
            <button type="button" class="tg-btn tg-ghost" @click="reset">换一队</button>
            <button type="button" class="tg-btn tg-gold" @click="beginGame">再闯一次</button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import L1Observe from '../components/treasure/L1Observe.vue'
import L2Reaction from '../components/treasure/L2Reaction.vue'
import L3Logic from '../components/treasure/L3Logic.vue'
import L4Rhythm from '../components/treasure/L4Rhythm.vue'
import L5Memory from '../components/treasure/L5Memory.vue'
import L6Riddle from '../components/treasure/L6Riddle.vue'
import { createTreasureGame } from '../game/treasure/engine.js'
import { LEVELS } from '../game/treasure/levels.js'

const PLACEHOLDERS = ['寻宝者甲', '寻宝者乙', '寻宝者丙', '寻宝者丁']
const COMPONENTS = {
  observe: L1Observe,
  reaction: L2Reaction,
  logic: L3Logic,
  rhythm: L4Rhythm,
  memory: L5Memory,
  riddle: L6Riddle
}

const game = createTreasureGame()
const { state, current, levelKey, clearedSet, responderName, canSwitchResponder } = game
const { startGame, pass, fail, replay, nextLevel, retreat, reset, switchResponder, elapsedMs } = game

const playerCount = ref(1)
const names = ref(['', '', '', ''])
const now = ref(Date.now())

const levelComp = computed(() => COMPONENTS[current.value.key])
const elapsed = computed(() => elapsedMs(now.value))

let timer = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 500)
})
onBeforeUnmount(() => clearInterval(timer))

function beginGame() {
  const picked = names.value.slice(0, playerCount.value).map((n, i) => n || PLACEHOLDERS[i])
  startGame(picked)
  now.value = Date.now()
}

function quit() {
  if (window.confirm('退出后本局进度不保留，确定退出秘境吗？')) reset()
}

// 关卡只允许在 level 阶段提交结果，避免重复 emit 造成跳关
function onPass() {
  if (state.phase !== 'level') return
  pass()
}
function onFail(reason) {
  if (state.phase !== 'level') return
  fail(reason)
}

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
</script>

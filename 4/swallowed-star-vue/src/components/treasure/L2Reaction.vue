<template>
  <div class="tg-body">
    <template v-if="stage === 'ready'">
      <div class="tg-center">
        <div class="tg-rd-light idle"><span>准备</span></div>
        <p class="tg-lead tg-lead-center">
          看到<b class="c-green">绿灯</b>立刻拍手，看到<b class="c-red">红灯</b>手不能动。<br />
          连续 <b>{{ L2.targetStreak }}</b> 次不出错过关，累计 {{ L2.maxMiss }} 次失误判负。
        </p>
        <button type="button" class="tg-btn tg-gold tg-btn-lg" @click="start">开始喊口令</button>
        <p class="tg-kbd">也可以按 <kbd>空格</kbd> 拍手</p>
      </div>
    </template>

    <template v-else>
      <div class="tg-hud">
        <div class="tg-hud-block">
          <span class="tg-hud-label">连续正确</span>
          <div class="tg-dots">
            <i v-for="n in L2.targetStreak" :key="n" :class="{ on: streak >= n }"></i>
          </div>
        </div>
        <div class="tg-hud-block">
          <span class="tg-hud-label">失误</span>
          <div class="tg-dots">
            <i v-for="n in L2.maxMiss" :key="n" class="bad" :class="{ on: miss >= n }"></i>
          </div>
        </div>
      </div>

      <div class="tg-center">
        <div class="tg-rd-light" :class="[light || 'idle', flash]">
          <span v-if="light === 'green'">绿 灯</span>
          <span v-else-if="light === 'red'">红 灯</span>
          <span v-else>— —</span>
        </div>

        <button
          type="button"
          class="tg-clap"
          :class="{ ready: stage === 'run' && light === 'green' }"
          @click="clap"
        >
          👏 拍手
        </button>
        <p class="tg-kbd">{{ hint }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { L2 } from '../../game/treasure/levels.js'

const emit = defineEmits(['pass', 'fail'])

const stage = ref('ready') // ready | run | over
const light = ref('') // '' | 'green' | 'red'
const streak = ref(0)
const miss = ref(0)
const flash = ref('')
const hint = ref('红灯别动，绿灯快拍')

let nextTimer = null
let windowTimer = null
let currentColor = ''
let answered = false
let finished = false
let round = 0

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimers()
})

function clearTimers() {
  if (nextTimer) clearTimeout(nextTimer)
  if (windowTimer) clearTimeout(windowTimer)
  nextTimer = null
  windowTimer = null
}

function start() {
  if (stage.value === 'run') return
  stage.value = 'run'
  streak.value = 0
  miss.value = 0
  finished = false
  round = 0
  hint.value = '听口令…'
  scheduleNext(800)
}

function scheduleNext(delay) {
  nextTimer = setTimeout(fireLight, delay)
}

function fireLight() {
  if (stage.value !== 'run' || finished) return
  round += 1
  // 绿稍少于红，防止无脑连拍
  currentColor = Math.random() < 0.55 ? 'green' : 'red'
  light.value = currentColor
  answered = false
  hint.value = currentColor === 'green' ? '绿灯，快拍手！' : '红灯，手别动！'
  windowTimer = setTimeout(closeWindow, L2.window)
}

function closeWindow() {
  if (stage.value !== 'run' || finished) return
  windowTimer = null
  if (currentColor === 'green') {
    if (!answered) finishRound(false, '绿灯没有拍手')
  } else if (!answered) {
    finishRound(true)
  }
}

function clap() {
  if (stage.value !== 'run' || finished) return
  if (!light.value) return // 口令间隙点击不算失误
  if (answered) return
  answered = true

  if (light.value === 'green') finishRound(true)
  else finishRound(false, '红灯时手动了，抢拍')
}

function finishRound(ok, reason) {
  if (windowTimer) clearTimeout(windowTimer)
  windowTimer = null
  light.value = ''
  flash.value = ok ? 'ok' : 'bad'
  setTimeout(() => {
    flash.value = ''
  }, 320)

  if (ok) {
    streak.value += 1
  } else {
    miss.value += 1
    streak.value = 0
    hint.value = reason
  }

  if (streak.value >= L2.targetStreak) return stop(true, '')
  if (miss.value >= L2.maxMiss) return stop(false, reason || '失误过多')

  const gap = L2.gap[0] + Math.random() * (L2.gap[1] - L2.gap[0])
  scheduleNext(gap)
  return undefined
}

function stop(ok, reason) {
  finished = true
  stage.value = 'over'
  clearTimers()
  light.value = ''
  setTimeout(() => {
    if (ok) emit('pass')
    else emit('fail', `连续 ${L2.targetStreak} 次没做成：${reason}`)
  }, 700)
}

function onKey(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    clap()
  }
}
</script>

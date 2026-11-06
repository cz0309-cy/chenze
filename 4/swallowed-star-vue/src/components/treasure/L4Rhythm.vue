<template>
  <div class="tg-body">
    <template v-if="stage === 'ready'">
      <div class="tg-center">
        <div class="tg-rhythm-demo">
          <span class="tg-hand left">左手<small>{{ q.leftAct }}</small></span>
          <span class="tg-arrow">→</span>
          <span class="tg-hand right">右手<small>{{ q.rightAct }}</small></span>
        </div>
        <p class="tg-lead tg-lead-center">
          每一拍<b>先左手{{ q.leftAct }}、再右手{{ q.rightAct }}</b>，两下都落在同一拍里。<br />
          连续 <b>{{ q.beats }}</b> 拍动作不乱、不搞反即过关。
        </p>
        <button type="button" class="tg-btn tg-gold tg-btn-lg" @click="start">开始</button>
        <p class="tg-kbd">键盘 <kbd>A</kbd> = 左手　<kbd>L</kbd> = 右手</p>
      </div>
    </template>

    <template v-else>
      <div class="tg-beats">
        <i v-for="n in q.beats" :key="n" :class="{ on: beat > n, now: beat === n }"></i>
      </div>

      <div class="tg-center tg-rhythm">
        <div v-if="stage === 'lead'" class="tg-lead-count">{{ leadLeft }}</div>
        <div v-else class="tg-beat-ring">
          <div class="tg-pulse" :key="beat" :style="{ animationDuration: q.beatMs + 'ms' }"></div>
          <div class="tg-beat-num">
            第 <b>{{ Math.min(beat, q.beats) }}</b> / {{ q.beats }} 拍
          </div>
        </div>
        <div v-if="stage !== 'run'" class="tg-beat-num">准备…</div>

        <div class="tg-hands">
          <button
            type="button"
            class="tg-hand-btn left"
            :class="{ hit: presses.left }"
            @click="press('left')"
          >
            左手<small>{{ q.leftAct }}</small>
          </button>
          <button
            type="button"
            class="tg-hand-btn right"
            :class="{ hit: presses.right }"
            @click="press('right')"
          >
            右手<small>{{ q.rightAct }}</small>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { drawL4 } from '../../game/treasure/questionBank.js'

const emit = defineEmits(['pass', 'fail'])

// 每次进入本关都换一组左右手动作（仍是左手先、右手后）
const q = drawL4()

const stage = ref('ready') // ready | lead | run | over
const leadLeft = ref(3)
const beat = ref(0)
const presses = reactive({ left: false, right: false })

let beatTimer = null
let leadTimer = null
let done = false

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearAll()
})

function clearAll() {
  if (beatTimer) clearTimeout(beatTimer)
  if (leadTimer) clearInterval(leadTimer)
  beatTimer = null
  leadTimer = null
}

function start() {
  stage.value = 'lead'
  leadLeft.value = 3
  leadTimer = setInterval(() => {
    leadLeft.value -= 1
    if (leadLeft.value <= 0) {
      clearInterval(leadTimer)
      leadTimer = null
      stage.value = 'run'
      beat.value = 1
      beginBeat()
    }
  }, 650)
}

function beginBeat() {
  presses.left = false
  presses.right = false
  beatTimer = setTimeout(endBeat, q.beatMs)
}

function press(hand) {
  if (stage.value !== 'run' || done) return
  if (presses[hand]) return
  // 先右后左 = 搞反
  if (hand === 'right' && !presses.left) {
    fail('右手抢在左手前面，动作搞反了')
    return
  }
  presses[hand] = true
  if (presses.left && presses.right) {
    if (beatTimer) clearTimeout(beatTimer)
    beatTimer = null
    nextBeat()
  }
}

function endBeat() {
  beatTimer = null
  if (stage.value !== 'run' || done) return
  if (presses.left && presses.right) nextBeat()
  else fail(presses.left ? '这一拍右手没跟上' : presses.right ? '这一拍左手没做' : '这一拍漏了')
}

function nextBeat() {
  if (beat.value >= q.beats) {
    done = true
    stage.value = 'over'
    clearAll()
    setTimeout(() => emit('pass'), 600)
    return
  }
  beat.value += 1
  beginBeat()
}

function fail(reason) {
  if (done) return
  done = true
  stage.value = 'over'
  clearAll()
  setTimeout(() => emit('fail', reason), 500)
}

function onKey(e) {
  const k = e.key.toLowerCase()
  if (k === 'a') {
    e.preventDefault()
    press('left')
  } else if (k === 'l') {
    e.preventDefault()
    press('right')
  }
}
</script>

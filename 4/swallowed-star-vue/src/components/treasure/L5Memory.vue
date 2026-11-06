<template>
  <div class="tg-body">
    <!-- ① 记忆 -->
    <template v-if="stage === 'read'">
      <p class="tg-lead">记住这句话，<span class="tg-count">{{ left }}</span> 秒后遮住</p>
      <div class="tg-scroll tg-scroll-tall">
        <div class="tg-scroll-tag">秘境刻文</div>
        <p class="tg-scroll-text tg-sentence">{{ q.display }}</p>
      </div>
      <div class="tg-bar"><i :style="{ width: pct + '%' }"></i></div>
    </template>

    <!-- ② 停顿遮蔽 -->
    <div v-else-if="stage === 'blank'" class="tg-cover">
      <span class="tg-cover-ico">⏳</span>
      <p>停顿 <span class="tg-count">{{ left }}</span> 秒，先别再默念</p>      <span class="tg-cover-sub">时间到后按顺序把句子拼出来</span>
    </div>

    <!-- ③ 拼句复述 -->
    <template v-else>
      <p class="tg-lead">按原句顺序点击词块，拼出完整的一句话</p>

      <div class="tg-answer" :class="{ empty: !answer.length }">
        <span v-if="!answer.length" class="tg-answer-ph">点下面的词块开始拼句…</span>
        <button
          v-for="(t, i) in answer"
          :key="t.id"
          type="button"
          class="tg-token on"
          @click="removeAt(i)"
        >
          {{ t.text }}
        </button>
      </div>

      <div class="tg-chips">
        <button
          v-for="t in pool"
          :key="t.id"
          type="button"
          class="tg-chip"
          :class="{ used: t.used }"
          :disabled="t.used"
          @click="pick(t)"
        >
          {{ t.text }}
        </button>
      </div>

      <div class="tg-actions">
        <button type="button" class="tg-btn tg-ghost" :disabled="!answer.length" @click="clearAnswer">
          重拼
        </button>
        <button type="button" class="tg-btn tg-gold" :disabled="!answer.length" @click="submit">
          确认复述
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { drawL5, shuffle } from '../../game/treasure/questionBank.js'

const emit = defineEmits(['pass', 'fail'])

// 每次进入本关都换一句新的刻文
const q = drawL5()

const stage = ref('read') // read | blank | build
const left = ref(q.readSeconds)
const pool = ref([])
const answer = ref([])

let timer = null
const target = q.target
const pct = computed(() => (left.value / q.readSeconds) * 100)

onMounted(() => {
  pool.value = shuffle([...q.tokens, ...q.decoys]).map((text, i) => ({ id: i, text, used: false }))
  startCountdown(q.readSeconds, () => {
    stage.value = 'blank'
    left.value = q.blankSeconds
    startCountdown(q.blankSeconds, () => {
      stage.value = 'build'
    })
  })
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function startCountdown(seconds, done) {
  left.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    left.value -= 1
    if (left.value <= 0) {
      clearInterval(timer)
      timer = null
      done()
    }
  }, 1000)
}

function pick(t) {
  if (t.used) return
  t.used = true
  answer.value.push(t)
}

function removeAt(i) {
  const [t] = answer.value.splice(i, 1)
  if (t) t.used = false
}

function clearAnswer() {
  answer.value.forEach((t) => {
    t.used = false
  })
  answer.value = []
}

function submit() {
  const got = answer.value.map((t) => t.text).join('')
  if (got === target) {
    emit('pass')
    return
  }
  const wrong = answer.value.filter((t) => !q.tokens.includes(t.text)).map((t) => t.text)
  const reason = wrong.length
    ? `句子里混进了「${wrong.join('、')}」`
    : `拼出来是「${got}」，和原句不一致`
  emit('fail', reason)
}
</script>

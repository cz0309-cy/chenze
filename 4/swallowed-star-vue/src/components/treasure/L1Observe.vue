<template>
  <div class="tg-body">
    <!-- ① 展示物品，倒计时 -->
    <template v-if="stage === 'show'">
      <p class="tg-lead">
        记住下面 <b>{{ q.needCount }}</b> 件物品，<span class="tg-count">{{ left }}</span> 秒后自动遮住
      </p>
      <div class="tg-items">
        <div v-for="w in q.words" :key="w" class="tg-item">
          <span class="tg-item-ico">{{ q.icons[w] }}</span>
          <span class="tg-item-name">{{ w }}</span>
        </div>
      </div>
      <div class="tg-bar"><i :style="{ width: pct + '%' }"></i></div>
    </template>

    <!-- ② 遮住 -->
    <div v-else-if="stage === 'hide'" class="tg-cover">
      <span class="tg-cover-ico">🫥</span>
      <p>已经遮住了 —— 刚才看到了什么？</p>
      <span class="tg-cover-sub">准备作答…</span>
    </div>

    <!-- ③ 作答 -->
    <template v-else>
      <p class="tg-lead">
        从下面 <b>{{ pool.length }}</b> 个词里选出刚才那 {{ q.needCount }} 件物品，<b>漏一个或选错一个都算失败</b>
      </p>
      <div class="tg-chips">
        <button
          v-for="w in pool"
          :key="w"
          type="button"
          class="tg-chip"
          :class="{ on: picked.includes(w) }"
          :disabled="!picked.includes(w) && picked.length >= q.needCount"
          @click="toggle(w)"
        >
          <span class="tg-chip-ico">{{ q.icons[w] }}</span>
          <span>{{ w }}</span>
          <span v-if="picked.includes(w)" class="tg-chip-idx">{{ picked.indexOf(w) + 1 }}</span>
        </button>
      </div>
      <div class="tg-actions">
        <button type="button" class="tg-btn tg-ghost" :disabled="!picked.length" @click="picked = []">
          清空
        </button>
        <button
          type="button"
          class="tg-btn tg-gold"
          :disabled="picked.length !== q.needCount"
          @click="submit"
        >
          确认（{{ picked.length }}/{{ q.needCount }}）
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { drawL1, shuffle } from '../../game/treasure/questionBank.js'

const emit = defineEmits(['pass', 'fail'])

// 每次组件重建（进关 / 重试 / 退回重进）都重新抽一组物品
const q = drawL1()

const stage = ref('show')
const left = ref(q.seconds)
const picked = ref([])
const pool = ref([])

let tick = null
let hideTimer = null

const pct = computed(() => (left.value / q.seconds) * 100)

onMounted(() => {
  pool.value = shuffle([...q.words, ...q.decoys])
  tick = setInterval(() => {
    left.value -= 1
    if (left.value <= 0) {
      clearInterval(tick)
      tick = null
      stage.value = 'hide'
      hideTimer = setTimeout(() => {
        stage.value = 'answer'
      }, 1200)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (tick) clearInterval(tick)
  if (hideTimer) clearTimeout(hideTimer)
})

function toggle(w) {
  const i = picked.value.indexOf(w)
  if (i >= 0) picked.value.splice(i, 1)
  else if (picked.value.length < q.needCount) picked.value.push(w)
}

function submit() {
  const right = q.words
  const missed = right.filter((w) => !picked.value.includes(w))
  const wrong = picked.value.filter((w) => !right.includes(w))

  if (!missed.length && !wrong.length) {
    emit('pass')
    return
  }
  const parts = []
  if (wrong.length) parts.push(`选错了「${wrong.join('、')}」`)
  if (missed.length) parts.push(`漏掉了「${missed.join('、')}」`)
  emit('fail', parts.join('，'))
}
</script>

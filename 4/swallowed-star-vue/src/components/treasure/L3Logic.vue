<template>
  <div class="tg-body">
    <div class="tg-scroll">
      <div class="tg-scroll-tag">推理题</div>
      <p class="tg-scroll-text">{{ q.question }}</p>
    </div>

    <div class="tg-chips tg-chips-col">
      <button
        v-for="o in q.options"
        :key="o"
        type="button"
        class="tg-chip tg-chip-wide"
        :class="{ on: picked === o }"
        :disabled="locked"
        @click="picked = o"
      >
        <span class="tg-chip-dot"></span>{{ o }}
      </button>
    </div>

    <div class="tg-actions">
      <button type="button" class="tg-btn tg-gold" :disabled="!picked || locked" @click="submit">
        提交答案
      </button>
    </div>
    <p v-if="locked" class="tg-lead tg-lead-center">{{ reveal }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { drawL3 } from '../../game/treasure/questionBank.js'

const emit = defineEmits(['pass', 'fail'])

// 每次进入本关都换一道新的推理题
const q = drawL3()

const picked = ref('')
const locked = ref(false)
const reveal = ref('')

function submit() {
  if (locked.value) return
  locked.value = true
  if (picked.value === q.answer) {
    reveal.value = `正确 —— ${q.explain}`
    setTimeout(() => emit('pass'), 1100)
  } else {
    reveal.value = `不对，正确答案是「${q.answer}」。${q.explain}`
    setTimeout(() => emit('fail', `推理题答错了，你选了「${picked.value}」`), 1500)
  }
}
</script>

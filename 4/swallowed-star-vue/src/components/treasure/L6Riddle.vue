<template>
  <div class="tg-body">
    <div class="tg-scroll tg-scroll-tall">
      <div class="tg-scroll-tag">秘境守门人的谜题</div>
      <p class="tg-scroll-text tg-riddle">{{ q.question }}</p>
      <p v-if="hintText" class="tg-hint">{{ hintText }}</p>
    </div>

    <div class="tg-chips tg-chips-4">
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
      <button
        type="button"
        class="tg-btn tg-ghost"
        :disabled="hintIndex >= q.hints.length || locked"
        @click="useHint"
      >
        求提示（{{ hintIndex }}/{{ q.hints.length }}）
      </button>
      <button type="button" class="tg-btn tg-gold" :disabled="!picked || locked" @click="submit">
        提交谜底
      </button>
    </div>

    <p v-if="locked" class="tg-lead tg-lead-center">{{ reveal }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { drawL6 } from '../../game/treasure/questionBank.js'

const emit = defineEmits(['pass', 'fail'])

// 每次进入本关都换一道新谜题
const q = drawL6()

const picked = ref('')
const locked = ref(false)
const hintIndex = ref(0)
const hintText = ref('')
const reveal = ref('')

function useHint() {
  if (hintIndex.value >= q.hints.length) return
  hintText.value = q.hints[hintIndex.value]
  hintIndex.value += 1
}

function submit() {
  if (locked.value) return
  locked.value = true
  if (picked.value === q.answer) {
    reveal.value = `正确！${q.explain}`
    setTimeout(() => emit('pass'), 1200)
  } else {
    reveal.value = `谜底是「${q.answer}」。${q.explain}`
    setTimeout(() => emit('fail', `谜底猜错了，你答的是「${picked.value}」`), 1700)
  }
}
</script>

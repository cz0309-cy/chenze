<script setup>
/**
 * PhotoIcon —— 把条目的 emoji 图标换成 AI 生成的写实照片。
 * 用法：<PhotoIcon :name="item.name" :glyph="item.glyph" :size="44" />
 * 找不到映射或图片加载失败时，回退显示原 emoji，保证任何位置都不会空白。
 */
import { computed, ref, watch } from 'vue'
import { photoSrc } from '../data/photoMap.js'

const props = defineProps({
  name: { type: String, default: '' },
  glyph: { type: String, default: '' },
  size: { type: [Number, String], default: 44 },
  radius: { type: [Number, String], default: 12 }
})

const failed = ref(false)
watch(() => props.name, () => { failed.value = false })

const src = computed(() => photoSrc(props.name))
const hasPhoto = computed(() => !!src.value && !failed.value)
const sizePx = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)
const radiusPx = computed(() => typeof props.radius === 'number' ? `${props.radius}px` : props.radius)
const fontSize = computed(() => typeof props.size === 'number' ? `${Math.round(props.size * 0.5)}px` : '20px')
</script>

<template>
  <img
    v-if="hasPhoto"
    class="photo-icon"
    :src="src"
    :alt="name"
    :style="{ width: sizePx, height: sizePx, borderRadius: radiusPx }"
    @error="failed = true"
  />
  <span
    v-else
    class="photo-icon-fallback"
    :style="{ width: sizePx, height: sizePx, borderRadius: radiusPx, fontSize }"
  >{{ glyph }}</span>
</template>

<style scoped>
.photo-icon {
  display: block;
  object-fit: cover;
  flex: none;
  background: #0b1226;
  box-shadow: 0 0 12px rgba(102, 224, 255, 0.18);
}
.photo-icon-fallback {
  display: grid;
  place-items: center;
  flex: none;
  line-height: 1;
  background: rgba(140, 170, 255, 0.08);
}
</style>

<script setup>
/**
 * AppIcon —— 把 emoji 图标替换为 AI 生成的科幻霓虹图标图片。
 * 用法：<AppIcon emoji="🧭" :size="24" />
 * 找不到映射时回退显示原 emoji，保证任何位置都不会出现空白。
 */
import { computed, ref, watch } from 'vue'

const props = defineProps({
  emoji: { type: String, default: '' },
  size: { type: [Number, String], default: 20 }
})

// emoji → 图片文件名（含常见变体：带/不带 VS16、文字型 glyph）
const MAP = {
  // 导航 / 功能入口
  '🧭': 'explore', '🧭️': 'explore',
  '📖': 'codex',
  '💎': 'market',
  '🧠': 'cultivate',
  '👤': 'character',
  '🗝': 'treasure', '🗝️': 'treasure',
  '⚔': 'battle', '⚔️': 'battle',
  '🏆': 'rank',
  '🎬': 'anime',
  '👥': 'members',
  '🛡': 'admin', '🛡️': 'admin',
  '🗡': 'dagger', '🗡️': 'dagger',
  '🌀': 'vortex',
  '⚙': 'gear', '⚙️': 'gear',
  // 文明 / 商品 glyph
  '🌑': 'moon',
  '📜': 'scroll',
  '✨': 'sparkle',
  '💍': 'ring',
  '🚀': 'rocket',
  '🔮': 'crystal',
  '🍎': 'apple',
  '🛰': 'satellite', '🛰️': 'satellite',
  // 秘境关卡
  '👁': 'eye', '👁️': 'eye',
  '🚦': 'traffic',
  '🤹': 'juggle',
  // 战斗动作
  '🔥': 'fire'
}

const failed = ref(false)
watch(() => props.emoji, () => { failed.value = false })

const file = computed(() => MAP[props.emoji])
const hasIcon = computed(() => !!file.value && !failed.value)
const src = computed(() => hasIcon.value ? `/icons/${file.value}.png` : '')
const sizePx = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)
</script>

<template>
  <img
    v-if="hasIcon"
    class="app-icon"
    :src="src"
    :alt="emoji"
    :style="{ width: sizePx, height: sizePx }"
    @error="failed = true"
  />
  <span v-else class="app-icon-fallback" :style="{ fontSize: sizePx }">{{ emoji }}</span>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  object-fit: cover;
  border-radius: 8px;
  vertical-align: middle;
  flex: none;
  box-shadow: 0 0 10px rgba(64, 200, 255, 0.25);
}
.app-icon-fallback { display: inline-block; line-height: 1; vertical-align: middle; }
</style>

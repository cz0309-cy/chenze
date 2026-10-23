<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">CIVILIZATION CODEX</div>
        <h1>文明图鉴</h1>
        <p>人类、异族、未知者。图鉴按「威胁与位置」编排，而不是按强弱——因为在宇宙里，强弱是会变的。</p>
      </header>

      <div class="cx-toolbar">
        <div class="chips">
          <button
            v-for="f in filters"
            :key="f.key"
            class="chip"
            :class="{ on: filter === f.key }"
            @click="filter = f.key"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="mini-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input v-model="keyword" type="text" placeholder="检索文明 / 势力名称…" maxlength="24" />
        </div>
      </div>

      <div class="cx-layout">
        <div class="cx-grid">
          <article
            v-for="c in list"
            :key="c.id"
            class="cx-card card"
            :class="{ on: c.id === currentId }"
            @click="currentId = c.id"
          >
            <div class="cx-top">
              <span class="cx-id">{{ c.id }}</span>
              <span class="st" :class="'st-' + c.status">{{ c.statusText }}</span>
            </div>
            <h4>{{ c.name }}</h4>
            <div class="cx-en">{{ c.en }}</div>
            <p>{{ c.desc }}</p>
            <div class="cx-foot">
              <span>{{ c.type }}</span>
              <b>{{ c.level }}</b>
            </div>
          </article>

          <div v-if="!list.length" class="cx-empty">
            图鉴中没有匹配「{{ keyword }}」的条目，换个关键词试试。
          </div>
        </div>

        <aside class="card cx-detail">
          <div class="cx-dh">
            <span class="cx-id">{{ current.id }} / ENTRY</span>
            <span class="danger-txt">{{ '★'.repeat(current.danger) }}</span>
          </div>
          <h2>{{ current.name }}</h2>
          <div class="cx-den">{{ current.en }} · {{ current.type }}</div>

          <div class="cx-fields">
            <div><span>文明等级</span><b>{{ current.level }}</b></div>
            <div><span>存续状态</span><b>{{ current.statusText }}</b></div>
            <div><span>疆域</span><b>{{ current.span }}</b></div>
            <div><span>危险评估</span><b class="danger-txt">{{ current.danger }} / 5</b></div>
          </div>

          <p class="cx-desc">{{ current.desc }}</p>

          <div class="cx-block">
            <span>关键特征</span>
            <div class="chip-row">
              <em v-for="t in current.traits" :key="t">{{ t }}</em>
            </div>
          </div>

          <div class="cx-block">
            <span>与人类的关系</span>
            <p>{{ current.relation }}</p>
          </div>

          <div class="cx-note">{{ current.note }}</div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { CIVS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'

const filters = [
  { key: 'all', label: '全部条目' },
  { key: 'human', label: '人类' },
  { key: 'alien', label: '异族' },
  { key: 'unknown', label: '未知' }
]

const filter = ref('all')
const keyword = ref('')
const currentId = ref('C-001')

// 优先使用后台管理的数据；后端不可用时兜底本地 lore.js
const civs = ref([...CIVS])
onMounted(async () => {
  try {
    const res = await fetchLore('civs')
    const arr = res.data
    if (Array.isArray(arr) && arr.length) {
      civs.value = arr
    }
  } catch {
    /* 静默降级为本地数据 */
  }
})

const list = computed(() => {
  const k = keyword.value.trim()
  return civs.value.filter((c) => {
    const okType =
      filter.value === 'all' ||
      (filter.value === 'human' && c.type.indexOf('人类') === 0) ||
      (filter.value === 'alien' && c.type.indexOf('异族') === 0) ||
      (filter.value === 'unknown' && c.type.indexOf('未知') === 0)
    const okKey = !k || `${c.name}${c.en}${c.desc}${c.type}`.toLowerCase().includes(k.toLowerCase())
    return okType && okKey
  })
})

const current = computed(() => {
  const hit = civs.value.find((c) => c.id === currentId.value)
  return hit || list.value[0] || civs.value[0]
})
</script>

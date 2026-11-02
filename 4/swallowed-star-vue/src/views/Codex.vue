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

      <!-- 势力概览 -->
      <div class="cx-overview">
        <div class="ov-cell" v-for="t in typeStats" :key="t[0]">
          <span>{{ t[0] }}</span>
          <b>{{ t[1] }}</b>
        </div>
        <div class="ov-cell hostile">
          <span>敌对势力</span>
          <b class="danger-txt">{{ hostileCount }}</b>
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
              <button
                class="fav-btn"
                :class="{ on: favs.has(c.id) }"
                @click.stop="toggleFav(c.id)"
                :title="favs.has(c.id) ? '取消收藏' : '收藏'"
              >{{ favs.has(c.id) ? '★' : '☆' }}</button>
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
          <div class="cx-detail-title">
            <h2>{{ current.name }}</h2>
            <button class="fav-btn big" :class="{ on: favs.has(current.id) }" @click="toggleFav(current.id)">
              {{ favs.has(current.id) ? '★ 已收藏' : '☆ 收藏' }}
            </button>
          </div>
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
  { key: 'unknown', label: '未知' },
  { key: 'fav', label: '★ 已收藏' }
]

const filter = ref('all')
const keyword = ref('')
const currentId = ref('C-001')

// 收藏（本地 localStorage 持久化）
const STORE_KEY = 'ss_codex_favs'
const favs = ref(loadFavs())
function loadFavs() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function saveFavs() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...favs.value]))
}
function toggleFav(id) {
  if (favs.value.has(id)) favs.value.delete(id)
  else favs.value.add(id)
  favs.value = new Set(favs.value)
  saveFavs()
}

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
    let okType = true
    if (filter.value === 'human') okType = c.type.indexOf('人类') === 0
    else if (filter.value === 'alien') okType = c.type.indexOf('异族') === 0
    else if (filter.value === 'unknown') okType = c.type.indexOf('未知') === 0
    else if (filter.value === 'fav') okType = favs.value.has(c.id)
    const okKey = !k || `${c.name}${c.en}${c.desc}${c.type}`.toLowerCase().includes(k.toLowerCase())
    return okType && okKey
  })
})

const current = computed(() => {
  const hit = civs.value.find((c) => c.id === currentId.value)
  return hit || list.value[0] || civs.value[0]
})

// 势力类型统计概览
const typeStats = computed(() => {
  const map = {}
  civs.value.forEach((c) => {
    const t = c.type
    map[t] = (map[t] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
})
const hostileCount = computed(() => civs.value.filter((c) => c.status === 'hostile').length)
</script>

<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">STAR SEA EXPEDITION</div>
        <h1>星海探索</h1>
        <p>七片星域，一张随时会失效的星图。选择坐标、推进探索，把每一次深潜都记进航行日志。</p>
      </header>

      <div class="stat-row">
        <div class="stat-cell">
          <span>已完成星域</span>
          <b>{{ doneCount }} <i>/ {{ regions.length }}</i></b>
        </div>
        <div class="stat-cell">
          <span>平均探索度</span>
          <b>{{ avgProgress }}<i>%</i></b>
        </div>
        <div class="stat-cell">
          <span>当前舰船</span>
          <b class="sm">黑龙级巡洋舰</b>
        </div>
        <div class="stat-cell">
          <span>最高危险评级</span>
          <b class="sm danger-txt">{{ '★'.repeat(maxDanger) }}</b>
        </div>
      </div>

      <div class="rg-layout">
        <!-- 星图 -->
        <section class="card map-card">
          <div class="card-head">
            <h3>星域图</h3>
            <span>点击节点切换星域</span>
          </div>
          <svg viewBox="0 0 640 360" class="star-map">
            <defs>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stop-color="#ffd479" stop-opacity=".5" />
                <stop offset="100%" stop-color="#ffd479" stop-opacity="0" />
              </radialGradient>
            </defs>

            <g class="map-grid">
              <circle cx="320" cy="180" r="66" />
              <circle cx="320" cy="180" r="128" />
              <circle cx="320" cy="180" r="190" />
              <line x1="0" y1="180" x2="640" y2="180" />
              <line x1="320" y1="0" x2="320" y2="360" />
            </g>

            <line
              v-for="l in links"
              :key="l.k"
              :x1="l.x1"
              :y1="l.y1"
              :x2="l.x2"
              :y2="l.y2"
              class="map-link"
            />

            <g
              v-for="r in regions"
              :key="r.id"
              class="map-node"
              :class="{ on: r.id === currentId }"
              @click="select(r.id)"
            >
              <circle
                :cx="r.x"
                :cy="r.y"
                r="30"
                fill="url(#nodeGlow)"
                :opacity="r.id === currentId ? 0.9 : 0"
              />
              <circle
                class="ring"
                :cx="r.x"
                :cy="r.y"
                r="11"
                :stroke="nodeColor(r)"
                :stroke-opacity="r.id === currentId ? 0.9 : 0.35"
              />
              <circle class="core" :cx="r.x" :cy="r.y" r="4.5" :fill="nodeColor(r)" />
              <text :x="r.x" :y="r.y + 26" text-anchor="middle">{{ r.name }}</text>
            </g>
          </svg>

          <div class="map-legend">
            <span><i style="background: #66e0ff" />低危</span>
            <span><i style="background: #ffd479" />中危</span>
            <span><i style="background: #ff6b81" />高危</span>
            <span class="legend-tip">危险度越高，探索收益与失联概率同步上升</span>
          </div>
        </section>

        <!-- 星域详情 -->
        <aside class="card rg-detail">
          <div class="card-head">
            <h3>{{ current.name }}</h3>
            <span class="coord">{{ current.coord }}</span>
          </div>
          <div class="rg-sub">
            <span class="en">{{ current.en }}</span>
            <span class="tag-line">{{ current.type }}</span>
          </div>

          <div class="rg-meta">
            <div>
              <span>危险评级</span>
              <b class="danger-txt">{{ '★'.repeat(current.danger) }}<i>{{ '☆'.repeat(5 - current.danger) }}</i></b>
            </div>
            <div>
              <span>隶属势力</span>
              <b>{{ current.faction }}</b>
            </div>
          </div>

          <p class="rg-desc">{{ current.desc }}</p>

          <div class="rg-res">
            <span>已知资源</span>
            <div class="chip-row">
              <em v-for="res in current.resources" :key="res">{{ res }}</em>
            </div>
          </div>

          <div class="progress-line">
            <div class="pl-top">
              <span>探索进度</span>
              <b>{{ current.progress }}%</b>
            </div>
            <div class="pl-bar"><i :style="{ width: current.progress + '%' }" /></div>
          </div>

          <button class="btn-gold" :disabled="current.progress >= 100" @click="advance">
            {{ current.progress >= 100 ? '该星域已探索完毕' : '推进探索' }}
          </button>
        </aside>
      </div>

      <!-- 航行日志 -->
      <section class="card log-card">
        <div class="card-head">
          <h3>航行日志</h3>
          <span>共 {{ logs.length }} 条记录</span>
        </div>
        <ul class="log-list">
          <li v-for="(l, i) in logs" :key="i" :class="l.type">
            <span class="t">{{ l.time }}</span>
            <span class="dot" />
            <span class="txt">{{ l.text }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { STAR_REGIONS, EXPLORE_LOGS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

const regions = reactive(STAR_REGIONS.map((r) => ({ ...r })))
const currentId = ref('earth')
const logs = ref([...EXPLORE_LOGS])

// 优先使用后台管理的数据；后端不可用时兜底本地 lore.js
onMounted(async () => {
  try {
    const res = await fetchLore('regions')
    const arr = res.data
    if (Array.isArray(arr) && arr.length) {
      regions.splice(0, regions.length, ...arr)
      if (!regions.some((r) => r.id === currentId.value)) {
        currentId.value = regions[0].id
      }
    }
  } catch {
    /* 静默降级为本地数据 */
  }
})

const current = computed(() => regions.find((r) => r.id === currentId.value) || regions[0])
const doneCount = computed(() => regions.filter((r) => r.progress >= 100).length)
const avgProgress = computed(() =>
  Math.round(regions.reduce((sum, r) => sum + r.progress, 0) / regions.length)
)
const maxDanger = computed(() => Math.max(...regions.map((r) => r.danger)))

const linkPairs = [
  ['earth', 'wormhole'],
  ['wormhole', 'cloud'],
  ['wormhole', 'blackdragon'],
  ['blackdragon', 'chaos'],
  ['blackdragon', 'dark'],
  ['chaos', 'ocean'],
  ['cloud', 'chaos']
]

const links = computed(() =>
  linkPairs
    .map(([a, b], i) => {
      const from = regions.find((r) => r.id === a)
      const to = regions.find((r) => r.id === b)
      if (!from || !to) return null
      return { k: 'l' + i, x1: from.x, y1: from.y, x2: to.x, y2: to.y }
    })
    .filter(Boolean)
)

function nodeColor(r) {
  if (r.danger <= 2) return '#66e0ff'
  if (r.danger === 3) return '#ffd479'
  return '#ff6b81'
}

function select(id) {
  currentId.value = id
}

function now() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

function advance() {
  const r = current.value
  if (r.progress >= 100) return
  const step = Math.floor(Math.random() * 6) + 5
  r.progress = Math.min(100, r.progress + step)

  const hit = r.events[Math.floor(Math.random() * r.events.length)]
  if (r.progress >= 100) {
    logs.value.unshift({ time: now(), text: `「${r.name}」探索度达到 100%，已归档为完成星域`, type: 'ok' })
    show(`「${r.name}」探索完毕，数据已归档`, 'ok')
  } else {
    logs.value.unshift({ time: now(), text: `${r.name} · ${hit}`, type: '' })
    show('探索推进 +' + step + '%', 'ok')
  }
  if (logs.value.length > 18) logs.value.pop()
}
</script>

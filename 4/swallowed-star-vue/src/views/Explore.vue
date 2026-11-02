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
          <span>探索能量</span>
          <b class="sm">{{ energy }}<i> / {{ ENERGY_MAX }}</i></b>
          <div class="energy-bar"><i :style="{ width: energy / ENERGY_MAX * 100 + '%' }" /></div>
        </div>
        <div class="stat-cell">
          <span>宇宙币</span>
          <b class="sm coin-txt">{{ coins.toLocaleString() }}</b>
        </div>
      </div>

      <!-- 资源收集面板 -->
      <section class="card res-panel">
        <div class="card-head">
          <h3>资源舱</h3>
          <span>已收集 {{ bag.length }} 种</span>
        </div>
        <div class="res-grid">
          <span v-for="b in bag" :key="b.name" class="res-item">
            <i>{{ b.name }}</i><b>×{{ b.count }}</b>
          </span>
          <span v-if="!bag.length" class="res-empty">尚未收集到任何资源，推进探索以获取星海资源。</span>
        </div>
      </section>

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
            {{ current.progress >= 100 ? '该星域已探索完毕' : energy < ENERGY_COST ? `能量不足（${energy}/${ENERGY_COST}）` : '推进探索（消耗 20 能量）' }}
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
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { STAR_REGIONS, EXPLORE_LOGS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

const regions = reactive(STAR_REGIONS.map((r) => ({ ...r })))
const currentId = ref('earth')
const logs = ref([...EXPLORE_LOGS])

// ---------- 探索增强：能量 / 资源 / 宇宙币 ----------
const ENERGY_MAX = 100
const ENERGY_COST = 20
const energy = ref(ENERGY_MAX)
const coins = ref(0)
const bag = ref([]) // 已收集资源（名称 → 数量）
let energyTimer = null

function addResource(name) {
  const hit = bag.value.find((b) => b.name === name)
  if (hit) hit.count += 1
  else bag.value.push({ name, count: 1 })
}

function startEnergyRegen() {
  stopEnergyRegen()
  energyTimer = setInterval(() => {
    if (energy.value < ENERGY_MAX) {
      energy.value = Math.min(ENERGY_MAX, energy.value + 1)
    }
  }, 5000)
}
function stopEnergyRegen() {
  if (energyTimer) clearInterval(energyTimer)
  energyTimer = null
}

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
  startEnergyRegen()
})

onBeforeUnmount(stopEnergyRegen)

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
  if (energy.value < ENERGY_COST) {
    show('探索能量不足，稍候自动回复', 'err')
    return
  }
  energy.value -= ENERGY_COST

  const step = Math.floor(Math.random() * 6) + 5
  r.progress = Math.min(100, r.progress + step)

  // 资源收集：按危险度随机获得 1-3 种资源
  const gained = []
  const count = Math.min(r.resources.length, Math.floor(Math.random() * 2) + 1)
  const shuffled = [...r.resources].sort(() => Math.random() - 0.5)
  for (let i = 0; i < count; i++) {
    const res = shuffled[i]
    addResource(res)
    gained.push(res)
  }
  // 宇宙币奖励：危险度越高奖励越丰厚
  const coinGain = (Math.floor(Math.random() * 5) + 3) * r.danger
  coins.value += coinGain

  const hit = r.events[Math.floor(Math.random() * r.events.length)]
  const resText = gained.length ? ` · 收集到 ${gained.join('、')}` : ''
  const coinText = ` · 获得 ${coinGain} 宇宙币`

  if (r.progress >= 100) {
    logs.value.unshift({ time: now(), text: `「${r.name}」探索度达到 100%，已归档为完成星域${resText}${coinText}`, type: 'ok' })
    show(`「${r.name}」探索完毕，数据已归档`, 'ok')
  } else {
    logs.value.unshift({ time: now(), text: `${r.name} · ${hit}${resText}${coinText}`, type: '' })
    show(`探索推进 +${step}%${coinText}`, 'ok')
  }
  if (logs.value.length > 18) logs.value.pop()
}
</script>

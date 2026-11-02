<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">CONSCIOUSNESS CULTIVATION</div>
        <h1>意识修炼</h1>
        <p>精神念师的路只有一条：把「想」练成「做」，再把「做」练成「不需要做」。</p>
      </header>

      <!-- 境界阶梯 -->
      <section class="realm-rail card">
        <div
          v-for="(r, i) in realms"
          :key="r.id"
          class="realm-step"
          :class="{ on: r.id === selectedId, passed: i < simIndex }"
          @click="selectedId = r.id"
        >
          <span class="rs-dot" />
          <span class="rs-name">{{ r.name }}</span>
          <span class="rs-en">{{ r.en }}</span>
          <span class="rs-min">{{ fmt(r.min) }}</span>
        </div>
      </section>

      <div class="cul-layout">
        <!-- 境界详情 -->
        <section class="card cul-detail">
          <div class="card-head">
            <h3>{{ selected.name }}</h3>
            <span>{{ selected.en }}</span>
          </div>
          <div class="cul-threshold">
            <span>精神力门槛</span>
            <b>{{ fmt(selected.min) }} 念力单位</b>
          </div>
          <p class="cul-desc">{{ selected.desc }}</p>

          <div class="cul-block">
            <span class="bl">入门条件</span>
            <p>{{ selected.gate }}</p>
          </div>
          <div class="cul-block">
            <span class="bl">能力解锁</span>
            <div class="chip-row">
              <em v-for="p in selected.powers" :key="p">{{ p }}</em>
            </div>
          </div>
          <div class="cul-cost">
            <span>代价</span>
            <p>{{ selected.cost }}</p>
          </div>
        </section>

        <!-- 推演模拟器 -->
        <section class="card cul-sim">
          <div class="card-head">
            <h3>念力推演</h3>
            <span>拖动刻度试算境界</span>
          </div>

          <div class="sim-now">
            <div class="sim-realm">{{ simRealm.name }}</div>
            <div class="sim-power">{{ fmtPower(simPower) }}</div>
          </div>

          <input v-model.number="sim" type="range" min="0" max="100" step="0.5" class="sim-range" />
          <div class="sim-scale">
            <span>1 万</span>
            <span>100 万</span>
            <span>1 亿</span>
            <span>10 亿</span>
          </div>

          <div class="progress-line">
            <div class="pl-top">
              <span>{{ nextRealm ? '距离「' + nextRealm.name + '」' : '已达已知最高境界' }}</span>
              <b>{{ simProgress }}%</b>
            </div>
            <div class="pl-bar"><i :style="{ width: simProgress + '%' }" /></div>
          </div>

          <div class="sim-powers">
            <span class="bl">当前可施展</span>
            <div class="chip-row">
              <em v-for="p in simRealm.powers" :key="p">{{ p }}</em>
            </div>
          </div>

          <p class="sim-tip">
            推演结果仅为精神力数值换算，真正的突破还需要法则感悟——数字到了，人没到，一样是空。
          </p>
        </section>
      </div>

      <!-- 实修冥想 -->
      <section class="card med-card">
        <div class="card-head">
          <h3>实修冥想</h3>
          <span>点击「入定」积累念力，突破境界</span>
        </div>
        <div class="med-body">
          <div class="med-state">
            <div class="med-realm">
              <span>当前境界</span>
              <b>{{ medCurRealm.name }}</b>
            </div>
            <div class="med-power">
              <span>念力修为</span>
              <b>{{ fmtPower(power) }}</b>
            </div>
          </div>

          <div class="progress-line">
            <div class="pl-top">
              <span>{{ medNextRealm ? '距离「' + medNextRealm.name + '」' : '已达已知最高境界' }}</span>
              <b>{{ breakthroughProgress }}%</b>
            </div>
            <div class="pl-bar"><i :style="{ width: breakthroughProgress + '%' }" /></div>
          </div>

          <div class="med-actions">
            <button class="btn-gold" :class="{ active: meditating }" @click="toggleMeditate">
              {{ meditating ? '■ 出定（暂停）' : '◎ 入定（开始冥想）' }}
            </button>
            <button class="mj-btn ghost" @click="resetPower">归零重练</button>
          </div>

          <p class="med-tip">
            冥想时念力持续增长，但越接近瓶颈增长越慢——真正的突破，靠的是法则感悟，不只是时间。
          </p>
        </div>
      </section>

      <!-- 秘法 -->
      <h3 class="sec-sub">秘法传承 · ARTS</h3>
      <div class="arts">
        <article v-for="a in arts" :key="a.name" class="art card">
          <div class="art-top">
            <span>{{ a.type }}</span>
            <em>{{ a.from }}</em>
          </div>
          <h4>{{ a.name }}</h4>
          <p>{{ a.desc }}</p>
          <div class="art-risk">{{ a.risk }}</div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { REALMS, ARTS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

// 优先使用后台管理的数据；后端不可用时兜底本地 lore.js
// 后台的「意识修炼」模块同时维护境界与其秘法，秘法随境界一起返回
const realms = ref([...REALMS])
const arts = ref([...ARTS])
onMounted(async () => {
  try {
    const res = await fetchLore('realms')
    const arr = res.data
    if (!Array.isArray(arr) || !arr.length) return

    const arrOf = (v) => (Array.isArray(v) ? v : [])
    realms.value = arr.map((r) => ({
      ...r,
      powers: arrOf(r.powers),
      arts: arrOf(r.arts),
      min: Number(r.min) || 0
    }))

    // 汇总各境界下的秘法；若后台没有维护秘法，则沿用本地演示数据
    const merged = []
    const seen = new Set()
    realms.value.forEach((r) => {
      r.arts.forEach((a) => {
        if (!a || !a.name || seen.has(a.name)) return
        seen.add(a.name)
        merged.push(a)
      })
    })
    if (merged.length) arts.value = merged

    if (!realms.value.some((r) => r.id === selectedId.value)) {
      selectedId.value = realms.value[0].id
    }
  } catch {
    /* 静默降级为本地数据 */
  }
})

onBeforeUnmount(stopMeditate)

const selectedId = ref('shape')
const selected = computed(
  () => realms.value.find((r) => r.id === selectedId.value) || realms.value[0]
)

/* 滑杆 0–100 映射到 1 万 – 10 亿（对数刻度） */
const sim = ref(44)
const simPower = computed(() => Math.pow(10, sim.value / 20))

const simIndex = computed(() => {
  let idx = 0
  realms.value.forEach((r, i) => {
    if (simPower.value >= r.min) idx = i
  })
  return idx
})
const simRealm = computed(() => realms.value[simIndex.value])
const nextRealm = computed(() => realms.value[simIndex.value + 1] || null)

const simProgress = computed(() => {
  const cur = simRealm.value
  const nxt = nextRealm.value
  if (!nxt) return 100
  const ratio = (simPower.value - cur.min) / (nxt.min - cur.min)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
})

function fmt(v) {
  if (v >= 10000) return (v / 10000).toFixed(v % 10000 === 0 ? 0 : 2) + ' 亿'
  return v + ' 万'
}

function fmtPower(v) {
  if (v >= 10000) return (v / 10000).toFixed(2) + ' 亿 念力单位'
  return v.toFixed(v < 10 ? 2 : 0) + ' 万 念力单位'
}

// ---------- 增强：实修冥想系统 ----------
const STORE_KEY = 'ss_cultivate_power'
const power = ref(loadPower())
const meditating = ref(false)
let meditateTimer = null

function loadPower() {
  const v = parseFloat(localStorage.getItem(STORE_KEY))
  return isFinite(v) && v > 0 ? v : 1
}
function savePower() {
  localStorage.setItem(STORE_KEY, String(power.value))
}

// 当前境界与下一境界（按 real 的 min 阈值）
const medCurRealm = computed(() => {
  let idx = 0
  realms.value.forEach((r, i) => {
    if (power.value >= r.min) idx = i
  })
  return realms.value[idx]
})
const medNextRealm = computed(() => {
  let idx = 0
  realms.value.forEach((r, i) => {
    if (power.value >= r.min) idx = i
  })
  return realms.value[idx + 1] || null
})
const breakthroughProgress = computed(() => {
  const cur = medCurRealm.value
  const nxt = medNextRealm.value
  if (!nxt) return 100
  const ratio = (power.value - cur.min) / (nxt.min - cur.min)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
})

function toggleMeditate() {
  if (meditating.value) stopMeditate()
  else startMeditate()
}
function startMeditate() {
  meditating.value = true
  meditateTimer = setInterval(() => {
    // 每次冥想：当前值递增，越接近瓶颈增长越慢
    const cur = medCurRealm.value
    const nxt = medNextRealm.value
    if (!nxt) {
      stopMeditate()
      return
    }
    const span = nxt.min - cur.min
    const step = Math.max(1, span * 0.02)
    power.value = Math.min(nxt.min, power.value + step)
    savePower()
    if (power.value >= nxt.min) {
      // 突破
      showBreakthrough(nxt)
    }
  }, 600)
}
function stopMeditate() {
  meditating.value = false
  if (meditateTimer) clearInterval(meditateTimer)
  meditateTimer = null
  savePower()
}
function showBreakthrough(realm) {
  show(`✦ 念力突破！踏入「${realm.name}」`, 'ok')
}

function resetPower() {
  power.value = 1
  savePower()
  stopMeditate()
}
</script>

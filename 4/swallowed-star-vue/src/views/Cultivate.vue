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

      <!-- 闭关修炼：消耗宇宙币，一境一境往上走 -->
      <section class="card med-card">
        <div class="card-head">
          <h3>闭关修炼</h3>
          <span>每次修炼消耗宇宙币；念力圆满后另付突破费用，方可晋升一境</span>
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
            <div class="med-wallet">
              <span>宇宙币余额</span>
              <b>{{ coins.toLocaleString() }}</b>
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
            <button class="btn-gold" :disabled="!medNextRealm" @click="cultivate">
              {{ medNextRealm ? '闭关修炼 · ' + cultivateCost.toLocaleString() + ' 宇宙币' : '已至最高境界' }}
            </button>
            <button class="mj-btn" :disabled="!medNextRealm" @click="breakthrough">
              {{
                medNextRealm
                  ? '突破「' + medNextRealm.name + '」· ' + breakthroughCost.toLocaleString() + ' 宇宙币'
                  : '无境可破'
              }}
            </button>
            <button class="mj-btn ghost" @click="resetPower">归零重练</button>
          </div>

          <p class="med-tip">
            单次修炼：消耗 {{ cultivateCost.toLocaleString() }} 宇宙币，念力 +{{
              gainPerClick.toFixed(2)
            }}
            万；念力攒满当前境界（100%）后，再支付 {{ breakthroughCost.toLocaleString() }} 宇宙币才能突破。
            境界越高，修炼与突破越贵，且一次只能晋升一境。
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
import { computed, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { REALMS, ARTS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'
import { useToast } from '../composables/useToast.js'
import { useWallet } from '../composables/useWallet.js'

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

// ---------- 闭关修炼：消耗宇宙币，一境一境往上走 ----------
const { coins, spend } = useWallet()

const POWER_KEY = 'ss_cultivate_power'
const REALM_KEY = 'ss_cultivate_realm'

const power = ref(loadPower())
// 当前境界序号单独存：突破只能 +1，不会因为念力数值变大而自动跳级
const realmIdx = ref(loadRealmIdx())

function loadPower() {
  const v = parseFloat(localStorage.getItem(POWER_KEY))
  return isFinite(v) && v > 0 ? v : 1
}

// 兼容旧存档：没有境界序号记录时，按念力阈值反推一次
function loadRealmIdx() {
  const saved = parseInt(localStorage.getItem(REALM_KEY), 10)
  if (isFinite(saved) && saved >= 0) return saved
  const p = loadPower()
  let idx = 0
  REALMS.forEach((r, i) => {
    if (p >= r.min) idx = i
  })
  return idx
}

function saveProgress() {
  localStorage.setItem(POWER_KEY, String(power.value))
  localStorage.setItem(REALM_KEY, String(realmIdx.value))
}

// 防止后台删减境界后序号越界
const curIdx = computed(() => Math.min(realmIdx.value, Math.max(0, realms.value.length - 1)))
const medCurRealm = computed(() => realms.value[curIdx.value])
const medNextRealm = computed(() => realms.value[curIdx.value + 1] || null)

const breakthroughProgress = computed(() => {
  const cur = medCurRealm.value
  const nxt = medNextRealm.value
  if (!nxt) return 100
  const ratio = (power.value - cur.min) / (nxt.min - cur.min)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
})

// 价格梯度：觉醒境 200 / 次、突破 1 万；每升一境各 +200 / +1 万
const cultivateCost = computed(() => 200 * (curIdx.value + 1))
const breakthroughCost = computed(() => 10000 * (curIdx.value + 1))
// 单次收益 = 当前境界跨度的 5%，约 20 次修炼攒满一境（保证是「一步一步」而不是一步登天）
const gainPerClick = computed(() => {
  const cur = medCurRealm.value
  const nxt = medNextRealm.value
  if (!nxt) return 0
  return Math.max(0.1, (nxt.min - cur.min) * 0.05)
})

function cultivate() {
  const nxt = medNextRealm.value
  if (!nxt) {
    show('已至已知最高境界，无需再修炼')
    return
  }
  if (breakthroughProgress.value >= 100) {
    show('念力已至瓶颈，请先完成突破', 'err')
    return
  }
  const cost = cultivateCost.value
  if (!spend(cost)) {
    show(`宇宙币不足，本次修炼需要 ${cost.toLocaleString()} 宇宙币`, 'err')
    return
  }
  power.value = Math.min(nxt.min, Number((power.value + gainPerClick.value).toFixed(2)))
  saveProgress()

  if (power.value >= nxt.min) {
    show(`念力圆满，可支付 ${breakthroughCost.value.toLocaleString()} 宇宙币突破「${nxt.name}」`, 'ok')
  } else {
    show(`闭关一日，念力 +${gainPerClick.value.toFixed(2)} 万，消耗 ${cost.toLocaleString()} 宇宙币`)
  }
}

function breakthrough() {
  const nxt = medNextRealm.value
  if (!nxt) {
    show('已至已知最高境界，无境可破')
    return
  }
  if (breakthroughProgress.value < 100) {
    show('念力尚未圆满，继续闭关修炼', 'err')
    return
  }
  const cost = breakthroughCost.value
  if (!spend(cost)) {
    show(`宇宙币不足，突破需要 ${cost.toLocaleString()} 宇宙币`, 'err')
    return
  }
  realmIdx.value = curIdx.value + 1
  power.value = nxt.min
  saveProgress()
  show(`✦ 突破成功！踏入「${nxt.name}」`, 'ok')
}

function resetPower() {
  realmIdx.value = 0
  power.value = 1
  saveProgress()
  show('已归零重练，回到觉醒境（已消耗的宇宙币不退还）')
}
</script>

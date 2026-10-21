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
          v-for="(r, i) in REALMS"
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

      <!-- 秘法 -->
      <h3 class="sec-sub">秘法传承 · ARTS</h3>
      <div class="arts">
        <article v-for="a in ARTS" :key="a.name" class="art card">
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
import { computed, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { REALMS, ARTS } from '../data/lore.js'

const selectedId = ref('shape')
const selected = computed(() => REALMS.find((r) => r.id === selectedId.value) || REALMS[0])

/* 滑杆 0–100 映射到 1 万 – 10 亿（对数刻度） */
const sim = ref(44)
const simPower = computed(() => Math.pow(10, sim.value / 20))

const simIndex = computed(() => {
  let idx = 0
  REALMS.forEach((r, i) => {
    if (simPower.value >= r.min) idx = i
  })
  return idx
})
const simRealm = computed(() => REALMS[simIndex.value])
const nextRealm = computed(() => REALMS[simIndex.value + 1] || null)

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
</script>

<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">CHARACTER ARCHIVE</div>
        <h1>人物档案</h1>
        <p>星海里的每一个人，都是一段被逼出来的历史。这里记录他们的来路、执念，以及代价。</p>
      </header>

      <div class="chr-toolbar">
        <div class="chips">
          <button
            v-for="c in camps"
            :key="c"
            class="chip"
            :class="{ on: campFilter === c }"
            @click="campFilter = c"
          >
            {{ c === 'all' ? '全部阵营' : c }}
          </button>
        </div>
      </div>

      <div class="chr-tabs">
        <button
          v-for="c in filteredChars"
          :key="c.id"
          class="chr-tab"
          :class="{ on: c.id === currentId, cmp: compareIds.includes(c.id) }"
          @click="currentId = c.id"
        >
          <span class="gt">{{ c.glyph }}</span>
          {{ c.name }}
        </button>
      </div>

      <div :key="current.id" class="chr-layout">
        <!-- 档案卡 -->
        <aside class="card chr-card">
          <div class="chr-photo">
            <span class="chr-glyph">{{ current.glyph }}</span>
            <span class="scan" />
            <i class="corner c1" /><i class="corner c2" /><i class="corner c3" /><i class="corner c4" />
          </div>
          <div class="chr-card-body">
            <div class="row"><span>NAME</span><b>{{ current.en }}</b></div>
            <div class="row"><span>REALM</span><b>{{ current.realm }}</b></div>
            <div class="row"><span>CAMP</span><b>{{ current.camp }}</b></div>
            <div class="row"><span>STATUS</span><b class="ok">在册</b></div>
          </div>
        </aside>

        <!-- 主信息 -->
        <section class="chr-main">
          <div class="chr-title">
            <h2>{{ current.name }}</h2>
            <span class="chr-sub">{{ current.title }}</span>
            <button class="cmp-btn" :class="{ on: compareIds.includes(current.id) }" @click="toggleCompare(current.id)">
              {{ compareIds.includes(current.id) ? '✓ 对比中' : '+ 加入对比' }}
            </button>
          </div>

          <div class="chip-row chr-tags">
            <em v-for="t in current.tags" :key="t">{{ t }}</em>
          </div>

          <blockquote class="chr-quote">{{ current.quote }}</blockquote>

          <div class="chr-intro">
            <p v-for="(p, i) in current.intro" :key="i">{{ p }}</p>
          </div>

          <div class="chr-stats">
            <div v-for="s in current.stats" :key="s.label" class="stat">
              <div class="st-top">
                <span>{{ s.label }}</span>
                <b>{{ s.value }}</b>
              </div>
              <div class="st-bar"><i :style="{ width: s.value + '%' }" /></div>
            </div>
          </div>

          <div class="chr-ability">
            <span class="bl">能力体系</span>
            <div class="chip-row">
              <em v-for="a in current.ability" :key="a">{{ a }}</em>
            </div>
          </div>
        </section>
      </div>

      <div class="chr-bottom">
        <section class="card">
          <div class="card-head">
            <h3>关键节点</h3>
            <span>TIMELINE</span>
          </div>
          <div class="chr-timeline">
            <div v-for="(t, i) in current.timeline" :key="i" class="tl">
              <span class="tl-year">{{ t.year }}</span>
              <div class="tl-body">
                <h5>{{ t.title }}</h5>
                <p>{{ t.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-head">
            <h3>关系网络</h3>
            <span>RELATIONS</span>
          </div>
          <ul class="relation-list">
            <li v-for="r in current.relations" :key="r">
              <span class="rl-dot" />{{ r }}
            </li>
          </ul>
        </section>
      </div>

      <!-- 人物对比 -->
      <section class="card cmp-panel">
        <div class="card-head">
          <h3>人物对比</h3>
          <span>{{ compareList.length }}/2 已选 · 点击「+ 加入对比」选择</span>
        </div>
        <div v-if="compareList.length" class="cmp-table">
          <div class="cmp-row cmp-head">
            <span class="cmp-label">属性</span>
            <div v-for="c in compareList" :key="c.id" class="cmp-col">
              <b>{{ c.glyph }} {{ c.name }}</b>
              <em>{{ c.realm }}</em>
            </div>
          </div>
          <div class="cmp-row" v-for="label in compareLabels" :key="label">
            <span class="cmp-label">{{ label }}</span>
            <div v-for="c in compareList" :key="c.id" class="cmp-col">
              <span class="cmp-val">{{ statOf(c, label) }}</span>
              <div class="cmp-bar"><i :style="{ width: statOf(c, label) + '%' }" /></div>
            </div>
          </div>
        </div>
        <div v-else class="cart-empty">
          <span>◇</span>
          尚未选择对比对象。在人物卡片右上角点击「+ 加入对比」，最多可对比两人。
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { CHARACTERS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'

// 优先使用后台管理的数据；后端不可用时兜底本地 lore.js
const characters = ref([...CHARACTERS])

// 后台新增人物若部分字段留空，给出兜底，避免前台渲染异常
function normalize(list) {
  const arr = (v) => (Array.isArray(v) ? v : [])
  return list.map((c) => ({
    ...c,
    glyph: c.glyph || (c.name || '星')[0],
    tags: arr(c.tags),
    ability: arr(c.ability),
    relations: arr(c.relations),
    intro: arr(c.intro),
    stats: arr(c.stats),
    timeline: arr(c.timeline)
  }))
}

onMounted(async () => {
  try {
    const res = await fetchLore('characters')
    const arr = res.data
    if (Array.isArray(arr) && arr.length) {
      characters.value = normalize(arr)
      if (!characters.value.some((c) => c.id === currentId.value)) {
        currentId.value = characters.value[0].id
      }
    }
  } catch {
    /* 静默降级为本地数据 */
  }
})

const currentId = ref('luofeng')
const current = computed(
  () => characters.value.find((c) => c.id === currentId.value) || characters.value[0]
)

// ---------- 增强：阵营筛选 + 人物对比 ----------
const campFilter = ref('all')
const camps = computed(() => {
  const set = new Set()
  characters.value.forEach((c) => {
    const camp = c.camp ? c.camp.split('·').map((s) => s.trim())[0] : '其他'
    set.add(camp)
  })
  return ['all', ...set]
})
function campOf(c) {
  return c.camp ? c.camp.split('·').map((s) => s.trim())[0] : '其他'
}
const filteredChars = computed(() => {
  if (campFilter.value === 'all') return characters.value
  return characters.value.filter((c) => campOf(c) === campFilter.value)
})

// 对比：最多选两人
const compareIds = ref([])
function toggleCompare(id) {
  const i = compareIds.value.indexOf(id)
  if (i >= 0) compareIds.value.splice(i, 1)
  else {
    if (compareIds.value.length >= 2) compareIds.value.shift()
    compareIds.value.push(id)
  }
}
const compareList = computed(() =>
  compareIds.value.map((id) => characters.value.find((c) => c.id === id)).filter(Boolean)
)
// 对比用的统一 stats 标签（并集）
const compareLabels = computed(() => {
  const set = new Set()
  compareList.value.forEach((c) => c.stats.forEach((s) => set.add(s.label)))
  return [...set]
})
function statOf(c, label) {
  const s = c.stats.find((x) => x.label === label)
  return s ? s.value : 0
}
</script>

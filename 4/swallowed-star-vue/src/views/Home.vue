<template>
  <!-- ===== 顶部导航栏 ===== -->
  <SiteNav />

  <!-- ===== 首页主体（可滚动） ===== -->
  <main class="home-shell">
    <!-- 首屏：欢迎 + 搜索栏 -->
    <section class="home-hero">
      <h2>欢迎归来，{{ nickname }}</h2>
      <p class="sub">你已穿越虫洞，进入 <b>吞噬星空</b> 星域核心 · 检索星海数据，开启你的征途</p>

      <div class="hero-stats">
        <span>档案库收录 <b>{{ overview.totalEntries }}</b> 条</span>
        <i></i>
        <span><b>{{ overview.categoryCount }}</b> 大分类</span>
        <i></i>
        <span>数据源 · 星域档案库</span>
      </div>

      <div class="search-wrap">
        <span class="ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        </span>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索 武者 / 星球 / 秘法 / 组织 / 法则 …"
          maxlength="40"
          @keyup.enter="doSearch"
        >
        <button class="btn-search" @click="doSearch">检 索</button>
      </div>

      <div v-if="overview.hotWords && overview.hotWords.length" class="hot-row">
        <span class="tag">星域热词</span>
        <button v-for="w in overview.hotWords" :key="w" class="hot-chip" @click="pickHot(w)">{{ w }}</button>
      </div>

      <div class="cat-row">
        <button
          v-for="c in categoryList"
          :key="c.name"
          class="cat-chip"
          :class="{ on: category === c.name }"
          @click="pickCat(c.name)"
        >
          {{ c.name }}<em>{{ c.count }}</em>
        </button>
      </div>
    </section>

    <!-- 模块入口 -->
    <section class="mod-entries">
      <router-link v-for="m in modules" :key="m.to" :to="m.to" class="mod-entry">
        <span class="me-ico">{{ m.icon }}</span>
        <div>
          <b>{{ m.name }}</b>
          <em>{{ m.desc }}</em>
        </div>
        <span class="me-go">→</span>
      </router-link>
    </section>

    <!-- 检索结果 -->
    <section class="result-zone">
      <div class="result-head">
        <h3 v-if="searched">检索「<b>{{ searched }}</b>」 · 共 <b>{{ total }}</b> 条</h3>
        <h3 v-else>星域档案 · 共 <b>{{ total }}</b> 条</h3>
        <div class="result-tools">
          <button
            v-for="s in sorts"
            :key="s.key"
            :class="{ on: sort === s.key }"
            @click="pickSort(s.key)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="card-grid">
        <div v-for="i in 6" :key="i" class="star-card skeleton">
          <div class="sk-glyph"></div>
          <div class="sk-line w70"></div>
          <div class="sk-line"></div>
          <div class="sk-line w90"></div>
        </div>
      </div>

      <!-- 出错 -->
      <div v-else-if="error" class="err-box">
        <span class="big">⚠</span>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="reload">重新加载</button>
      </div>

      <!-- 列表 -->
      <div v-else-if="entries.length" class="card-grid">
        <article
          v-for="(item, i) in entries"
          :key="item.id"
          class="star-card"
          :style="{ animationDelay: (i * 0.05) + 's' }"
          @click="openCard(item)"
        >
          <span class="cat-badge" :style="badgeStyle(item)">{{ item.category }}</span>
          <div class="glyph" :style="glyphStyle(item)">{{ item.glyph }}</div>
          <h4>{{ item.name }}</h4>
          <p>{{ item.summary }}</p>
          <div class="card-foot">
            <span class="go">查看详情 →</span>
            <span class="hot">热度 {{ item.hotScore }}</span>
          </div>
        </article>
      </div>

      <!-- 空结果 -->
      <div v-else class="empty-box">
        <span class="big">✧</span>
        <template v-if="searched || category !== '全部'">
          未检索到「{{ searched || category }}」相关的星域数据，换个关键词试试
        </template>
        <template v-else>星域档案库暂时没有数据，请稍后再试</template>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && !error && pages > 1" class="pager">
        <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span>第 <b>{{ page }}</b> / {{ pages }} 页</span>
        <button :disabled="page >= pages" @click="changePage(page + 1)">下一页</button>
      </div>
    </section>
  </main>

  <!-- 条目详情 -->
  <Teleport to="body">
    <div v-if="detail" class="em-mask" @click.self="closeDetail">
      <div class="em-panel">
        <button class="em-close" @click="closeDetail">×</button>
        <div class="em-top">
          <span class="em-glyph" :style="glyphStyle(detail)">{{ detail.glyph }}</span>
          <div class="em-head">
            <span class="em-cat" :style="badgeStyle(detail)">{{ detail.category }}</span>
            <h3>{{ detail.name }}</h3>
          </div>
        </div>

        <div class="chip-row em-tags">
          <em v-for="t in detail.tags" :key="t">{{ t }}</em>
        </div>

        <p class="em-summary">{{ detail.summary }}</p>
        <div class="em-detail">{{ detail.detail }}</div>

        <div class="em-foot">
          <span>热度 <b>{{ detail.hotScore }}</b></span>
          <span>浏览 <b>{{ detail.viewCount }}</b></span>
          <span class="em-src">星域档案库 · {{ detail.category }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SiteNav from '../components/SiteNav.vue'
import { getSession, fetchMe, logout } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import { fetchOverview, fetchEntries, fetchEntry } from '../api/home.js'

const router = useRouter()
const { show } = useToast()

/* ===== 用户会话（token 失效自动退回登录页） ===== */
const session = getSession()
const nickname = ref((session && (session.nickname || session.username)) || '星际战士')

/* ===== 首页数据 ===== */
const overview = ref({ totalEntries: 0, categoryCount: 0, categories: [], hotWords: [], featured: [] })
const entries = ref([])
const total = ref(0)
const pages = ref(0)
const page = ref(1)
const PAGE_SIZE = 12

const keyword = ref('')
const searched = ref('')
const category = ref('全部')
const sort = ref('')
const loading = ref(false)
const error = ref('')

const detail = ref(null)

const sorts = [
  { key: '', label: '综合' },
  { key: 'hot', label: '最热' },
  { key: 'new', label: '最新' }
]

const categoryList = computed(() => [
  { name: '全部', count: overview.value.totalEntries || 0 },
  ...(overview.value.categories || [])
])

const CAT_COLORS = {
  武者: '#ffd479',
  星球: '#66e0ff',
  秘法: '#a97bff',
  法则: '#7ee0b8',
  组织: '#4ade80',
  智能: '#f5a623',
  秘境: '#ff8fb1'
}

async function loadOverview() {
  try {
    const res = await fetchOverview()
    if (res && res.data) overview.value = res.data
  } catch (e) {
    // 概览失败不阻塞列表，仅提示
    show('首页概览加载失败：' + e.message, 'err')
  }
}

async function loadEntries() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchEntries({
      keyword: searched.value,
      category: category.value,
      sort: sort.value,
      page: page.value,
      size: PAGE_SIZE
    })
    const d = (res && res.data) || {}
    entries.value = d.list || []
    total.value = d.total || 0
    pages.value = d.pages || 0
  } catch (e) {
    error.value = e.message || '星域数据加载失败'
    entries.value = []
    total.value = 0
    pages.value = 0
  } finally {
    loading.value = false
  }
}

function reload() {
  loadOverview()
  loadEntries()
}

function doSearch() {
  searched.value = keyword.value.trim()
  page.value = 1
  loadEntries()
}

function pickHot(word) {
  keyword.value = word
  doSearch()
}

function pickCat(name) {
  if (category.value === name) return
  category.value = name
  page.value = 1
  loadEntries()
}

function pickSort(key) {
  if (sort.value === key) return
  sort.value = key
  page.value = 1
  loadEntries()
}

function changePage(n) {
  if (n < 1 || n > pages.value || n === page.value) return
  page.value = n
  loadEntries()
  const el = document.querySelector('.result-zone')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ===== 详情：先用列表数据秒开，再用详情接口补全 ===== */
async function openCard(item) {
  detail.value = item
  try {
    const res = await fetchEntry(item.id)
    if (res && res.data) detail.value = res.data
  } catch (e) {
    show('详情加载失败：' + e.message, 'err')
  }
}

function closeDetail() {
  detail.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape') closeDetail()
}

/* ===== 样式辅助 ===== */
function badgeStyle(item) {
  const c = CAT_COLORS[item.category] || '#8b98bf'
  return { color: c, border: `1px solid ${c}44`, background: `${c}14` }
}

function glyphStyle(item) {
  const c = CAT_COLORS[item.category] || '#8b98bf'
  return { color: c, background: `${c}18`, border: `1px solid ${c}33`, boxShadow: `0 0 16px ${c}22` }
}

/* ===== 模块入口 ===== */
const modules = [
  { to: '/explore', name: '星海探索', desc: '七片星域 · 星图与航行日志', icon: '🧭' },
  { to: '/codex', name: '文明图鉴', desc: '人类 / 异族 / 未知者档案', icon: '📖' },
  { to: '/market', name: '奇物交易', desc: '兵器 · 传承 · 材料 · 载具', icon: '💎' },
  { to: '/cultivate', name: '意识修炼', desc: '七境阶梯 · 念力推演', icon: '🧠' },
  { to: '/character', name: '人物档案', desc: '罗峰与同行者的人物志', icon: '👤' }
]

onMounted(async () => {
  loadOverview()
  loadEntries()
  window.addEventListener('keydown', onKeydown)

  // 用 token 向后端校验登录态，失效则退回登录页
  const me = await fetchMe()
  if (!me) {
    logout()
    router.push('/login')
  } else {
    nickname.value = me.nickname || me.username || nickname.value
  }
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

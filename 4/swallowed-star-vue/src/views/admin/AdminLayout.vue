<template>
  <div class="admin-shell">
    <!-- 侧边栏 -->
    <aside class="admin-side">
      <div class="side-brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd479" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <b>星域中枢</b>
        <span class="side-sub">ADMIN CONSOLE</span>
      </div>

      <nav class="side-menu">
        <div class="side-group">数据管理</div>
        <router-link
          v-for="m in ADMIN_MODULES"
          :key="m.key"
          :to="`/admin/${m.key}`"
          class="side-item"
          :class="{ active: current.key === m.key }"
        >
          <span class="side-icon"><AppIcon :emoji="m.icon" :size="20" /></span>
          <span class="side-label">{{ m.title }}</span>
        </router-link>
        <div class="side-group">功能中心</div>
        <router-link
          v-for="v in ADMIN_VIEWS"
          :key="v.key"
          :to="`/admin/${v.key}`"
          class="side-item"
          :class="{ active: current.key === v.key }"
        >
          <span class="side-icon"><AppIcon :emoji="v.icon" :size="20" /></span>
          <span class="side-label">{{ v.title }}</span>
        </router-link>
        <router-link to="/admin/config" class="side-item" :class="{ active: current.key === 'config' }">
          <span class="side-icon"><AppIcon emoji="⚙️" :size="20" /></span>
          <span class="side-label">功能配置</span>
        </router-link>
      </nav>

      <div class="side-foot">
        <router-link class="side-link" to="/home">← 返回前台星域</router-link>
      </div>
    </aside>

    <!-- 主区 -->
    <div class="admin-main">
      <header class="admin-topbar">
        <h2>{{ current.title }} <span class="topbar-en">{{ current.subtitle }}</span></h2>
        <div class="topbar-user">
          <span class="avatar">{{ avatarChar }}</span>
          <span class="name">{{ adminName }}</span>
          <button class="btn mini" @click="doLogout">退出后台</button>
        </div>
      </header>

      <main class="admin-content" :class="{ 'is-view': isView, 'is-config': isConfig }">
        <!-- 数据概览：仅数据管理模块显示实时记录数 -->
        <section class="overview" v-if="!isView && !isConfig">
          <button
            v-for="m in ADMIN_MODULES"
            :key="'ov-' + m.key"
            class="ov-card"
            :class="{ active: current.key === m.key }"
            @click="$router.push('/admin/' + m.key)"
          >
            <span class="ov-icon"><AppIcon :emoji="m.icon" :size="30" /></span>
            <span class="ov-body">
              <b>{{ m.title }}</b>
              <em>{{ counts[m.key] === null ? '—' : counts[m.key] + ' 条记录' }}</em>
            </span>
            <span class="ov-arrow">›</span>
          </button>
        </section>

        <p class="mod-desc">{{ current.desc }}</p>

        <!-- 功能配置：统一配置编辑界面 -->
        <AdminConfig v-if="isConfig" />

        <!-- 数据管理：通用 CRUD 表格 -->
        <AdminCrud v-else-if="!isView" :key="current.key" :mod="current" />

        <!-- 功能中心：嵌入前台完整交互页面 -->
        <div v-else class="embed-view">
          <component :is="current.component" :key="current.key" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_MODULES, ADMIN_VIEWS } from '../../admin/modules.js'
import { adminLogout, adminMe, clearAdminToken, fetchAdminPage } from '../../api/admin.js'
import AdminCrud from './AdminCrud.vue'
import AppIcon from '../../components/AppIcon.vue'
import StarGame from '../StarGame.vue'
import BattleArena from '../BattleArena.vue'
import PowerRank from '../PowerRank.vue'
import AnimeZone from '../AnimeZone.vue'
import UserDirectory from '../UserDirectory.vue'
import AdminConfig from './AdminConfig.vue'

const CONFIG_META = { key: 'config', title: '功能配置', icon: '⚙️', subtitle: 'FEATURE CONFIG',
  desc: '统一配置 5 个功能页的数值参数、内容数据与功能开关。' }

const route = useRoute()
const router = useRouter()

const VIEW_COMPONENTS = {
  treasure: StarGame,
  battle: BattleArena,
  rank: PowerRank,
  anime: AnimeZone,
  members: UserDirectory
}

// 数据模块 + 功能页统一匹配（保证直接访问 /admin/xxx 时内容与侧边栏一致）
const ALL_MODULES = [...ADMIN_MODULES, ...ADMIN_VIEWS, CONFIG_META]
const current = computed(() => {
  const found =
    ALL_MODULES.find((m) => route.path === `/admin/${m.key}`) ||
    ALL_MODULES.find((m) => route.path.startsWith(`/admin/${m.key}`)) ||
    ADMIN_MODULES[0]
  // 功能页挂上对应组件供内容区动态渲染
  return found.type === 'view' ? { ...found, component: VIEW_COMPONENTS[found.key] } : found
})
const isView = computed(() => current.value.type === 'view')
const isConfig = computed(() => current.value.key === 'config')

const adminName = ref('管理员')
const avatarChar = computed(() => (adminName.value || '管')[0])

// 各模块记录数（复用现有列表接口 size=1 拿 total，无需新增后端接口）
const counts = ref(Object.fromEntries(ADMIN_MODULES.map((m) => [m.key, null])))
async function loadCounts() {
  await Promise.all(
    ADMIN_MODULES.map(async (m) => {
      try {
        const res = await fetchAdminPage(m.key, { page: 1, size: 1 })
        counts.value[m.key] = res.data.total || 0
      } catch {
        counts.value[m.key] = '—'
      }
    })
  )
}

async function loadMe() {
  try {
    const res = await adminMe()
    adminName.value = res.data.nickname || res.data.username || '管理员'
  } catch {
    /* 静默：守卫会处理未登录 */
  }
}

async function doLogout() {
  try {
    await adminLogout()
  } catch {
    /* 忽略 */
  }
  clearAdminToken()
  router.push('/admin/login')
}

function onUnauthorized() {
  clearAdminToken()
  router.push('/admin/login')
}

let authTimer = null
onMounted(() => {
  loadMe()
  loadCounts()
  // 每 5 分钟校验一次会话有效性
  authTimer = setInterval(loadMe, 5 * 60 * 1000)
  window.addEventListener('admin-unauthorized', onUnauthorized)
})
onBeforeUnmount(() => {
  clearInterval(authTimer)
  window.removeEventListener('admin-unauthorized', onUnauthorized)
})
</script>

<style scoped>
.admin-shell {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.admin-side {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--panel-line);
  background: rgba(8, 12, 30, 0.82);
  backdrop-filter: blur(10px);
  padding: 22px 14px;
}
.side-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px 18px;
  border-bottom: 1px solid var(--panel-line);
  color: var(--gold);
}
.side-brand b {
  font-size: 17px;
  letter-spacing: 0.12em;
}
.side-sub {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.28em;
}
.side-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
  flex: 1;
  overflow-y: auto;
}
.side-group {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--muted);
  padding: 10px 14px 4px;
  opacity: 0.7;
}
.side-group:not(:first-child) {
  margin-top: 8px;
  border-top: 1px solid var(--panel-line);
  padding-top: 14px;
}
.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 12px;
  color: var(--muted);
  font-size: 14px;
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.side-item:hover {
  color: var(--text);
  background: rgba(102, 224, 255, 0.06);
}
.side-item.active {
  color: var(--gold);
  background: rgba(255, 212, 121, 0.1);
  border-color: rgba(255, 212, 121, 0.35);
}
.side-icon {
  font-size: 16px;
}
.side-foot {
  padding-top: 14px;
  border-top: 1px solid var(--panel-line);
}
.side-link {
  color: var(--cyan);
  font-size: 12px;
  text-decoration: none;
  padding: 6px 10px;
  display: block;
  border-radius: 8px;
}
.side-link:hover {
  background: rgba(102, 224, 255, 0.08);
}

/* 主区 */
.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  border-bottom: 1px solid var(--panel-line);
  background: rgba(8, 12, 30, 0.6);
  backdrop-filter: blur(10px);
}
.admin-topbar h2 {
  font-size: 17px;
  color: var(--text);
  letter-spacing: 0.08em;
}
.topbar-en {
  margin-left: 10px;
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.3em;
}
.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.topbar-user .avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 212, 121, 0.5);
  color: var(--gold);
  font-size: 13px;
  background: rgba(255, 212, 121, 0.08);
}
.topbar-user .name {
  color: var(--text);
  font-size: 13px;
}
.admin-topbar .btn.mini {
  border: 1px solid var(--panel-line);
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
}
.admin-topbar .btn.mini:hover {
  color: var(--danger);
  border-color: rgba(255, 107, 129, 0.5);
}
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 22px 28px 40px;
  width: 100%;
}
.admin-content > * {
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}

/* 功能中心：把前台整页组件融入后台内容区，去掉全屏定位与自带导航 */
.admin-content.is-view { padding-top: 18px; }
.embed-view { width: 100%; }
/* 覆盖被嵌入页面的根 .page-shell（fixed 全屏 → 后台内正常文档流） */
.embed-view :deep(.page-shell) {
  position: static;
  inset: auto;
  z-index: auto;
  overflow: visible;
  min-height: 0;
  padding: 0;
}
/* 隐藏被嵌入页面自带的顶部前台导航 */
.embed-view :deep(.topnav) { display: none !important; }
/* 弹层 Teleport 到 body，不受 scoped 影响；这里保证内容区可滚动 */
.admin-content.is-view { overflow-y: auto; }
.mod-desc {
  margin-bottom: 16px;
  font-size: 12.5px;
  color: var(--muted);
  letter-spacing: 0.04em;
}

/* 数据概览卡片 */
.overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}
.ov-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--panel-line);
  border-radius: 14px;
  background: rgba(10, 16, 38, 0.55);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, transform 0.2s, background 0.2s;
}
.ov-card:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 224, 255, 0.5);
}
.ov-card.active {
  border-color: rgba(255, 212, 121, 0.55);
  background: rgba(255, 212, 121, 0.08);
}
.ov-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(102, 224, 255, 0.1);
  font-size: 19px;
  overflow: hidden;
}
.ov-icon :deep(.app-icon) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 10px;
  box-shadow: none;
}
.ov-card.active .ov-icon { background: rgba(255, 212, 121, 0.14); }
.ov-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ov-body b { font-size: 13px; font-weight: 500; }
.ov-body em { font-style: normal; font-size: 11.5px; color: var(--muted); }
.ov-arrow { margin-left: auto; color: var(--muted); font-size: 20px; }
.ov-card:hover .ov-arrow { color: var(--cyan); }

@media (max-width: 860px) {
  .admin-side {
    width: 64px;
    padding: 16px 8px;
  }
  .side-brand b,
  .side-sub,
  .side-label,
  .side-link {
    display: none;
  }
  .side-item {
    justify-content: center;
    padding: 12px 0;
  }
  .admin-content {
    padding: 18px 14px 32px;
  }
}
</style>

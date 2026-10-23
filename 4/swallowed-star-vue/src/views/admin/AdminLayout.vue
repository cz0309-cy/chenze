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
        <router-link
          v-for="m in ADMIN_MODULES"
          :key="m.key"
          :to="`/admin/${m.key}`"
          class="side-item"
          :class="{ active: route.params.module === m.key }"
        >
          <span class="side-icon">{{ m.icon }}</span>
          {{ m.title }}
        </router-link>
      </nav>

      <div class="side-foot">
        <router-link class="side-link" to="/home">← 返回前台星域</router-link>
      </div>
    </aside>

    <!-- 主区 -->
    <div class="admin-main">
      <header class="admin-topbar">
        <h2>{{ current.title }} <span class="topbar-en">DATA CONSOLE</span></h2>
        <div class="topbar-user">
          <span class="avatar">{{ avatarChar }}</span>
          <span class="name">{{ adminName }}</span>
          <button class="btn mini" @click="doLogout">退出后台</button>
        </div>
      </header>

      <main class="admin-content">
        <AdminCrud :key="current.key" :mod="current" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_MODULES } from '../../admin/modules.js'
import { adminLogout, adminMe, clearAdminToken, getAdminToken } from '../../api/admin.js'
import AdminCrud from './AdminCrud.vue'

const route = useRoute()
const router = useRouter()

const current = computed(
  () => ADMIN_MODULES.find((m) => m.key === route.params.module) || ADMIN_MODULES[0]
)

const adminName = ref('管理员')
const avatarChar = computed(() => (adminName.value || '管')[0])

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
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  padding: 0;
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
  padding: 24px 28px 40px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 860px) {
  .admin-side {
    width: 64px;
    padding: 16px 8px;
  }
  .side-brand b,
  .side-sub,
  .side-item span:not(.side-icon),
  .side-link {
    display: none;
  }
  .side-item {
    justify-content: center;
    padding: 12px 0;
  }
}
</style>

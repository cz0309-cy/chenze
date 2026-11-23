<template>
  <div class="page-shell ud-page">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">MEMBER DIRECTORY</div>
        <h1>成员名录</h1>
        <p>.registered 星际战士的身份档案。在线数据来自服务端；未接入时展示本地演示名录。</p>
      </header>

      <section class="ud-toolbar">
        <div class="mini-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
          </svg>
          <input v-model="keyword" type="text" placeholder="检索成员代号…" maxlength="24" />
        </div>
        <div class="ud-source">
          <span class="ud-dot" :class="source === 'server' ? 'live' : 'local'"></span>
          {{ source === 'server' ? '服务端实时数据' : '本地演示数据' }}
        </div>
      </section>

      <section class="ud-stats">
        <div class="ud-stat"><span>名录人数</span><b>{{ list.length }}</b></div>
        <div class="ud-stat"><span>在线成员</span><b class="ok">{{ onlineCount }}</b></div>
        <div class="ud-stat"><span>管理员</span><b class="gold">{{ adminCount }}</b></div>
      </section>

      <div class="ud-grid">
        <article v-for="m in filtered" :key="m.id" class="ud-card card" :class="{ mine: m.mine }">
          <div class="ud-card-top">
            <div class="ud-avatar" :style="{ '--pc': m.color }">{{ (m.nickname || m.username || '?')[0] }}</div>
            <div class="ud-ident">
              <b>{{ m.nickname || m.username }}</b>
              <span>@{{ m.username }}</span>
            </div>
            <span class="ud-status" :class="m.online ? 'on' : ''">{{ m.online ? '在线' : '离线' }}</span>
          </div>
          <div class="ud-card-body">
            <div class="ud-line"><span>身份</span><b :class="m.permission === 0 ? 'gold' : ''">{{ m.permission === 0 ? '管理员' : '星际战士' }}</b></div>
            <div class="ud-line"><span>加入时间</span><b>{{ m.joinedAt }}</b></div>
            <div class="ud-line"><span>编号</span><b>#{{ m.id }}</b></div>
          </div>
          <div v-if="m.mine" class="ud-mine-badge">这是我</div>
        </article>
      </div>

      <div v-if="!filtered.length" class="ud-empty card">没有匹配的成员。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { membersApi } from '../api/auth.js'
import { getSession } from '../composables/useAuth.js'

const keyword = ref('')
const source = ref('local')

// 本地演示名录（后端未提供 /auth/users 时的兜底；可由后台「功能配置」编辑）
import { getFeatureConfig } from '../api/config.js'
import { DEFAULT_FEATURES } from '../config/defaults.js'

const demoMembers = ref(DEFAULT_FEATURES.content.members.map(m => ({ ...m })))

const session = getSession()
const meUsername = (session && session.username) || ''

const list = computed(() => {
  return demoMembers.value.map((m, i) => ({
    ...m,
    username: (m.username || '').trim(),
    color: ['#ffd479', '#66e0ff', '#b98cff', '#7dffb0', '#ff8a5c'][i % 5],
    mine: m.username === meUsername
  }))
})
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return list.value
  return list.value.filter(m =>
    (m.username || '').toLowerCase().includes(kw) ||
    (m.nickname || '').toLowerCase().includes(kw)
  )
})
const onlineCount = computed(() => list.value.filter(m => m.online).length)
const adminCount = computed(() => list.value.filter(m => m.permission === 0).length)

onMounted(async () => {
  // 先读后台功能配置，覆盖演示名录（配置优先于内置默认）
  try {
    const cfg = await getFeatureConfig()
    if (Array.isArray(cfg?.content?.members)) {
      demoMembers.value = cfg.content.members.map(m => ({ ...m }))
    }
  } catch { /* 忽略配置读取失败 */ }
  // 后端目前没有 /auth/users，尝试调用，失败则保留本地数据（页面不报错）
  try {
    const res = await membersApi()
    const rows = res && res.data
    if (Array.isArray(rows) && rows.length) {
      demoMembers.value = rows.map((r, i) => ({
        id: r.id != null ? r.id : 2000 + i,
        username: r.username || r.nickname || ('member' + i),
        nickname: r.nickname || r.username,
        permission: Number(r.permission) || 0,
        online: !!r.online,
        joinedAt: r.createdAt ? String(r.createdAt).slice(0, 10) : '—'
      }))
      source.value = 'server'
    }
  } catch { /* 接口不存在，使用本地演示数据 */ }
})
</script>

<style scoped>
.ud-toolbar {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  max-width: 1000px; margin: 0 auto 16px;
}
.mini-search {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 10px;
  border: 1px solid var(--panel-line); background: var(--panel);
  min-width: 260px;
}
.mini-search svg { width: 16px; height: 16px; color: var(--muted); }
.mini-search input {
  flex: 1; border: none; outline: none; background: transparent;
  color: var(--text); font-size: 13px;
}
.ud-source { margin-left: auto; font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 7px; }
.ud-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted); }
.ud-dot.live { background: var(--ok); box-shadow: 0 0 8px var(--ok); }
.ud-dot.local { background: var(--gold); }

.ud-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 1000px; margin: 0 auto 18px; }
.ud-stat {
  padding: 14px 18px; border-radius: var(--radius);
  border: 1px solid var(--panel-line); background: var(--panel);
}
.ud-stat span { display: block; font-size: 11px; color: var(--muted); }
.ud-stat b { display: block; font-size: 24px; margin-top: 6px; }
.ud-stat b.ok { color: var(--ok); }
.ud-stat b.gold { color: var(--gold); }

.ud-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; max-width: 1000px; margin: 0 auto; }
.ud-card { position: relative; padding: 18px 20px; }
.ud-card.mine { border-color: var(--gold); box-shadow: 0 0 0 1px rgba(255,212,121,.2); }
.ud-card-top { display: flex; align-items: center; gap: 12px; }
.ud-avatar {
  --pc: var(--cyan); display: grid; place-items: center;
  width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%;
  font-size: 19px; color: var(--pc);
  border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
  background: color-mix(in srgb, var(--pc) 12%, transparent);
}
.ud-ident { min-width: 0; }
.ud-ident b { display: block; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ud-ident span { display: block; font-size: 11px; color: var(--muted); margin-top: 3px; }
.ud-status { margin-left: auto; font-size: 11px; color: var(--muted); white-space: nowrap; }
.ud-status.on { color: var(--ok); }
.ud-card-body { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--panel-line); }
.ud-line { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; }
.ud-line span { color: var(--muted); }
.ud-line b.gold { color: var(--gold); }
.ud-mine-badge {
  position: absolute; top: 12px; right: 12px;
  font-size: 9px; letter-spacing: 1px; padding: 3px 7px; border-radius: 6px;
  color: var(--bg); background: var(--gold); font-weight: 700;
}
.ud-empty { max-width: 1000px; margin: 18px auto 0; padding: 30px; text-align: center; color: var(--muted); }
@media (max-width: 720px) { .ud-stats { grid-template-columns: 1fr; } .ud-source { margin-left: 0; } }
</style>

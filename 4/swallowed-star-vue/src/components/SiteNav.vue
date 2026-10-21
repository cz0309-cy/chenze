<template>
  <nav class="topnav">
    <router-link class="logo" to="/home">
      <span class="mark">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffd479"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2l2.4 6.6L21 9.2l-5 4.6 1.5 6.9L12 16.8 6.5 20.7 8 13.8 3 9.2l6.6-.6z" />
        </svg>
      </span>
      <b>吞噬星空</b>
    </router-link>

    <div class="nav-menu">
      <router-link
        v-for="n in navs"
        :key="n.to"
        :to="n.to"
        class="nav-item"
        :class="{ active: isActive(n) }"
      >
        {{ n.label }}
      </router-link>
    </div>

    <span class="spacer"></span>
    <span class="clock">{{ clock }}</span>

    <div class="nav-user">
      <span class="avatar">{{ avatarChar }}</span>
      <span class="name">{{ nickname }}</span>
      <button class="btn-exit" @click="goLogout">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        退出
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSession, logout } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()

const navs = [
  { key: 'home', label: '星域首页', to: '/home' },
  { key: 'explore', label: '星海探索', to: '/explore' },
  { key: 'codex', label: '文明图鉴', to: '/codex' },
  { key: 'market', label: '奇物交易', to: '/market' },
  { key: 'cultivate', label: '意识修炼', to: '/cultivate' },
  { key: 'character', label: '人物档案', to: '/character' }
]

const session = getSession()
const nickname = ref((session && (session.nickname || session.username)) || '星际战士')
const avatarChar = computed(() => (nickname.value || '星')[0])

const clock = ref('')
let timer = null

function tick() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  clock.value = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes()
  )}:${p(d.getSeconds())}`
}

function isActive(n) {
  return route.path === n.to
}

function goLogout() {
  logout()
  router.push('/login')
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
  const s = getSession()
  if (s) nickname.value = s.nickname || s.username || nickname.value
})
onBeforeUnmount(() => clearInterval(timer))
</script>

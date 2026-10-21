import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Explore from '../views/Explore.vue'
import Codex from '../views/Codex.vue'
import Market from '../views/Market.vue'
import Cultivate from '../views/Cultivate.vue'
import Character from '../views/Character.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/home', name: 'home', component: Home, meta: { auth: true } },
  { path: '/explore', name: 'explore', component: Explore, meta: { auth: true } },
  { path: '/codex', name: 'codex', component: Codex, meta: { auth: true } },
  { path: '/market', name: 'market', component: Market, meta: { auth: true } },
  { path: '/cultivate', name: 'cultivate', component: Cultivate, meta: { auth: true } },
  { path: '/character', name: 'character', component: Character, meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 未登录（无 token）访问需要登录的页面则跳回登录
router.beforeEach((to) => {
  if (to.meta && to.meta.auth && !localStorage.getItem('ss_token')) {
    return '/login'
  }
})

export default router

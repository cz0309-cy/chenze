import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Explore from '../views/Explore.vue'
import Codex from '../views/Codex.vue'
import Market from '../views/Market.vue'
import Cultivate from '../views/Cultivate.vue'
import Character from '../views/Character.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminCrud from '../views/admin/AdminCrud.vue'
import { ADMIN_MODULES } from '../admin/modules.js'
import { getAdminToken } from '../api/admin.js'

// 后台各模块页面：/admin/civs、/admin/goods、/admin/realms、/admin/characters
const adminRoutes = ADMIN_MODULES.map((m) => ({
  path: m.key,
  name: 'admin-' + m.key,
  component: AdminCrud,
  props: { mod: m },
  meta: { adminAuth: true }
}))

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
  // 后台管理系统（仅登录，无注册功能）
  { path: '/admin/login', name: 'admin-login', component: AdminLogin },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { adminAuth: true },
    children: [{ path: '', redirect: '/admin/' + ADMIN_MODULES[0].key }, ...adminRoutes]
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 未登录（无 token）访问需要登录的页面则跳回登录
router.beforeEach((to) => {
  const adminToken = getAdminToken()
  // 后台路由需要独立的管理员 token（含 /admin 父路由本身）
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return adminToken ? true : '/admin/login'
  }
  // 已登录管理员访问后台登录页则直接进后台
  if (to.path === '/admin/login' && adminToken) {
    return '/admin'
  }
  if (to.meta && to.meta.auth && !localStorage.getItem('ss_token')) {
    return '/login'
  }
})

export default router

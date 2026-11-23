import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Explore from '../views/Explore.vue'
import Codex from '../views/Codex.vue'
import Market from '../views/Market.vue'
import Cultivate from '../views/Cultivate.vue'
import Character from '../views/Character.vue'
import StarGame from '../views/StarGame.vue'
import BattleArena from '../views/BattleArena.vue'
import PowerRank from '../views/PowerRank.vue'
import AnimeZone from '../views/AnimeZone.vue'
import UserDirectory from '../views/UserDirectory.vue'
// TODO: Mahjong.vue / ArtHall.vue 页面文件尚未创建，入口暂时隐藏，补做后恢复
import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminCrud from '../views/admin/AdminCrud.vue'
import { ADMIN_MODULES, ADMIN_VIEWS } from '../admin/modules.js'
import { getAdminToken } from '../api/admin.js'

// 后台各模块页面：/admin/civs、/admin/goods、/admin/realms、/admin/characters
const adminRoutes = ADMIN_MODULES.map((m) => ({
  path: m.key,
  name: 'admin-' + m.key,
  component: AdminCrud,
  props: { mod: m },
  meta: { adminAuth: true }
}))

// 后台「功能中心」：复用前台已有的完整交互页面，直接渲染组件（非 CRUD 表格）
const ADMIN_VIEW_COMPONENTS = {
  treasure: StarGame,
  battle: BattleArena,
  rank: PowerRank,
  anime: AnimeZone,
  members: UserDirectory
}
const adminViewRoutes = ADMIN_VIEWS.map((v) => ({
  path: v.key,
  name: 'admin-view-' + v.key,
  component: ADMIN_VIEW_COMPONENTS[v.key],
  meta: { adminAuth: true, adminView: true }
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
  { path: '/treasure', name: 'treasure', component: StarGame, meta: { auth: true } },
  { path: '/battle', name: 'battle', component: BattleArena, meta: { auth: true } },
  { path: '/rank', name: 'rank', component: PowerRank, meta: { auth: true } },
  { path: '/anime', name: 'anime', component: AnimeZone, meta: { auth: true } },
  { path: '/members', name: 'members', component: UserDirectory, meta: { auth: true } },
  // 旧地址兼容：原「星骸远航」已改为「秘境寻宝」
  { path: '/stargame', redirect: '/treasure' },
  // { path: '/monster', name: 'monster', component: Mahjong, meta: { auth: true } },
  // { path: '/arthall', name: 'arthall', component: ArtHall, meta: { auth: true } },
  // 后台管理系统（仅登录，无注册功能）
  { path: '/admin/login', name: 'admin-login', component: AdminLogin },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { adminAuth: true },
    children: [
      { path: '', redirect: '/admin/' + ADMIN_MODULES[0].key },
      ...adminRoutes,
      ...adminViewRoutes
    ]
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

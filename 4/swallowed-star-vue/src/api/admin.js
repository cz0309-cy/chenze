// 后台管理系统 API：独立管理员 token（ss_admin_token），与前台用户 token 互不影响
const BASE = '/api'
const TOKEN_KEY = 'ss_admin_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function adminRequest(method, path, body) {
  const token = getAdminToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* 忽略空响应 */
  }

  if (!res.ok || (data && data.code !== undefined && data.code !== 0)) {
    const err = new Error((data && data.message) || '请求失败，请确认后端服务已启动')
    err.code = (data && data.code) || res.status
    throw err
  }
  return data
}

/* ---------------- 管理员认证 ---------------- */

/** 管理员登录（无注册功能） */
export function adminLogin(username, password) {
  return adminRequest('POST', '/admin/auth/login', { username, password })
}

/** 当前管理员信息 */
export function adminMe() {
  return adminRequest('GET', '/admin/auth/me')
}

/** 管理员注销 */
export function adminLogout() {
  return adminRequest('POST', '/admin/auth/logout')
}

/* ---------------- 数据管理（6 大模块统一 CRUD） ---------------- */

/**
 * 分页列表
 * @param {string} module regions|civs|goods|realms|arts|characters
 * @param {{keyword?:string, page?:number, size?:number}} params
 */
export function fetchAdminPage(module, { keyword = '', page = 1, size = 10 } = {}) {
  const qs = new URLSearchParams({ keyword, page: String(page), size: String(size) })
  return adminRequest('GET', `/admin/lore/${module}?${qs.toString()}`)
}

/** 新增 */
export function createAdminItem(module, data) {
  return adminRequest('POST', `/admin/lore/${module}`, data)
}

/** 更新 */
export function updateAdminItem(module, id, data) {
  return adminRequest('PUT', `/admin/lore/${module}/${id}`, data)
}

/** 删除 */
export function deleteAdminItem(module, id) {
  return adminRequest('DELETE', `/admin/lore/${module}/${id}`)
}

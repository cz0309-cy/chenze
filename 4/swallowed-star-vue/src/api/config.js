// 功能中心配置读取：公开接口（无需登录），带内存缓存 + localStorage 兜底。
// 后台保存配置后，前台刷新页面即可读到新值；无后端/接口异常时回退到本地缓存或 null（各页用默认值）。
import { request } from './http.js'

const CACHE_KEY = 'ss_feature_config'
let memoryCache = null

/** 读取配置（优先内存 → 本地缓存 → 后端），返回 null 表示没有配置 */
export async function getFeatureConfig({ force = false } = {}) {
  if (!force && memoryCache) return memoryCache
  // 先用本地缓存同步兜底，避免首屏闪烁
  if (memoryCache === null) {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) memoryCache = JSON.parse(raw)
    } catch { /* 忽略损坏缓存 */ }
  }
  try {
    const res = await request('GET', '/config/features')
    if (res && res.data && typeof res.data === 'object') {
      memoryCache = res.data
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(res.data)) } catch { /* 忽略 */ }
    }
  } catch {
    /* 接口不可用：用缓存/默认值，不影响页面 */
  }
  return memoryCache
}

/** 使缓存失效（后台保存后前台刷新用） */
export function clearFeatureConfigCache() {
  memoryCache = null
  try { localStorage.removeItem(CACHE_KEY) } catch { /* 忽略 */ }
}

/**
 * 同步读取功能开关（供路由守卫使用）：优先内存，其次 localStorage 缓存。
 * 返回 null 表示尚无配置（此时放行，不阻断访问）。
 */
export function getFeatureSwitchesSync() {
  let cfg = memoryCache
  if (!cfg) {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) cfg = JSON.parse(raw)
    } catch { /* 忽略 */ }
  }
  return cfg?.switches || null
}

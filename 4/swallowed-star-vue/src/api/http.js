// 统一的 HTTP 请求封装：拼接 /api 前缀、携带 token、解包后端 { code, message, data }
const BASE = '/api'

export async function request(method, path, body) {
  const token = localStorage.getItem('ss_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* 忽略空响应 */
  }

  // 后端统一返回 { code, message, data }，code !== 0 视为业务失败
  if (!res.ok || (data && data.code !== undefined && data.code !== 0)) {
    const err = new Error((data && data.message) || '请求失败，请确认后端服务已启动')
    err.code = (data && data.code) || res.status
    throw err
  }
  return data
}

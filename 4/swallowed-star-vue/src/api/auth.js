// 与后端（Spring Boot + MyBatis-Plus）通信的认证接口层
// 开发环境通过 Vite 代理把 /api 转发到 http://192.168.68.43:8081
import { request } from './http.js'

export function loginApi(username, password) {
  return request('POST', '/auth/login', { username, password })
}

export function registerApi(username, password) {
  return request('POST', '/auth/register', { username, password })
}

export function meApi() {
  return request('GET', '/auth/me')
}

export function logoutApi() {
  return request('POST', '/auth/logout')
}

// 星域成员名录：获取所有注册用户（后端已脱敏，不含密码）
export function membersApi() {
  return request('GET', '/auth/users')
}

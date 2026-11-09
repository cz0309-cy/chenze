import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ===== 局域网调试配置 =====
// 本机局域网 IP（换网络/换机器时只改这一行）
const LAN_HOST = process.env.VITE_LAN_HOST || '192.168.68.17'
const FRONTEND_PORT = Number(process.env.VITE_FRONTEND_PORT || 5173)
const BACKEND_PORT = Number(process.env.VITE_BACKEND_PORT || 8081)
const API_TARGET = process.env.VITE_API_TARGET || `http://${LAN_HOST}:${BACKEND_PORT}`

export default defineConfig({
  plugins: [vue()],
  server: {
    // 监听所有网卡，局域网内其他设备才能访问（不能写 127.0.0.1）
    host: '0.0.0.0',
    port: FRONTEND_PORT,
    strictPort: true,
    open: true,
    // 允许通过局域网 IP / 自定义域名访问（Vite 5.4.12+ 的 host 校验）
    allowedHosts: true,
    proxy: {
      // 开发环境把 /api 请求转发到 Spring Boot 后端（局域网 IP + 8081）
      '/api': {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
})

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import axios from 'axios'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)

// 设置 axios 拦截器 —— 每个请求自动带上 token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

app.use(createPinia())

// 挂载后立即恢复登录状态
const pinia = createPinia()
app.use(pinia)
const authStore = useAuthStore()
authStore.restore()

app.mount('#app')

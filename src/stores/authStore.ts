// src/stores/authStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'

export interface AuthUser {
  id: number
  email: string
  name?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
  },
  actions: {
    async signup(payload: { email: string; password: string; name?: string }) {
      this.loading = true
      this.error = null
      try {
        // ✅ 正确路径：/api/auth/register
        const { data } = await axios.post(`${API_BASE}/api/auth/register`, payload)
        await this._finishLoginWithToken(data.token)
      } catch (e: any) {
        this.error = e?.response?.data || e?.message || 'Sign up failed'
        throw e
      } finally {
        this.loading = false
      }
    },

    async login(payload: { email: string; password: string }) {
      this.loading = true
      this.error = null
      try {
        // ✅ 正确路径：/api/auth/login
        const { data } = await axios.post(`${API_BASE}/api/auth/login`, payload)
        await this._finishLoginWithToken(data.token)
      } catch (e: any) {
        this.error = e?.response?.data || e?.message || 'Login failed'
        throw e
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    },

    // 恢复已登录会话（刷新页面时）
    async restore() {
      const token = localStorage.getItem('token')
      const userRaw = localStorage.getItem('user')
      if (!token) return
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      this.token = token

      if (userRaw) {
        this.user = JSON.parse(userRaw)
      } else {
        // 没有缓存 user，就调用 /me 拉一下
        try {
          const { data } = await axios.get(`${API_BASE}/api/auth/me`)
          this.user = data
          localStorage.setItem('user', JSON.stringify(data))
        } catch {
          // token 失效之类，清理即可
          this.logout()
        }
      }
    },

    // 内部：拿到 token 后设置 axios header，再调 /me 获取用户
    async _finishLoginWithToken(token: string) {
      if (!token) throw new Error('No token returned from server')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const { data: user } = await axios.get(`${API_BASE}/api/auth/me`)
      this._setSession(token, user)
    },

    _setSession(token: string, user: AuthUser) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
  },
})

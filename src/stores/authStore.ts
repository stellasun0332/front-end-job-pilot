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
      this.loading = true; this.error = null
      try {
        const { data } = await axios.post(`${API_BASE}/auth/register`, payload)
        // 期望返回：{ token: string, user: { id, email, name? } }
        this._setSession(data.token, data.user)
      } catch (e: any) {
        this.error = e?.response?.data || e?.message || 'Sign up failed'
        throw e
      } finally { this.loading = false }
    },
    async login(payload: { email: string; password: string }) {
      this.loading = true; this.error = null
      try {
        const { data } = await axios.post(`${API_BASE}/auth/login`, payload)
        this._setSession(data.token, data.user)
      } catch (e: any) {
        this.error = e?.response?.data || e?.message || 'Login failed'
        throw e
      } finally { this.loading = false }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    restore() {
      const token = localStorage.getItem('token')
      const userRaw = localStorage.getItem('user')
      if (token && userRaw) {
        this.token = token
        this.user = JSON.parse(userRaw)
      }
    },
    _setSession(token: string, user: AuthUser) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
  },
})

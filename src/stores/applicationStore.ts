import { defineStore } from 'pinia'
import axios from 'axios'

export type Application = {
  id: number
  title: string
  company: string
  appliedOn: string
  status: string
  notes: string
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchApplications() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('https://jobpilot-backend-62hx.onrender.com/jobs')
        this.applications = response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch applications'
      } finally {
        this.loading = false
      }
    },
  },
})

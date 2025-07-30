import { defineStore } from 'pinia'
import axios from 'axios'

export type InterviewInfo = {
  date: string
  interviewer: string
  notes: string
}

export type Application = {
  id: number
  title: string
  company: string
  appliedOn: string
  status: string
  notes: string
  interview?: InterviewInfo
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
        //TODO: UPDATE 'GET' TO USE DEPLOYED BACKEND API ROUTE AFTER TESTING
        //! CURRENTLY SET TO LOCAL POSTGRESQL DB ROUTE FOR TESTING
        const response = await axios.get('http://localhost:8080/jobs')
        console.log('Api response:', response.data)
        this.applications = response.data.map((app: any) => ({
          ...app,
          id: app.id ?? app._id,
        }))
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch applications'
      } finally {
        this.loading = false
      }
    },
    saveInterview(applicationId: number, interview: InterviewInfo) {
      const app = this.applications.find((a) => a.id === applicationId)
      if (app) {
        app.interview = { ...interview }
      }
    },
  },
})

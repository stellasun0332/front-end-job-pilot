import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'
const JOBS = `${API_BASE}/jobs`
const INTERVIEWS = `${API_BASE}/interviews`

export type InterviewInfo = {
  job: { id: number } | number
  date: string
  interviewer: string
  prepNotes: string
}

export type Application = {
  id: number
  title: string
  company: string
  dateApplied: string
  status: string
  notes: string
  jobDescription?: string
  interview?: InterviewInfo
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [] as Application[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchApplications() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(JOBS, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.applications = response.data
          .map((app: Application) => ({
            ...app,
            id: app.id,
            interview: null,
          }))
          .sort((a: Application, b: Application) => a.id - b.id)

        await this.fetchAllInterviewData()
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch applications'
      } finally {
        this.loading = false
      }
    },
    async fetchAllInterviewData() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(INTERVIEWS, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const interviews = response.data

        interviews.forEach((interview: any) => {
          const app = this.applications.find((a: Application) => a.id === interview.job.id)
          if (app) {
            app.interview = {
              job: interview.job?.id || interview.applicationId,
              date: interview.date,
              interviewer: interview.interviewer,
              prepNotes: interview.prepNotes,
            }
          }
        })
      } catch (err: any) {
        console.error('No interviews found or error fetching interviews:', err.message)
      }
    },
    async fetchInterviewInfo(applicationId: number) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${INTERVIEWS}/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const app = this.applications.find((a: Application) => a.id === applicationId)
        if (app) {
          const interviewData = response.data
          app.interview = {
            job: interviewData.job.id,
            date: interviewData.date,
            interviewer: interviewData.interviewer,
            prepNotes: interviewData.prepNotes,
          }
        }
        return response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch interview'
        return null
      }
    },
    async saveInterview(applicationId: number, interview: InterviewInfo) {
      try {
        const token = localStorage.getItem('token')
        await axios.post(INTERVIEWS, {
          applicationId,
          ...interview,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const app = this.applications.find((a) => a.id === applicationId)
        if (app) {
          app.interview = { ...interview }
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to save interview'
      }
    },
    async updateJobDescription(applicationId: number, jobDescription: string) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.patch(`${JOBS}/${applicationId}`, {
          jobDescription,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const app = this.applications.find((a: Application) => a.id === applicationId)
        if (app) {
          app.jobDescription = jobDescription
        }

        return response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to update job description'
        throw err
      }
    },
    async updateApplication(applicationId: number, updatedFields: Partial<Application>) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.patch(`${JOBS}/${applicationId}`, updatedFields, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const app = this.applications.find((a: Application) => a.id === applicationId)
        if (app) {
          Object.assign(app, updatedFields)
        }

        return response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to update application'
        throw err
      }
    },
    addApplication(application: Application) {
      this.applications.push(application)
    },
  },
})

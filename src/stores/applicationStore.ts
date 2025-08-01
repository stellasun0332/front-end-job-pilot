import { defineStore } from 'pinia'
import axios from 'axios'

const JOBS = 'https://jobpilot-backend-62hx.onrender.com/jobs'
const INTERVIEWS = 'https://jobpilot-backend-62hx.onrender.com/interviews'
//! Remove below once testing is complete
const JOBS_TEST = 'http://localhost:8080/jobs'
const INTERVIEWS_TEST = 'http://localhost:8080/interviews'

export type InterviewInfo = {
  job: number
  date: string
  interviewer: string
  prepNotes: string
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
        const response = await axios.get(`${JOBS_TEST}`)
        this.applications = response.data.map((app: any) => ({
          ...app,
          id: app.id ?? app._id,
          interview: null,
        }))

        await this.fetchAllInterviewData()
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch applications'
      } finally {
        this.loading = false
      }
    },
    async fetchAllInterviewData() {
      try {
        const response = await axios.get(`${INTERVIEWS_TEST}`)
        const interviews = response.data

        interviews.forEach((interview: any) => {
          const app = this.applications.find((a: any) => a.id === interview.job.id)
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
        const response = await axios.get(`${INTERVIEWS_TEST}/${applicationId}`)
        const app = this.applications.find((a: any) => a.id === applicationId)
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
        const response = await axios.post(`${INTERVIEWS_TEST}`, {
          applicationId,
          ...interview,
        })

        const updatedInterview = response.data
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
        const response = await axios.patch(`${JOBS_TEST}/${applicationId}`, {
          jobDescription,
        })

        const app = this.applications.find((a: any) => a.id === applicationId)
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
        const response = await axios.patch(`${JOBS_TEST}/${applicationId}`, updatedFields)
        const app = this.applications.find((a: any) => a.id === applicationId)
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

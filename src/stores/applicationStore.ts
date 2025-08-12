import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'
const JOBS = `${API_BASE}/jobs`
const INTERVIEWS = `${API_BASE}/interviews`

// 小工具：附带 Bearer token
function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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
  interview?: InterviewInfo | null
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [] as Application[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /* ========== Jobs ========== */
    async fetchApplications() {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(JOBS, { headers: authHeaders() })
        this.applications = data
          .map((app: Application) => ({
            ...app,
            id: app.id,
            interview: null, // 先置空，下面再批量补齐
          }))
          .sort((a: Application, b: Application) => a.id - b.id)

        await this.fetchAllInterviewData()
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to fetch applications'
      } finally {
        this.loading = false
      }
    },

    async updateApplication(applicationId: number, updatedFields: Partial<Application>) {
      try {
        const { data } = await axios.patch(`${JOBS}/${applicationId}`, updatedFields, {
          headers: authHeaders(),
        })
        const app = this.applications.find((a) => a.id === applicationId)
        if (app) Object.assign(app, updatedFields)
        return data
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to update application'
        throw err
      }
    },

    async updateJobDescription(applicationId: number, jobDescription: string) {
      try {
        const { data } = await axios.patch(
          `${JOBS}/${applicationId}`,
          { jobDescription },
          { headers: authHeaders() },
        )
        const app = this.applications.find((a) => a.id === applicationId)
        if (app) app.jobDescription = jobDescription
        return data
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to update job description'
        throw err
      }
    },

    // ✅ 新增：删除 Job（对应后端 DELETE /jobs/{id}）
    async deleteApplication(applicationId: number) {
      try {
        await axios.delete(`${JOBS}/${applicationId}`, { headers: authHeaders() })
        this.applications = this.applications.filter((a) => a.id !== applicationId)
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to delete application'
        throw err
      }
    },

    addApplication(application: Application) {
      this.applications.push(application)
    },

    /* ========== Interviews ========== */
    // 批量把所有面试记录取回来，合并到对应的 job 上
    async fetchAllInterviewData() {
      try {
        const { data } = await axios.get(INTERVIEWS, { headers: authHeaders() })
        const interviews = data as any[]

        interviews.forEach((iv) => {
          const app = this.applications.find((a) => a.id === iv.job.id)
          if (app) {
            app.interview = {
              job: iv.job?.id ?? iv.applicationId,
              date: iv.date,
              interviewer: iv.interviewer,
              prepNotes: iv.prepNotes,
            }
          }
        })
      } catch (err: any) {
        // 没有面试记录也很正常，这里不设全局 error，避免打断页面
        console.warn('Fetch interviews skipped:', err?.message || err)
      }
    },

    // ⚠️ 修正：按 jobId 查询面试，使用 /interviews/job/{jobId}
    async fetchInterviewInfo(applicationId: number) {
      try {
        const { data } = await axios.get(`${INTERVIEWS}/job/${applicationId}`, {
          headers: authHeaders(),
        })
        // 后端返回该 job 的面试数组；若只用一条，就取第一条
        const first = Array.isArray(data) ? data[0] : data
        if (first) {
          const app = this.applications.find((a) => a.id === applicationId)
          if (app) {
            app.interview = {
              job: first.job.id,
              date: first.date,
              interviewer: first.interviewer,
              prepNotes: first.prepNotes,
            }
          }
        }
        return first ?? null
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to fetch interview'
        return null
      }
    },

    // ⚠️ 修正：按后端要求传 { job: { id }, ... }
    async saveInterview(applicationId: number, interview: InterviewInfo) {
      try {
        await axios.post(
          INTERVIEWS,
          {
            job: { id: applicationId },
            date: interview.date,
            interviewer: interview.interviewer,
            prepNotes: interview.prepNotes,
          },
          { headers: authHeaders() },
        )

        const app = this.applications.find((a) => a.id === applicationId)
        if (app) {
          app.interview = {
            job: applicationId,
            date: interview.date,
            interviewer: interview.interviewer,
            prepNotes: interview.prepNotes,
          }
        }
      } catch (err: any) {
        this.error = err?.response?.data || err?.message || 'Failed to save interview'
        throw err
      }
    },
  },
})

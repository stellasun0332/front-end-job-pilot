import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'
const JOBS = `${API_BASE}/jobs`
const INTERVIEWS = `${API_BASE}/interviews`

function authHeaders(): Record<string, string> {
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
  user?: { id: number; name?: string; email?: string } // 供前端过滤使用
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
        const rows: Application[] = Array.isArray(data) ? data : []

        // 仅前端过滤：只显示当前登录用户的 jobs
        const auth = useAuthStore()
        const myId = auth.user?.id
        const mine = myId ? rows.filter(j => j?.user?.id === myId) : rows

        this.applications = mine
          .map((app) => ({ ...app, interview: null }))
          .sort((a, b) => a.id - b.id)

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

    // 删除 Job（DELETE /jobs/{id}）
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
    // 批量取回所有面试，再只合并到当前 store 中的 jobs（天然只作用于“我的”）
    async fetchAllInterviewData() {
      try {
        const { data } = await axios.get(INTERVIEWS, { headers: authHeaders() })
        const interviews = Array.isArray(data) ? data : []

        // 仅对当前 applications 的 id 合并
        const idSet = new Set(this.applications.map(a => a.id))
        interviews.forEach((iv: any) => {
          const jid = iv?.job?.id ?? iv?.applicationId
          if (!idSet.has(jid)) return
          const app = this.applications.find(a => a.id === jid)
          if (app) {
            app.interview = {
              job: jid,
              date: iv.date,
              interviewer: iv.interviewer,
              prepNotes: iv.prepNotes,
            }
          }
        })
      } catch (err: any) {
        // 没有面试记录不算错误，避免打断页面
        console.warn('Fetch interviews skipped:', err?.message || err)
      }
    },

    // 按 jobId 查询面试（/interviews/job/{jobId}），需要时再单查
    async fetchInterviewInfo(applicationId: number) {
      try {
        const { data } = await axios.get(`${INTERVIEWS}/job/${applicationId}`, {
          headers: authHeaders(),
        })
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

    // 保存面试（后端要求结构：{ job: { id }, ... }）
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

    clear() {
      this.applications = []
      this.loading = false
      this.error = null
    },
  },
})

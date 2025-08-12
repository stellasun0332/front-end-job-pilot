<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useApplicationStore, type Application } from '@/stores/applicationStore'

import ApplicationCard from '@/components/ApplicationCard.vue'
import ApplicationUploadForm from '@/components/ApplicationUploadForm.vue'
import ResumeUploadForm from '@/components/ResumeUploadForm.vue'
import AuthModal from '@/components/AuthModal.vue'

// stores
const auth = useAuthStore()
const applicationStore = useApplicationStore()

// 顶栏登录弹窗
const showAuth = ref(false)
const authMode = ref<'login' | 'signup'>('login')
function openAuth(mode: 'login' | 'signup') {
  authMode.value = mode
  showAuth.value = true
}
function closeAuth() {
  showAuth.value = false
}
function onLogout() {
  auth.logout()
}

// 新建 Application 弹窗
const showUploadForm = ref(false)

// 上传简历弹窗
const showResumeForm = ref(false)
const selectedJobId = ref<number | null>(null)

// 记录“已上传简历”的 jobId（响应式）
const jobsWithResume = reactive(new Set<number>())

// 初始化
onMounted(async () => {
  // 恢复登录状态并设置 axios header
  auth.restore()
  if (auth.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`
  }

  await applicationStore.fetchApplications()

  // 如果后端 job 带 resumeFile，可在此初始化（可选）
  applicationStore.applications.forEach((app: any) => {
    if (app?.resumeFile) jobsWithResume.add(app.id)
  })
})

function handleAppSubmission(newApp: Application) {
  applicationStore.addApplication({ ...newApp, id: newApp.id })
}

function openResumeForm(jobId: number) {
  selectedJobId.value = jobId
  showResumeForm.value = true
}
function closeResumeForm() {
  showResumeForm.value = false
  selectedJobId.value = null
}

// 上传成功后，标记该 job 已有简历
function onResumeUploaded(p: { jobId: number; url: string }) {
  jobsWithResume.add(p.jobId)
}
</script>

<template>
  <div class="page">
    <!-- 顶栏 -->
    <header class="topbar">
      <h1 class="brand">JobPilot</h1>

      <div class="actions">
        <!-- 登录后 -->
        <template v-if="auth.isAuthenticated">
          <span class="hello">Hi, {{ auth.user?.name || auth.user?.email }}</span>
          <button class="btn" @click="onLogout">Log Out</button>
        </template>

        <!-- 未登录 -->
        <template v-else>
          <button class="btn" @click="openAuth('login')">Log In</button>
          <button class="btn" @click="openAuth('signup')">Sign Up</button>
        </template>
      </div>
    </header>

    <!-- 主体 -->
    <main class="content">
      <div class="header-row">
        <h2>Your Applications</h2>
        <button class="btn primary" @click="showUploadForm = true">Add New Application</button>
      </div>

      <div v-if="applicationStore.loading" class="hint">Fetching your applications...</div>
      <div v-else-if="applicationStore.error" class="error">{{ applicationStore.error }}</div>

      <div class="grid">
        <ApplicationCard
          v-for="application in applicationStore.applications"
          :key="application.id"
          :applicationId="application.id"
          :hasResume="jobsWithResume.has(application.id)"
          @upload-resume="openResumeForm"
        />
      </div>
    </main>

    <!-- 登录/注册 -->
    <AuthModal v-if="showAuth" :mode="authMode" @close="closeAuth" />

    <!-- 新建 Application -->
    <ApplicationUploadForm
      v-if="showUploadForm"
      @close="showUploadForm = false"
      @submitted="handleAppSubmission"
    />

    <!-- 上传简历 -->
    <ResumeUploadForm
      v-if="showResumeForm && selectedJobId !== null"
      :job-id="selectedJobId!"
      @uploaded="onResumeUploaded"
      @close="closeResumeForm"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brand {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.hello {
  opacity: 0.9;
  margin-right: 8px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #2f2f2f;
  color: #fff;
}
.btn:hover {
  opacity: 0.9;
}
.btn.primary {
  background: #0d6efd;
}
.hint {
  opacity: 0.8;
  padding: 12px 0;
}
.error {
  color: #ff6b6b;
  padding: 12px 0;
}
</style>

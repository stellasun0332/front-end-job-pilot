<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useApplicationStore, type Application } from '@/stores/applicationStore'

import ApplicationCard from '@/components/ApplicationCard.vue'
import ApplicationUploadForm from '@/components/ApplicationUploadForm.vue'
import ResumeUploadForm from '@/components/ResumeUploadForm.vue'
import AuthModal from '@/components/AuthModal.vue'

const auth = useAuthStore()
const applicationStore = useApplicationStore()

// Auth modal
const showAuth = ref(false)
const authMode = ref<'login' | 'signup'>('login')
const openAuth = (mode: 'login' | 'signup') => {
  authMode.value = mode
  showAuth.value = true
}
const closeAuth = () => {
  showAuth.value = false
}
const onLogout = () => {
  auth.logout()
}

// Dialogs
const showUploadForm = ref(false)
const showResumeForm = ref(false)
const selectedJobId = ref<number | null>(null)

// track resumes
const jobsWithResume = reactive(new Set<number>())

onMounted(async () => {
  await auth.restore()
  if (auth.isAuthenticated) {
    if (auth.token) axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`
    await applicationStore.fetchApplications()
    applicationStore.applications.forEach((app: any) => {
      if (app?.resumeFile) jobsWithResume.add(app.id)
    })
  }
})

watch(
  () => auth.isAuthenticated,
  async (ok) => {
    if (!ok) return
    closeAuth()
    if (auth.token) axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`
    await applicationStore.fetchApplications()
    jobsWithResume.clear()
    applicationStore.applications.forEach((app: any) => {
      if (app?.resumeFile) jobsWithResume.add(app.id)
    })
  },
)

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
function onResumeUploaded(p: { jobId: number; url: string }) {
  jobsWithResume.add(p.jobId)
}
</script>

<template>
  <div class="app">
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="container topbar-inner">
        <h1 class="brand">JobPilot</h1>
        <div class="actions" v-if="auth.isAuthenticated">
          <span class="hello">Hi, {{ auth.user?.name || auth.user?.email }}</span>
          <button class="btn ghost" @click="onLogout">Log Out</button>
        </div>
      </div>
    </header>

    <!-- 登录后主内容 -->
    <main v-if="auth.isAuthenticated" class="container main">
      <div class="section-header">
        <div class="titleblock">
          <h2 class="title">Your Applications</h2>
          <p class="subtitle">
            Track your pipeline, upload resumes, and stay ready for interviews.
          </p>
        </div>
        <button class="btn primary lg" @click="showUploadForm = true">Add New Application</button>
      </div>

      <div v-if="applicationStore.loading" class="hint">Fetching your applications...</div>
      <div v-else-if="applicationStore.error" class="error">{{ applicationStore.error }}</div>

      <div v-else class="cards">
        <ApplicationCard
          v-for="application in applicationStore.applications"
          :key="application.id"
          :applicationId="application.id"
          :hasResume="jobsWithResume.has(application.id)"
          @upload-resume="openResumeForm"
        />
      </div>
    </main>

    <!-- 未登录首屏 -->
    <section v-else class="hero">
      <div class="container hero-inner">
        <h2>Welcome to JobPilot</h2>
        <p class="lead">Sign in to manage your job applications and resumes.</p>
        <div class="hero-actions">
          <button class="btn primary xl" @click="openAuth('login')">Log In</button>
          <button class="btn ghost xl" @click="openAuth('signup')">Create Account</button>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <AuthModal v-if="showAuth" :mode="authMode" @close="closeAuth" />
    <ApplicationUploadForm
      v-if="showUploadForm && auth.isAuthenticated"
      @close="showUploadForm = false"
      @submitted="handleAppSubmission"
    />
    <ResumeUploadForm
      v-if="showResumeForm && selectedJobId !== null && auth.isAuthenticated"
      :job-id="selectedJobId!"
      @uploaded="onResumeUploaded"
      @close="closeResumeForm"
    />
  </div>
</template>

<style scoped>
:global(html, body, #app) {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

:global(#app) {
  width: 100%;
  max-width: none; /* 去掉 1280px 限制 */
  margin: 0;
  background: transparent; /* 背景交给 .app 控制 */
}
/* ========== 全局 reset（防止左偏） ========== */
:global(html, body) {
  height: 100%;
  margin: 0;
  background: #0b0f17; /* 兜底的深色 */
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    'Helvetica Neue',
    Arial,
    'Noto Sans',
    'Apple Color Emoji',
    'Segoe UI Emoji';
}

/* ========== 主题变量（深色） ========== */
.app {
  --bg-0: #0b0f17; /* 背景主色 */
  --bg-1: #0f1629; /* 次级背景 */
  --glass: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.08);
  --text-1: #eef3ff; /* 主文字 */
  --text-2: #9fb0d0; /* 次文字 */
  --brand: #5aa3ff; /* 主题蓝 */
  --brand-2: #7cc0ff; /* 渐变辅助 */

  min-height: 100vh;
  color: var(--text-1);
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(90, 163, 255, 0.18) 0%, transparent 55%),
    radial-gradient(1000px 520px at 110% -10%, rgba(124, 192, 255, 0.14) 0%, transparent 60%),
    linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%);
}

/* 统一容器，保证真正水平居中 */
.container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ========== 顶栏（磨砂玻璃效果） ========== */
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(15, 22, 41, 0.55);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid var(--border);
}
.topbar-inner {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.3px;
  background: linear-gradient(90deg, #fff, #bcd6ff 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.hello {
  color: var(--text-2);
}

/* ========== 未登录首屏（上下左右居中） ========== */
.hero {
  min-height: calc(100vh - 68px);
  display: grid;
  place-items: center;
}
.hero-inner {
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 40px 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.hero h2 {
  font-size: 48px;
  line-height: 1.12;
  margin: 0;
  letter-spacing: 0.2px;
}
.lead {
  font-size: 18px;
  color: var(--text-2);
  margin: 0 0 8px;
}
.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}

/* ========== 登录后主内容 ========== */
.main {
  padding: 28px 0 80px;
}

/* 顶部标题行：左标题 + 右按钮；整体仍在居中容器内 */
.section-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 16px;
  margin: 10px 0 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.title {
  font-size: 26px;
  margin: 0 0 6px;
}
.subtitle {
  margin: 0;
  color: var(--text-2);
}

/* 卡片区域：真正水平居中排列 */
.cards {
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 22px;
  justify-content: center; /* 让网格在剩余空间里居中 */
  justify-items: stretch;
  align-items: start;
}

/* 提示/错误 */
.hint {
  opacity: 0.9;
  padding: 10px 0;
  color: var(--text-2);
}
.error {
  color: #ff8080;
  padding: 10px 0;
}

/* ========== 按钮（主色+幽灵） ========== */
.btn {
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 650;
  border: 1px solid transparent;
  transition:
    transform 0.05s ease,
    box-shadow 0.25s ease,
    opacity 0.2s ease,
    border-color 0.25s ease;
}
.btn:hover {
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}

.btn.primary {
  background: linear-gradient(180deg, var(--brand) 0%, #3b7ce6 100%);
  color: #fff;
  box-shadow: 0 10px 28px rgba(90, 163, 255, 0.35);
  border-color: rgba(90, 163, 255, 0.45);
}
.btn.ghost {
  background: var(--glass);
  color: var(--text-1);
  border-color: var(--border);
}
.btn.lg {
  padding: 11px 18px;
}
.btn.xl {
  padding: 13px 22px;
  font-size: 16px;
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }
  .hero h2 {
    font-size: 36px;
  }
  .lead {
    font-size: 17px;
  }
  .section-header {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>

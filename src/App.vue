<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useApplicationStore, type Application } from './stores/applicationStore'
import { useAuthStore } from './stores/authStore'

import ApplicationCard from './components/ApplicationCard.vue'
import ApplicationUploadForm from './components/ApplicationUploadForm.vue'
import ResumeUploadForm from './components/ResumeUploadForm.vue'
import AuthModal from './components/AuthModal.vue'

const applicationStore = useApplicationStore()
const auth = useAuthStore()

// 新建 Application 弹窗
const showUploadForm = ref(false)

// 上传简历弹窗
const showResumeForm = ref(false)
const selectedJobId = ref<number | null>(null)

// 记录“已上传简历”的 jobId
const jobsWithResume = reactive(new Set<number>())

onMounted(async () => {
  await applicationStore.fetchApplications()
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
function onResumeUploaded(p: { jobId: number; url: string }) {
  jobsWithResume.add(p.jobId)
}

// 登录/注册弹窗
const showAuth = ref<false | 'login' | 'signup'>(false)
</script>

<template>
  <div class="page">
    <!-- 顶部 -->
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">JobPilot</div>

        <div class="actions" v-if="!auth.isAuthed">
          <button class="btn" @click="showAuth = 'login'">Log In</button>
          <button class="btn" @click="showAuth = 'signup'">Sign Up</button>
        </div>
        <div class="actions" v-else>
          <span class="greet">Hi, {{ auth.user?.name || 'User ' + auth.user?.id }}</span>
          <button class="btn" @click="showUploadForm = true">Add New Application</button>
          <button class="btn btn-secondary" @click="auth.logout()">Log out</button>
        </div>
      </div>
    </header>

    <!-- 内容 -->
    <main class="container">
      <section class="section">
        <h1 class="section-title">Your Applications</h1>

        <div v-if="applicationStore.loading" class="hint">Fetching your applications...</div>
        <div v-else-if="applicationStore.error" class="error">{{ applicationStore.error }}</div>

        <!-- 关键：把卡片放进 .cards 容器，交给 CSS Grid 自动铺开 -->
        <div class="cards">
          <ApplicationCard
            v-for="app in applicationStore.applications"
            :key="app.id"
            :applicationId="app.id"
            :hasResume="jobsWithResume.has(app.id)"
            @upload-resume="openResumeForm"
          />
        </div>
      </section>
    </main>

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

    <!-- 登录/注册 -->
    <AuthModal v-if="showAuth" :mode="showAuth" @close="showAuth = false" />
  </div>
</template>

<style scoped>
/* ===== 全局布局 ===== */
.page {
  min-height: 100vh;
  background: #0e0f12;
  color: #e9eaed;
}

/* 调整最大内容宽度：想更宽可以改成 1800px 或 100% */
:root {
  --content-max: 1600px;
}

/* ===== 顶部导航 ===== */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(16, 18, 24, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(6px);
}
.header-inner {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.brand {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #dcdfe4;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.greet {
  opacity: 0.9;
  margin-right: 6px;
}

/* ===== 内容容器 ===== */
.container {
  max-width: var(--content-max);
  margin: 24px auto 80px;
  padding: 0 32px; /* 让两侧更靠边一点可以改小，比如 0 20px */
}
.section {
  margin-top: 6px;
}
.section-title {
  font-size: 24px;
  margin: 10px 0 18px;
  color: #f2f3f5;
}

/* ===== 卡片网格：关键样式 ===== */
.cards {
  display: grid;
  gap: 22px;
  /* 每列最小 380px，屏幕够宽就会自动多列排列 */
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
}
.cards > * {
  height: 100%;
}

/* 超宽屏时再放大（可选） */
@media (min-width: 1800px) {
  :root {
    --content-max: 1800px;
  }
  .cards {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }
}

/* ===== 通用按钮 ===== */
.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #1f6feb;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s ease;
}
.btn:hover {
  background: #175ad1;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #6c757d;
}
.btn-secondary:hover {
  background: #545b62;
}

/* ===== 状态提示 ===== */
.hint {
  color: #b8c0cc;
  margin: 6px 0 14px;
}
.error {
  color: #ff6b6b;
  margin: 6px 0 14px;
}
</style>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useApplicationStore, type Application } from './stores/applicationStore'
import ApplicationCard from './components/ApplicationCard.vue'
import ApplicationUploadForm from './components/ApplicationUploadForm.vue'
import ResumeUploadForm from './components/ResumeUploadForm.vue'

const applicationStore = useApplicationStore()

// 新建 Application 弹窗
const showUploadForm = ref(false)

// 上传简历弹窗
const showResumeForm = ref(false)
const selectedJobId = ref<number | null>(null)

// 记录“已上传简历”的 jobId（用 reactive(Set) 确保响应式）
const jobsWithResume = reactive(new Set<number>())

onMounted(async () => {
  await applicationStore.fetchApplications()

  // 如果后端列表里已经带有 resumeFile，可以在这里初始化（可选）
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
  <header>
    <h1>JobPilot</h1>
    <div class="top-button">
      <button @click="showUploadForm = true">Add New Application</button>
    </div>
  </header>

  <div class="application-list">
    <h1>Your Applications</h1>

    <div v-if="applicationStore.loading">Fetching your applications...</div>
    <div v-else-if="applicationStore.error">{{ applicationStore.error }}</div>

    <ApplicationCard
      v-for="application in applicationStore.applications"
      :key="application.id"
      :applicationId="application.id"
      :hasResume="jobsWithResume.has(application.id)"
      @upload-resume="openResumeForm"
    />
  </div>

  <!-- 新建 Application 表单 -->
  <ApplicationUploadForm
    v-if="showUploadForm"
    @close="showUploadForm = false"
    @submitted="handleAppSubmission"
  />

  <!-- 上传简历弹窗 -->
  <ResumeUploadForm
    v-if="showResumeForm && selectedJobId !== null"
    :job-id="selectedJobId!"
    @uploaded="onResumeUploaded"
    @close="closeResumeForm"
  />
</template>

<style scoped>
header {
  margin-bottom: 20px;
}
.top-button {
  display: flex;
  justify-content: left;
  gap: 10px;
  margin-bottom: 30px;
}
.top-button button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #007bff;
  color: white;
}
.top-button button:hover {
  background-color: #0056b3;
}
.application-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

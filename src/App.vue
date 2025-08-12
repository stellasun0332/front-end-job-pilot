<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useApplicationStore, type Application } from './stores/applicationStore'
import ApplicationCard from './components/ApplicationCard.vue'
import ApplicationUploadForm from './components/ApplicationUploadForm.vue'
import ResumeUploadForm from './components/ResumeUploadForm.vue'

const applicationStore = useApplicationStore()

const showUploadForm = ref(false)
const showResumeForm = ref(false)
const selectedJobId = ref<number | null>(null)

onMounted(() => {
  applicationStore.fetchApplications()
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
</script>

<template>
  <header>
    <h1>JobPilot</h1>
    <div class="top-button">
      <button type="button" @click="showUploadForm = true">Add New Application</button>
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
      @upload-resume="openResumeForm"
    />
  </div>

  <ApplicationUploadForm
    v-if="showUploadForm"
    @close="showUploadForm = false"
    @submitted="handleAppSubmission"
  />

  <ResumeUploadForm
    v-if="showResumeForm && selectedJobId !== null"
    :job-id="selectedJobId!"
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

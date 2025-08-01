<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useApplicationStore, type Application } from './stores/applicationStore'
import ApplicationCard from './components/ApplicationCard.vue'
import ApplicationUploadForm from './components/ApplicationUploadForm.vue'

const applicationStore = useApplicationStore()
const showUploadForm = ref(false)

onMounted(() => {
  applicationStore.fetchApplications()
})

const handleAppSubmission = (newApp: Application) => {
  applicationStore.addApplication({
    ...newApp,
    id: newApp.id,
  })
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
    />
  </div>
  <ApplicationUploadForm
    v-if="showUploadForm"
    @close="showUploadForm = false"
    @submitted="handleAppSubmission"
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
.application-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

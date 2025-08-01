<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { ref, computed } from 'vue'
import InterviewTracker from './InterviewTracker.vue'

const props = defineProps<{ applicationId: number }>()
const applicationStore = useApplicationStore()
const application = computed(() =>
  applicationStore.applications.find((app) => app.id === props.applicationId),
)
const showInterviewTracker = ref(false)
const toggleInterviewTracker = () => {
  showInterviewTracker.value = !showInterviewTracker.value
}
</script>

<template>
  <div class="job-card">
    <div class="job-info">
      <strong>{{ application?.title }}</strong>
      <p>Company: {{ application?.company }}</p>
      <p>Applied on: {{ application?.dateApplied }}</p>
      <p>Status: {{ application?.status }}</p>
      <p>Notes: {{ application?.notes }}</p>
    </div>
    <div class="job-actions">
      <button>Show Job Description</button>
      <button>Analyze Job Description</button>
      <button>Upload Resume</button>
      <button>Edit</button>
      <button @click="toggleInterviewTracker">Interview Tracker</button>
    </div>
    <InterviewTracker
      :isVisible="showInterviewTracker"
      :applicationId="application?.id"
      @close="toggleInterviewTracker"
    />
  </div>
</template>

<style scoped>
.job-card {
  background: #000000;
  color: #ffffff;
  padding: 2vw 2vw;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
  box-sizing: border-box;
}
.job-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
@media (max-width: 500px) {
  .job-card {
    padding: 4vw 2vw;
    max-width: 100%;
    font-size: 0.95rem;
  }
  .job-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

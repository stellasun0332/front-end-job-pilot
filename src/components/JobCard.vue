<script setup lang="ts">
defineProps<{
  job: {
    title: string
    company: string
    appliedOn: string
    status: string
    notes: string
  }
}>()
</script>

<template>
  <div class="job-card">
    <div class="job-info">
      <strong>{{ job.title }}</strong>
      <p>Company: {{ job.company }}</p>
      <p>Applied on: {{ job.appliedOn }}</p>
      <p>Status: {{ job.status }}</p>
      <p>Notes: {{ job.notes }}</p>
    </div>
    <div class="job-actions">
      <button>Show Job Description</button>
      <button>Analyze Job Description</button>
      <button>Edit</button>
      <button>Interview Tracker</button>
    </div>
  </div>
</template>

<style scoped>
.job-card {
  background: #e0e0e0;
  color: #000000;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  margin-bottom: 20px;
}
.job-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
</style>

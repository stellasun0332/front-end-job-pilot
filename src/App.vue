<script setup lang="ts">
import JobCard from './components/JobCard.vue'
//! FOR INITIAL TESTING ONLY - REMOVE LATER:
const jobs = [
  {
    title: 'Software Engineer',
    company: 'Tech Corp',
    appliedOn: '2023-10-01',
    status: 'Applied',
    notes: 'Follow up next week',
  },
  {
    title: 'Frontend Developer',
    company: 'Web Solutions',
    appliedOn: '2023-10-05',
    status: 'Interview Scheduled',
    notes: 'Prepare for technical interview',
  },
]
</script>

<template>
  <header>
    <h1>JobPilot</h1>
    <div class="top-button">
      <button>Add New Application</button>
    </div>
  </header>
  <div class="job-list">
    <h1>Your Applications</h1>
    <JobCard v-for="(job, index) in jobs" :key="index" :job="job" />
  </div>
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
.job-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

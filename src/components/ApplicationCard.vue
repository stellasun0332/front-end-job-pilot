<script setup lang="ts">
import { useApplicationStore, type Application } from '@/stores/applicationStore'
import { ref, computed } from 'vue'
import InterviewTracker from './InterviewTracker.vue'
import JobDescription from './JobDescription.vue'
import ResumeUploadForm from './ResumeUploadForm.vue'

const props = defineProps<{ applicationId: number }>()
const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((app: Application) => app.id === props.applicationId),
)
const showInterviewTracker = ref(false)
const showJobDescription = ref(false)
const showEditApplication = ref(false)
const showResumeUpload = ref(false)

const editApplication = ref<Partial<Application>>({
  title: '',
  company: '',
  dateApplied: '',
  status: '',
  notes: '',
})

const interviewReminder = computed(() => {
  if (!application.value || application.value.status !== 'Interview Scheduled') {
    return null
  }
  const interviewDate = application.value.interview?.date
  if (!interviewDate) {
    return null
  }

  const today = new Date()
  const todayString =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0')

  const interviewDateString = interviewDate

  if (interviewDateString < todayString) {
    return { message: 'Interview date has passed', isPast: true }
  } else if (interviewDateString === todayString) {
    return { message: 'Interview is today!', isToday: true }
  } else {
    const todayDate = new Date(todayString)
    const interviewDateObj = new Date(interviewDateString)
    const timeDiff = interviewDateObj.getTime() - todayDate.getTime()
    const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24))

    if (daysDiff === 1) {
      return { message: 'Interview is tomorrow!', isSoon: true }
    } else {
      return { message: `Interview in ${daysDiff} days`, dayCount: daysDiff }
    }
  }
})

const toggleInterviewTracker = () => {
  showInterviewTracker.value = !showInterviewTracker.value
}

const toggleJobDescription = () => {
  showJobDescription.value = !showJobDescription.value
}

const toggleEditApplication = () => {
  if (!showEditApplication.value && application.value) {
    editApplication.value = {
      title: application.value.title || '',
      company: application.value.company || '',
      dateApplied: application.value.dateApplied || '',
      status: application.value.status || '',
      notes: application.value.notes || '',
    }
  }
  showEditApplication.value = !showEditApplication.value
}

const toggleResumeUpload = () => {
  showResumeUpload.value = !showResumeUpload.value
}

const saveEdit = async () => {
  try {
    await applicationStore.updateApplication(props.applicationId, editApplication.value)
    showEditApplication.value = false
  } catch (error) {
    console.error('Error updating application:', error)
  }
}

const cancelEdit = () => {
  showEditApplication.value = false
}

const downloadResume = async () => {
  if (!application.value?.id) {
    console.error('No application ID available')
    return
  }

  try {
    const response = await fetch(`/resumes/download?jobId=${application.value.id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Set default filename to resume.pdf
    let filename = 'resume.pdf'

    // Get the filename from the Content-Disposition header if available (optional)
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Convert response to blob
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading resume:', error)
    // You might want to show a user-friendly error message here
  }
}
</script>

<template>
  <div class="job-card">
    <div class="job-info">
      <!-- Reminder Notification -->
      <div
        v-if="interviewReminder"
        class="interview-reminder"
        :class="{
          'reminder-past': interviewReminder.isPast,
          'reminder-today': interviewReminder.isToday,
          'reminder-soon': interviewReminder.isSoon,
        }"
      >
        📅 {{ interviewReminder.message }}
      </div>
      <strong>{{ application?.title }}</strong>
      <p>Company: {{ application?.company }}</p>
      <p>Applied on: {{ application?.dateApplied }}</p>
      <p>Status: {{ application?.status }}</p>
      <p>Notes: {{ application?.notes }}</p>
      <div v-if="application?.resumeFile" class="resume-link">
        <button @click="downloadResume" class="download-resume">Download Resume</button>
      </div>
    </div>
    <div class="job-actions">
      <button @click="toggleJobDescription">Job Description</button>
      <button @click="toggleResumeUpload">Upload Resume</button>
      <button @click="toggleEditApplication">Edit</button>
      <button @click="toggleInterviewTracker">Interview Tracker</button>
    </div>
    <InterviewTracker
      v-if="application"
      :isVisible="showInterviewTracker"
      :applicationId="application?.id"
      @close="toggleInterviewTracker"
    />
    <JobDescription
      v-if="application"
      :isVisible="showJobDescription"
      :applicationId="application?.id"
      @close="toggleJobDescription"
    />
    <ResumeUploadForm
      v-if="application"
      :isVisible="showResumeUpload"
      :applicationId="application?.id"
      @close="toggleResumeUpload"
    />
    <!-- Edit View -->
    <div v-if="showEditApplication" class="edit-overlay">
      <div class="edit-modal">
        <p class="application-title">{{ application?.title }} - {{ application?.company }}</p>
        <h2>Edit Application</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label for="editTitle">Job Title:</label>
            <input id="editTitle" type="text" v-model="editApplication.title" required />
          </div>
          <div class="form-group">
            <label for="editCompany">Company:</label>
            <input id="editCompany" type="text" v-model="editApplication.company" required />
          </div>
          <div class="form-group">
            <label for="editDateApplied">Applied On:</label>
            <input
              id="editDateApplied"
              type="date"
              v-model="editApplication.dateApplied"
              required
            />
          </div>
          <div class="form-group">
            <label for="editStatus">Status:</label>
            <select id="editStatus" v-model="editApplication.status" required>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer Received">Offer Received</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editNotes">Notes:</label>
            <textarea id="editNotes" v-model="editApplication.notes" rows="4"></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit">Save</button>
            <button type="button" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </div>
    </div>
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
.interview-reminder {
  background: #007bff;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.reminder-past {
  background: #dc3545;
}
.reminder-today {
  background: #fd7e14;
  animation: pulse 2s infinite;
}
.reminder-soon {
  background: #ffc107;
  color: #000000;
}
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}
.resume-link {
  margin-top: 10px;
}
.download-resume {
  display: inline-block;
  padding: 6px 12px;
  background-color: #28a745;
  color: #ffffff;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.download-resume:hover {
  background-color: #218838;
}
.job-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.job-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #007bff;
  color: white;
}
.job-actions button:hover {
  background-color: #0056b3;
}
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.edit-modal {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: white;
}
.edit-modal h2 {
  margin-bottom: 20px;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group textarea {
  resize: vertical;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.modal-actions button[type='submit'] {
  background-color: #007bff;
  color: white;
}
.modal-actions button[type='submit']:hover {
  background-color: #0056b3;
}
.modal-actions button[type='button'] {
  background-color: #6c757d;
  color: white;
}
.modal-actions button[type='button']:hover {
  background-color: #545b62;
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
  .edit-modal {
    width: 95vw;
    padding: 15px;
  }
}
</style>

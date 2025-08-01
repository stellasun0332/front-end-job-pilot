<script setup lang="ts">
import { useApplicationStore, type Application } from '@/stores/applicationStore'
import { ref, computed } from 'vue'
import InterviewTracker from './InterviewTracker.vue'
import JobDescription from './JobDescription.vue'

const props = defineProps<{ applicationId: number }>()
const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((app: Application) => app.id === props.applicationId),
)
const showInterviewTracker = ref(false)
const showJobDescription = ref(false)
const showEditApplication = ref(false)

const editApplication = ref<Partial<Application>>({
  title: '',
  company: '',
  dateApplied: '',
  status: '',
  notes: '',
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
      <button @click="toggleJobDescription">Job Description</button>
      <button>Upload Resume</button>
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
    <!-- Edit View -->
    <div v-if="showEditApplication" class="edit-overlay">
      <div class="edit-modal">
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

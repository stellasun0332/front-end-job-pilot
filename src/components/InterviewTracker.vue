<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  useApplicationStore,
  type Application,
  type InterviewInfo,
} from '@/stores/applicationStore'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((a) => a.id === props.applicationId),
)
const interview = computed(
  () =>
    application.value?.interview || {
      job: props.applicationId,
      date: '',
      interviewer: '',
      prepNotes: '',
    },
)

const editMode = ref(false)
const editInterview = ref<InterviewInfo>({
  job: props.applicationId,
  date: '',
  interviewer: '',
  prepNotes: '',
})

const saveInterview = async () => {
  try {
    await applicationStore.saveInterview(props.applicationId, {
      ...editInterview.value,
    })
    editMode.value = false
  } catch (err: any) {
    console.error(err)
  }
}
const cancelEdit = () => (editMode.value = false)

watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      editMode.value = false

      await nextTick()

      const interviewData = application.value?.interview
      editInterview.value = {
        job: props.applicationId,
        date: interviewData?.date || '',
        interviewer: interviewData?.interviewer || '',
        prepNotes: interviewData?.prepNotes || '',
      }
    }
  },
)

const close = () => emit('close')
</script>

<template>
  <div v-if="isVisible" class="interview-tracker-overlay">
    <div class="interview-tracker-modal">
      <h2>Interview Details</h2>
      <div v-if="!editMode">
        <div class="interview-content">
          <p><strong>Date:</strong> {{ interview.date || 'Not set' }}</p>
          <p><strong>Interviewer:</strong> {{ interview.interviewer || 'Not set' }}</p>
          <p><strong>Prep Notes:</strong> {{ interview.prepNotes || 'None' }}</p>
        </div>
        <div class="modal-actions">
          <button @click="editMode = true">Edit Interview Info</button>
          <button @click="close">Close</button>
        </div>
      </div>
      <div v-else>
        <div class="edit-content">
          <div class="form-group">
            <label for="interviewDate">Interview Date:</label>
            <input type="date" v-model="editInterview.date" id="interviewDate" />
          </div>

          <div class="form-group">
            <label for="interviewerName">Interviewer Name:</label>
            <input type="text" v-model="editInterview.interviewer" id="interviewerName" />
          </div>

          <div class="form-group">
            <label for="prepNotes">Prep Notes:</label>
            <textarea v-model="editInterview.prepNotes" id="prepNotes" rows="10"></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="saveInterview">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interview-tracker-overlay {
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

.interview-tracker-modal {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: white;
}

.interview-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  min-height: 100px;
  word-wrap: break-word;
}

.interview-content p {
  margin: 0 0 10px 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.interview-content p:last-child {
  margin-bottom: 0;
}

.edit-content {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 200px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions button,
.interview-tracker-modal > div:first-child button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.modal-actions button:first-child,
.interview-tracker-modal > div:first-child button:first-child {
  background-color: #007bff;
  color: white;
}

.modal-actions button:first-child:hover,
.interview-tracker-modal > div:first-child button:first-child:hover {
  background-color: #0056b3;
}

.modal-actions button:not(:first-child),
.interview-tracker-modal > div:first-child button:not(:first-child) {
  background-color: #6c757d;
  color: white;
}

.modal-actions button:not(:first-child):hover,
.interview-tracker-modal > div:first-child button:not(:first-child):hover {
  background-color: #545b62;
}
</style>

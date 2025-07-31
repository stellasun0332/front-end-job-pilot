<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useApplicationStore } from '@/stores/applicationStore'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed(() =>
  applicationStore.applications.find((a) => a.id === props.applicationId),
)
const interview = computed(
  () =>
    application.value?.interview || {
      date: '',
      interviewer: '',
      prepNotes: '',
    },
)

const editMode = ref(false)
const editInterview = ref({
  job: { id: props.applicationId },
  date: '',
  interviewer: '',
  prepNotes: '',
})

const saveInterview = async () => {
  try {
    console.log(editInterview.value)
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
  (visible) => {
    console.log('isVisible changed:', visible)
  },
)
watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      editMode.value = false
      await applicationStore.fetchInterviewInfo(props.applicationId)
      console.log('value:', application.value)

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
        <p>Date: {{ interview.date || 'Not set' }}</p>
        <p>Interviewer: {{ interview.interviewer || 'Not set' }}</p>
        <p>Prep Notes: {{ interview.prepNotes || 'None' }}</p>
        <button @click="editMode = true">Edit Interview Info</button>
        <button @click="close">Close</button>
      </div>
      <div v-else>
        <p>
          <label for="interviewDate">Interview Date:</label>
          <input type="date" v-model="editInterview.date" id="interviewDate" />
        </p>

        <p><label for="interviewerName">Interviewer Name:</label></p>
        <input type="text" v-model="editInterview.interviewer" id="interviewerName" />

        <p><label for="prepNotes">Prep Notes:</label></p>
        <textarea v-model="editInterview.prepNotes" id="prepNotes"></textarea>

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
}

.interview-tracker-modal {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
</style>

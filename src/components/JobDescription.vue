<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useApplicationStore, type Application } from '@/stores/applicationStore'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((a: any) => a.id === props.applicationId),
)
const jobDescription = computed(() => application.value?.jobDescription || 'None')

const editMode = ref(false)
const editDescription = ref('')

const saveDescription = async () => {
  try {
    await applicationStore.updateJobDescription(props.applicationId, editDescription.value)
    editMode.value = false
  } catch (err: any) {
    console.error(err)
  }
}

const cancelEdit = () => {
  editMode.value = false
  editDescription.value = application.value?.jobDescription || ''
}

const startEdit = () => {
  editDescription.value = application.value?.jobDescription || ''
  editMode.value = true
}

watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      editMode.value = false
      await nextTick()
      editDescription.value = application.value?.jobDescription || ''
    }
  },
)

const close = () => emit('close')
const analyzeDescription = () => {
  //TODO: Implement AI analysis feature
  console.log('AI job description analyzer coming soon!')
}
</script>

<template>
  <div v-if="isVisible" class="job-description-overlay">
    <div class="job-description-modal">
      <h2>Job Description</h2>
      <div v-if="!editMode" class="description-view">
        <div class="description-content">
          <p>{{ jobDescription }}</p>
        </div>
        <div class="modal-actions">
          <button @click="startEdit">Edit Description</button>
          <button @click="analyzeDescription">Analyze Description</button>
          <button @click="close">Close</button>
        </div>
      </div>
      <div v-else class="description-edit">
        <div class="edit-content">
          <label for="jobDescriptionEdit">Job Description:</label>
          <textarea
            id="jobDescriptionEdit"
            v-model="editDescription"
            placeholder="Enter job description here"
            rows="10"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveDescription">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-description-overlay {
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

.job-description-modal {
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

.description-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  word-wrap: break-word;
}

.description-content p {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.edit-content {
  margin-bottom: 20px;
}

.edit-content label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.edit-content textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 200px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.modal-actions button:first-child {
  background-color: #007bff;
  color: white;
}

.modal-actions button:first-child:hover {
  background-color: #0056b3;
}

.modal-actions button:not(:first-child) {
  background-color: #6c757d;
  color: white;
}

.modal-actions button:not(:first-child):hover {
  background-color: #545b62;
}
</style>

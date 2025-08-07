<script setup lang="ts">
import { ref, computed, type App } from 'vue'
import { useApplicationStore, type Application } from '@/stores/applicationStore'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((a: Application) => a.id === props.applicationId),
)

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadError = ref('')

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
]

const validateFile = (file: File): boolean => {
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Please upload a valid resume file (PDF, DOC, DOCX, TXT, or RTF)'
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = 'File size must be less than 10MB'
    return false
  }

  uploadError.value = ''
  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const file = event.dataTransfer?.files[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadResume = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('jobId', props.applicationId.toString())

    const response = await fetch('https://jobpilot-backend-62hx.onrender.com/resumes/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    await applicationStore.updateApplication(props.applicationId, {
      resumeUrl: result.resumeUrl,
    })

    close()
  } catch (error: any) {
    console.log(error)
    uploadError.value = 'Failed to upload resume. Please try again.'
  } finally {
    isUploading.value = false
  }
}

const close = () => {
  selectedFile.value = null
  uploadError.value = ''
  isDragOver.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('close')
}
</script>

<template>
  <div v-if="isVisible" class="resume-upload-overlay">
    <div class="resume-upload-modal">
      <h2>Upload Resume</h2>
      <p class="application-title">{{ application?.title }} - {{ application?.company }}</p>

      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          @change="handleFileSelect"
          class="file-input"
        />

        <div v-if="!selectedFile" class="upload-placeholder">
          <div class="upload-icon">📄</div>
          <p>Drag and drop your resume here or click to browse</p>
          <p class="file-types">Supported formats: PDF, DOC, DOCX, TXT, RTF</p>
        </div>

        <div v-else class="file-selected">
          <div class="file-icon">📄</div>
          <span>{{ selectedFile.name }}</span>
          <button @click.stop="clearFile" class="remove-file">×</button>
        </div>
      </div>

      <div v-if="uploadError" class="error-message">
        {{ uploadError }}
      </div>

      <div class="modal-actions">
        <button @click="uploadResume" :disabled="!selectedFile || isUploading" type="submit">
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </button>
        <button type="button" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resume-upload-overlay {
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

.resume-upload-modal {
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

.resume-upload-modal h2 {
  margin-bottom: 20px;
  text-align: center;
}

.application-title {
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #ffffff;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 20px;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #007bff;
  background-color: rgba(255, 255, 255, 0.05);
}

.file-input {
  display: none;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon,
.file-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.file-types {
  font-size: 0.875rem;
  color: #ccc;
  margin-top: 0.5rem;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 6px;
  pointer-events: none;
}

.remove-file {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  pointer-events: all;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-bottom: 20px;
  text-align: center;
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

.modal-actions button[type='submit']:hover:not(:disabled) {
  background-color: #0056b3;
}

.modal-actions button[type='submit']:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.modal-actions button[type='button'] {
  background-color: #6c757d;
  color: white;
}

.modal-actions button[type='button']:hover {
  background-color: #545b62;
}

@media (max-width: 500px) {
  .resume-upload-modal {
    width: 95vw;
    padding: 15px;
  }
}
</style>

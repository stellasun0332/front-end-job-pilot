<script setup lang="ts">
<<<<<<< HEAD
import { ref, watch, onBeforeUnmount } from 'vue'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'

const props = defineProps<{ jobId: number }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'uploaded', p: { jobId: number; url: string }): void
}>()

const file = ref<File | null>(null)
const uploading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function onPick(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
  errorMsg.value = ''
  successMsg.value = ''
}
function close() {
  document.body.style.overflow = '' // 恢复滚动
  emit('close')
}

async function upload() {
  if (!file.value) {
    errorMsg.value = 'Please select a file (.pdf .doc .docx).'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file.value)
    fd.append('jobId', String(props.jobId))

    const resp = await fetch(`${API_BASE}/resumes/upload`, { method: 'POST', body: fd })
    const text = await resp.text()
    if (!resp.ok) throw new Error(text || 'Upload failed')

    const url = text.trim()
    if (!/^https?:\/\/.+/.test(url)) throw new Error('Unexpected server response (not a URL).')

    successMsg.value = 'Resume uploaded.'
    emit('uploaded', { jobId: props.jobId, url })
    close()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Upload failed.'
    console.error(e)
  } finally {
    uploading.value = false
  }
}

/* 打开时锁住页面滚动（此组件一般用 v-if 控制显示） */
watch(
  () => true,
  () => {
    document.body.style.overflow = 'hidden'
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- 关键：Teleport 到 body，避免被卡片 transform 限制 -->
  <teleport to="body">
    <div class="ru-overlay" @click.self="close" @keydown.esc="close" tabindex="0">
      <div class="ru-modal" @click.stop>
        <header class="ru-header">
          <h2>Upload Resume</h2>
          <button class="icon-btn" aria-label="Close" @click="close">✕</button>
        </header>

        <div class="ru-body">
          <p class="muted">Job ID: {{ props.jobId }}</p>

          <!-- 自定义文件选择器 -->
          <label class="file-picker">
            <input
              class="file-input"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              @change="onPick"
            />
            <span class="file-button">Choose File</span>
            <span class="file-name">{{ file?.name || 'No file chosen' }}</span>
          </label>

          <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>
          <p v-if="successMsg" class="msg success">{{ successMsg }}</p>
        </div>

        <footer class="ru-actions">
          <button class="btn primary" type="button" @click="upload" :disabled="uploading">
            {{ uploading ? 'Uploading…' : 'Upload' }}
          </button>
          <button class="btn ghost" type="button" @click="close" :disabled="uploading">
            Close
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* 遮罩：全屏覆盖 */
.ru-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 不透明深色弹窗，与 Job Description 保持一致 */
.ru-modal {
  width: 640px;
  max-width: 94vw;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background-color: #171b22;
  color: #eaf0ff;
  border: 1px solid #2a2f3a;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  padding: 18px;
}

.ru-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 12px;
  border-bottom: 1px solid #262c36;
}
.ru-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 850;
  letter-spacing: 0.2px;
  color: #fff;
}
.icon-btn {
  appearance: none;
  border: 1px solid #343b47;
  background: #242a35;
  color: #eaf0ff;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    opacity 0.2s ease;
}
.icon-btn:hover {
  transform: translateY(-1px);
  border-color: #4a90e2;
}

.ru-body {
  padding: 14px 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.muted {
  margin: 0;
  color: #9fb0d0;
}

/* 自定义文件选择器 */
.file-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #1e2430;
  border: 1px solid #313848;
  color: #eaf0ff;
  padding: 12px 14px;
  border-radius: 12px;
}
.file-input {
  display: none;
} /* 隐藏原生 input */
.file-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(180deg, #5aa3ff 0%, #3b7ce6 100%);
  border: 1px solid rgba(90, 163, 255, 0.5);
  box-shadow: 0 10px 26px rgba(90, 163, 255, 0.28);
}
.file-picker:hover .file-button {
  transform: translateY(-1px);
}
.file-name {
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 成功/错误信息 */
.msg {
  margin: 0;
  font-size: 14px;
}
.msg.error {
  color: #ff8e8e;
}
.msg.success {
  color: #7be495;
}

/* 底部按钮组（与全站一致） */
.ru-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 8px 6px 4px;
  margin-top: 4px;
  border-top: 1px solid #262c36;
}
.btn {
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 800;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    opacity 0.2s ease;
}
.btn:hover {
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
.btn.primary {
  background: linear-gradient(180deg, #5aa3ff 0%, #3b7ce6 100%);
  color: #fff;
  border-color: rgba(90, 163, 255, 0.5);
  box-shadow: 0 12px 30px rgba(90, 163, 255, 0.3);
}
.btn.ghost {
  background: #242a35;
  color: #eaf0ff;
  border-color: #343b47;
}

@media (max-width: 640px) {
  .ru-modal {
    width: 92vw;
    padding: 14px;
  }
  .ru-header h2 {
    font-size: 22px;
  }
  .btn {
    padding: 10px 14px;
=======
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

    const result = await response.text()
    await applicationStore.updateApplication(props.applicationId, {
      resumeFile: result,
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
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
  }
}
</style>

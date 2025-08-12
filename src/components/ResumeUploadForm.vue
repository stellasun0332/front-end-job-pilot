<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'

const props = defineProps<{
  jobId: number
  application?: { title: string; company: string }
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'uploaded', p: { jobId: number; url: string }): void
}>()

const file = ref<File | null>(null)
const uploading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isDragOver = ref(false)

function onPick(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
  errorMsg.value = ''
  successMsg.value = ''
}

function close() {
  document.body.style.overflow = '' // 恢复滚动
  emit('close')
}

// Drag and drop handlers
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const droppedFile = files[0]

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const allowedExtensions = ['.pdf', '.doc', '.docx']

    if (
      allowedTypes.includes(droppedFile.type) ||
      allowedExtensions.some((ext) => droppedFile.name.toLowerCase().endsWith(ext))
    ) {
      file.value = droppedFile
      errorMsg.value = ''
      successMsg.value = ''
    } else {
      errorMsg.value = 'Please select a valid file (.pdf .doc .docx).'
    }
  }
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
          <p class="muted">{{ application?.title }} - {{ application?.company }}</p>

          <!-- Drag and drop zone -->
          <div
            class="drop-zone"
            :class="{ 'drag-over': isDragOver }"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <div class="drop-zone-content">
              <div class="drop-icon">📄</div>
              <p class="drop-text">
                <strong>Drop your resume here</strong><br />
                or click to browse files
              </p>
              <p class="drop-formats">Supports PDF, DOC, DOCX</p>
            </div>

            <!-- Hidden file input -->
            <input
              class="file-input"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              @change="onPick"
            />
          </div>

          <!-- Show selected file -->
          <div v-if="file" class="selected-file">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">({{ Math.round(file.size / 1024) }}KB)</span>
          </div>

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

/* Drag and drop zone */
.drop-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 32px 24px;
  background: #1e2430;
  border: 2px dashed #313848;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: #4a90e2;
  background: #242a37;
}

.drop-zone.drag-over {
  border-color: #5aa3ff;
  background: #2a3441;
  transform: scale(1.02);
}

.drop-zone-content {
  text-align: center;
  pointer-events: none;
}

.drop-icon {
  font-size: 42px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.drop-text {
  margin: 0 0 12px;
  color: #eaf0ff;
  line-height: 1.5;
  font-size: 16px;
}

.drop-formats {
  margin: 0;
  font-size: 13px;
  color: #9fb0d0;
  opacity: 0.8;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Selected file display */
.selected-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #242a35;
  border: 1px solid #343b47;
  border-radius: 12px;
  color: #eaf0ff;
}

.file-icon {
  font-size: 20px;
  opacity: 0.8;
}

.file-name {
  flex: 1;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #9fb0d0;
  opacity: 0.8;
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
  }
  .drop-zone {
    min-height: 140px;
    padding: 28px 20px;
  }
  .drop-icon {
    font-size: 36px;
    margin-bottom: 14px;
  }
  .drop-text {
    font-size: 15px;
  }
}
</style>

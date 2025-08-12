<script setup lang="ts">
import { ref } from 'vue'
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
}
function close() {
  emit('close')
}

async function upload() {
  if (!file.value) {
    errorMsg.value = 'Please select a file.'
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
    // 通知父组件：这个 job 已经有简历了
    emit('uploaded', { jobId: props.jobId, url })
    emit('close')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Upload failed.'
    console.error(e)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="overlay" @click="close">
    <div class="modal" @click.stop>
      <h3>Upload Resume</h3>
      <p style="opacity: 0.8; margin-top: -6px">Job ID: {{ props.jobId }}</p>

      <input type="file" accept=".pdf,.doc,.docx" @change="onPick" />
      <p v-if="errorMsg" style="color: #ff6b6b; margin: 8px 0">{{ errorMsg }}</p>
      <p v-if="successMsg" style="color: #4cd964; margin: 8px 0">{{ successMsg }}</p>

      <div class="actions">
        <button type="button" @click="upload" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
        <button type="button" @click="close" :disabled="uploading">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 同之前 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #464444;
  color: #fff;
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}
.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.actions button:first-child {
  background: #007bff;
  color: #fff;
}
.actions button:first-child:hover {
  background: #0056b3;
}
.actions button:last-child {
  background: #6c757d;
  color: #fff;
}
.actions button:last-child:hover {
  background: #545b62;
}
</style>

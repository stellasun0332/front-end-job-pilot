<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'
const emit = defineEmits<{ (e: 'close'): void; (e: 'submitted', job: any): void }>()

const auth = useAuthStore()
const isAuthed = computed(() => !!auth.user && !!auth.token)

const form = ref({
  user: { id: '' }, // 会在提交前用 auth.user.id 自动填充
  title: '',
  company: '',
  jobDescription: '',
  dateApplied: '',
  status: 'Applied',
  notes: '',
})

const submitting = ref(false)
const errorMsg = ref('')

async function submitApplication() {
  errorMsg.value = ''
  if (!isAuthed.value) {
    errorMsg.value = 'Please log in before creating an application.'
    return
  }

  // 用登录用户的 ID 覆盖
  form.value.user.id = String(auth.user!.id)

  submitting.value = true
  try {
    const resp = await axios.post(`${API_BASE}/jobs`, form.value)
    emit('submitted', resp.data)
    emit('close')
  } catch (e: any) {
    console.error(e)
    errorMsg.value = e?.response?.data || e?.message || 'Failed to submit application.'
  } finally {
    submitting.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="overlay" @click="close">
    <div class="upload-form" @click.stop>
      <h2>Add New Application</h2>

      <form @submit.prevent="submitApplication">
        <!-- 已移除 Your ID 输入框；ID 将使用当前登录用户 -->

        <div class="form-group">
          <label for="title">Job Title:</label>
          <input id="title" type="text" v-model="form.title" required />
        </div>

        <div class="form-group">
          <label for="company">Company:</label>
          <input id="company" type="text" v-model="form.company" required />
        </div>

        <div class="form-group">
          <label for="jobDescription">Job Description</label>
          <textarea id="jobDescription" v-model="form.jobDescription" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label for="appliedOn">Applied On:</label>
          <input id="appliedOn" type="date" v-model="form.dateApplied" required />
        </div>

        <div class="form-group">
          <label for="status">Status:</label>
          <select id="status" v-model="form.status" required>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer Received">Offer Received</option>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Notes:</label>
          <textarea id="notes" v-model="form.notes" rows="4"></textarea>
        </div>

        <p v-if="!isAuthed" class="hint">
          You are not logged in. Please log in to create an application.
        </p>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <div class="modal-actions">
          <button type="submit" :disabled="submitting || !isAuthed">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" @click="close" :disabled="submitting">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.upload-form {
  background: #464444;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.upload-form h2 {
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
  font: inherit;
  box-sizing: border-box;
}
.form-group textarea {
  resize: vertical;
}
.hint {
  color: #ffd166;
  margin: 8px 0;
}
.error {
  color: #ff6b6b;
  margin: 8px 0;
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
  background: #007bff;
  color: #fff;
}
.modal-actions button[type='button'] {
  background: #6c757d;
  color: #fff;
}
</style>

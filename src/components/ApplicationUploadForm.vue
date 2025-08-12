<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'
const emit = defineEmits<{ (e: 'close'): void; (e: 'submitted', job: any): void }>()

const auth = useAuthStore()
const isAuthed = computed(() => !!auth.user && !!auth.token)

const form = ref({
  user: { id: '' }, // 提交前用 auth.user.id 自动填充
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
    close()
  } catch (e: any) {
    console.error(e)
    errorMsg.value = e?.response?.data || e?.message || 'Failed to submit application.'
  } finally {
    submitting.value = false
  }
}

function close() {
  document.body.style.overflow = ''
  emit('close')
}

/* 组件通过 v-if 显示：挂载即锁滚动，卸载恢复 */
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
<<<<<<< HEAD
  <!-- Teleport：把弹窗放到 body 顶层，避免被父级 transform 限制 -->
  <teleport to="body">
    <div class="au-overlay" @click.self="close" @keydown.esc="close" tabindex="0">
      <div class="au-modal" @click.stop>
        <header class="au-header">
          <h2>Add New Application</h2>
          <button class="icon-btn" aria-label="Close" @click="close">✕</button>
        </header>

        <form class="au-body" @submit.prevent="submitApplication">
          <div class="form-row">
            <label for="title">Job Title</label>
            <input id="title" type="text" v-model="form.title" required />
          </div>

          <div class="form-row">
            <label for="company">Company</label>
            <input id="company" type="text" v-model="form.company" required />
          </div>

          <div class="form-row">
            <label for="jobDescription">Job Description</label>
            <textarea id="jobDescription" v-model="form.jobDescription" rows="6"></textarea>
          </div>

          <div class="grid-2">
            <div class="form-row">
              <label for="appliedOn">Applied On</label>
              <input id="appliedOn" type="date" v-model="form.dateApplied" required />
            </div>

            <div class="form-row">
              <label for="status">Status</label>
              <select id="status" v-model="form.status" required>
                <option value="Applied">Applied</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer Received">Offer Received</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="form.notes" rows="4"></textarea>
          </div>

          <p v-if="!isAuthed" class="hint">
            You are not logged in. Please log in to create an application.
          </p>
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

          <footer class="au-actions">
            <button class="btn primary" type="submit" :disabled="submitting || !isAuthed">
              {{ submitting ? 'Saving…' : 'Save' }}
            </button>
            <button class="btn ghost" type="button" @click="close" :disabled="submitting">
              Cancel
            </button>
          </footer>
        </form>
      </div>
=======
  <div class="overlay" @click="close">
    <div class="upload-form" @click.stop>
      <h2>Add New Application</h2>
      <form @submit.prevent="submitApplication">
        <div class="form-group">
          <label for="id">Your ID:</label>
          <input id="id" type="number" v-model="form.user.id" required />
        </div>
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
        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" @click="close">Cancel</button>
        </div>
      </form>
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
    </div>
  </teleport>
</template>

<style scoped>
/* 遮罩：全屏覆盖 */
.au-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 不透明深色弹窗（与其它弹窗统一） */
.au-modal {
  width: 760px;
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
.au-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 12px;
  border-bottom: 1px solid #262c36;
}
.au-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
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

.au-body {
  padding: 12px 6px 6px;
  overflow: auto;
}

/* 网格：日期+状态 并排 */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 表单控件统一风格 */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.form-row label {
  font-size: 13px;
  color: #9fb0d0;
}
input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  outline: none;
  background: #1e2430;
  color: #eef3ff;
  border: 1px solid #313848;
  font: inherit;
}
textarea {
  resize: vertical;
}

.hint {
  color: #ffd166;
  margin: 6px 0 0;
}
.error {
  color: #ff8e8e;
  margin: 6px 0 0;
}

/* 按钮体系（统一蓝色 + 次要幽灵） */
.au-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 10px 6px 4px;
  margin-top: 6px;
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
  .au-modal {
    width: 92vw;
    padding: 14px;
  }
  .au-header h2 {
    font-size: 22px;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .btn {
    padding: 10px 14px;
  }
}
</style>

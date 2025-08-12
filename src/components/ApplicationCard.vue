<script setup lang="ts">
import { useApplicationStore, type Application } from '@/stores/applicationStore'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import InterviewTracker from './InterviewTracker.vue'
import JobDescription from './JobDescription.vue'
import ResumeUploadForm from './ResumeUploadForm.vue'

const API_BASE = 'https://jobpilot-backend-62hx.onrender.com'

const props = defineProps<{ applicationId: number; hasResume?: boolean }>()
const emit = defineEmits<{ (e: 'upload-resume', jobId: number): void }>()

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((app: Application) => app.id === props.applicationId),
)

const showInterviewTracker = ref(false)
const showJobDescription = ref(false)
const showEditApplication = ref(false)
<<<<<<< HEAD
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const deleteError = ref('')
=======
const showResumeUpload = ref(false)
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51

const editApplication = ref<Partial<Application>>({
  title: '',
  company: '',
  dateApplied: '',
  status: '',
  notes: '',
})

const interviewReminder = computed(() => {
  if (!application.value || application.value.status !== 'Interview Scheduled') return null
  const interviewDate = application.value.interview?.date
  if (!interviewDate) return null

  const today = new Date()
  const todayString =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0')

  if (interviewDate < todayString) return { message: 'Interview date has passed', isPast: true }
  if (interviewDate === todayString) return { message: 'Interview is today!', isToday: true }

  const d1 = new Date(todayString)
  const d2 = new Date(interviewDate)
  const days = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))
  return days === 1
    ? { message: 'Interview is tomorrow!', isSoon: true }
    : { message: `Interview in ${days} days`, dayCount: days }
})

const toggleInterviewTracker = () => (showInterviewTracker.value = !showInterviewTracker.value)
const toggleJobDescription = () => (showJobDescription.value = !showJobDescription.value)

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

const toggleResumeUpload = () => {
  showResumeUpload.value = !showResumeUpload.value
}

const saveEdit = async () => {
  try {
    await applicationStore.updateApplication(props.applicationId, editApplication.value)
    showEditApplication.value = false
  } catch (error) {
    console.error('Error updating application:', error)
  }
}
const cancelEdit = () => (showEditApplication.value = false)

/* 删除 */
function openDelete() {
  deleteError.value = ''
  showDeleteConfirm.value = true
}
<<<<<<< HEAD
function cancelDelete() {
  showDeleteConfirm.value = false
}
async function confirmDelete() {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await applicationStore.deleteApplication(props.applicationId)
    showDeleteConfirm.value = false
  } catch (e: any) {
    console.error(e)
    deleteError.value = e?.message || 'Failed to delete. Please try again.'
  } finally {
    deleting.value = false
  }
}

/* 下载 */
const downloading = ref(false)
async function downloadResume() {
  if (!props.hasResume) {
    alert('Please upload your resume before downloading.')
    return
  }
  downloading.value = true
  try {
    const jobId = props.applicationId
    const resp = await fetch(`${API_BASE}/resumes/download?jobId=${jobId}`)
    const text = await resp.text()
    if (!resp.ok) throw new Error(text || 'Download failed')

    const url = text.trim()
    if (!/^https?:\/\/.+/.test(url)) throw new Error('Unexpected server response (not a URL).')

    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Download failed')
  } finally {
    downloading.value = false
  }
}

/* 打开任一弹窗时锁滚动 */
watch([showEditApplication, showDeleteConfirm], ([editOpen, delOpen]) => {
  document.body.style.overflow = editOpen || delOpen ? 'hidden' : ''
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
=======

const downloadResume = async () => {
  if (!application.value?.id) {
    console.error('No application ID available')
    return
  }

  try {
    const response = await fetch(
      `https://jobpilot-backend-62hx.onrender.com/resumes/download?jobId=${application.value.id}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Set default filename to resume.pdf
    let filename = 'resume.pdf'

    // Get the filename from the Content-Disposition header if available (optional)
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Convert response to blob
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading resume:', error)
    // You might want to show a user-friendly error message here
  }
}
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
</script>

<template>
  <article class="jp-card">
    <div
      v-if="interviewReminder"
      class="jp-badge"
      :class="{
        danger: interviewReminder.isPast,
        warning: interviewReminder.isSoon,
        today: interviewReminder.isToday,
        positive:
          !interviewReminder.isPast && !interviewReminder.isSoon && !interviewReminder.isToday,
      }"
    >
      📅 {{ interviewReminder.message }}
    </div>

    <h3 class="jp-title">{{ application?.title }}</h3>

    <div class="jp-meta">
      <div>
        Company: <span>{{ application?.company }}</span>
      </div>
      <div>
        Applied on: <span>{{ application?.dateApplied }}</span>
      </div>
      <div>
        Status: <span>{{ application?.status }}</span>
      </div>
<<<<<<< HEAD
    </div>

    <p v-if="application?.notes" class="jp-notes">{{ application?.notes }}</p>

    <!-- 小尺寸按钮，2 行 3 列 -->
    <div class="jp-actions">
      <button class="btn primary" @click="toggleJobDescription">Job Description</button>
      <button class="btn primary" @click="emit('upload-resume', applicationId)">
        Upload Resume
      </button>
      <button class="btn primary" :disabled="downloading" @click="downloadResume">
        {{ downloading ? 'Downloading…' : 'Download Resume' }}
      </button>

      <button class="btn primary" @click="toggleEditApplication">Edit</button>
      <button class="btn primary" @click="toggleInterviewTracker">Interview Tracker</button>
      <button class="btn primary" @click="openDelete">Delete</button>
=======
      <strong>{{ application?.title }}</strong>
      <p>Company: {{ application?.company }}</p>
      <p>Applied on: {{ application?.dateApplied }}</p>
      <p>Status: {{ application?.status }}</p>
      <p>Notes: {{ application?.notes }}</p>
      <div v-if="application?.resumeFile" class="resume-link">
        <button @click="downloadResume" class="download-resume">Download Resume</button>
      </div>
    </div>
    <div class="job-actions">
      <button @click="toggleJobDescription">Job Description</button>
      <button @click="toggleResumeUpload">Upload Resume</button>
      <button @click="toggleEditApplication">Edit</button>
      <button @click="toggleInterviewTracker">Interview Tracker</button>
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
    </div>

    <!-- 子弹窗 -->
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
<<<<<<< HEAD

    <!-- 编辑弹窗 -->
    <teleport to="body">
      <div
        v-if="showEditApplication"
        class="edit-overlay"
        @click.self="cancelEdit"
        @keydown.esc="cancelEdit"
        tabindex="0"
      >
        <div class="edit-modal">
          <header class="edit-header">
            <h4>Edit Application</h4>
            <button class="icon-btn" aria-label="Close" @click="cancelEdit">✕</button>
          </header>

          <form class="edit-body" @submit.prevent="saveEdit">
            <div class="form-row">
              <label for="editTitle">Job Title</label>
              <input id="editTitle" type="text" v-model="editApplication.title" required />
            </div>
            <div class="form-row">
              <label for="editCompany">Company</label>
              <input id="editCompany" type="text" v-model="editApplication.company" required />
            </div>
            <div class="form-row">
              <label for="editDateApplied">Applied On</label>
              <input
                id="editDateApplied"
                type="date"
                v-model="editApplication.dateApplied"
                required
              />
            </div>
            <div class="form-row">
              <label for="editStatus">Status</label>
              <select id="editStatus" v-model="editApplication.status" required>
                <option value="Applied">Applied</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer Received">Offer Received</option>
              </select>
            </div>
            <div class="form-row">
              <label for="editNotes">Notes</label>
              <textarea id="editNotes" v-model="editApplication.notes" rows="4"></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn primary" type="submit">Save</button>
              <button class="btn ghost" type="button" @click="cancelEdit">Cancel</button>
            </div>
          </form>
        </div>
=======
    <ResumeUploadForm
      v-if="application"
      :isVisible="showResumeUpload"
      :applicationId="application?.id"
      @close="toggleResumeUpload"
    />
    <!-- Edit View -->
    <div v-if="showEditApplication" class="edit-overlay">
      <div class="edit-modal">
        <p class="application-title">{{ application?.title }} - {{ application?.company }}</p>
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
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
      </div>
    </teleport>

    <!-- 删除确认弹窗 -->
    <teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="edit-overlay"
        @click.self="cancelDelete"
        @keydown.esc="cancelDelete"
        tabindex="0"
      >
        <div class="del-modal">
          <header class="edit-header">
            <h4>Delete Application</h4>
            <button class="icon-btn" aria-label="Close" @click="cancelDelete">✕</button>
          </header>

          <section class="del-body">
            <p class="del-text">
              This will permanently delete
              <strong>{{ application?.title || 'this application' }}</strong
              >. This action cannot be undone.
            </p>
            <p v-if="deleteError" class="del-error">{{ deleteError }}</p>
          </section>

          <div class="modal-actions">
            <button class="btn primary" :disabled="deleting" @click="confirmDelete">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
            <button class="btn ghost" :disabled="deleting" @click="cancelDelete">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>
  </article>
</template>

<style scoped>
/* ===== 卡片 ===== */
.jp-card {
  position: relative;
  color: #eef3ff;
  border-radius: 18px;
  padding: 20px;
  background:
    radial-gradient(
      140% 120% at 10% -20%,
      rgba(124, 192, 255, 0.12) 0%,
      rgba(124, 192, 255, 0) 60%
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 30px 80px rgba(0, 0, 0, 0.55);
  transition:
    transform 0.15s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}
.jp-card:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    0 40px 100px rgba(0, 0, 0, 0.6);
  border-color: rgba(124, 192, 255, 0.32);
}

/* 顶部状态条 */
.jp-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  border-radius: 10px;
  font-weight: 800;
  margin-bottom: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
}
.jp-badge.positive {
  color: #fff;
  background: linear-gradient(180deg, #2f80ff, #1f63e6);
  border-color: rgba(90, 163, 255, 0.5);
  box-shadow: 0 10px 24px rgba(90, 163, 255, 0.3);
}
.jp-badge.warning {
  color: #0b0f17;
  background: linear-gradient(180deg, #ffd76a, #ffbd3b);
  border-color: rgba(255, 210, 86, 0.7);
  box-shadow: 0 10px 22px rgba(255, 190, 60, 0.3);
}
.jp-badge.today {
  color: #fff;
  background: linear-gradient(180deg, #ff9a62, #fd7e14);
  border-color: rgba(253, 126, 20, 0.62);
  animation: pulse 2s infinite;
}
.jp-badge.danger {
  color: #fff;
  background: linear-gradient(180deg, #ff6b6b, #e45050);
  border-color: rgba(255, 107, 107, 0.62);
  box-shadow: 0 10px 22px rgba(255, 107, 107, 0.3);
}
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.78;
  }
  100% {
    opacity: 1;
  }
}
<<<<<<< HEAD

.jp-title {
  font-size: 20px;
  font-weight: 850;
  margin: 4px 0 10px;
  color: #fff;
=======
.resume-link {
  margin-top: 10px;
}
.download-resume {
  display: inline-block;
  padding: 6px 12px;
  background-color: #28a745;
  color: #ffffff;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.download-resume:hover {
  background-color: #218838;
}
.job-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
}
.jp-meta {
  display: grid;
  gap: 6px;
  font-size: 14px;
  color: #9fb0d0;
}
.jp-meta span {
  color: #eef3ff;
}
.jp-notes {
  margin: 12px 0 6px;
  color: #c7d3ec;
  line-height: 1.55;
}

/* ===== 小尺寸按钮区（两行三列） ===== */
.jp-actions {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 10px 12px;
}
.btn {
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  line-height: 1.1;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    opacity 0.2s ease;
  min-height: 40px;
  justify-self: stretch;
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
  box-shadow: 0 8px 20px rgba(90, 163, 255, 0.22);
}
.btn.ghost {
  background: #242a35;
  color: #eaf0ff;
  border-color: #343b47;
}

/* ===== 弹窗（编辑/删除） ===== */
.edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.edit-modal,
.del-modal {
  width: 560px;
  max-width: 94vw;
  max-height: 88vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: #171b22;
  color: #eaf0ff;
  border: 1px solid #2a2f3a;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  padding: 16px;
}
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 10px;
  border-bottom: 1px solid #262c36;
}
.edit-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 850;
  color: #fff;
}
.icon-btn {
  appearance: none;
  border: 1px solid #343b47;
  background: #242a35;
  color: #eaf0ff;
  border-radius: 10px;
  padding: 5px 9px;
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

.edit-body,
.del-body {
  padding: 10px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-row label {
  font-size: 12px;
  color: #9fb0d0;
}
.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  outline: none;
  background: #1e2430;
  color: #eef3ff;
  border: 1px solid #313848;
}
.form-row textarea {
  resize: vertical;
  min-height: 90px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 8px 4px 4px;
  border-top: 1px solid #262c36;
}

.del-text {
  margin: 2px 4px 0;
  line-height: 1.55;
  color: #e9eefc;
}
.del-error {
  color: #ff8e8e;
  margin: 0 4px;
}

/* 响应式 */
@media (max-width: 980px) {
  .jp-actions {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}
@media (max-width: 640px) {
  .jp-card {
    padding: 16px;
  }
  .btn {
    min-height: 38px;
    font-size: 13px;
    padding: 7px 10px;
  }
  .jp-actions {
    grid-template-columns: 1fr;
  }
  .edit-modal,
  .del-modal {
    width: 92vw;
    padding: 14px;
  }
}
</style>

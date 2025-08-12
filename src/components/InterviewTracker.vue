<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import {
  useApplicationStore,
  type Application,
  type InterviewInfo,
} from '@/stores/applicationStore'

const props = defineProps<{ applicationId: number; isVisible: boolean }>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((a) => a.id === props.applicationId),
)

const interview = computed<InterviewInfo>(
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

async function saveInterview() {
  try {
    await applicationStore.saveInterview(props.applicationId, {
      job: { id: props.applicationId },
      date: editInterview.value.date,
      interviewer: editInterview.value.interviewer,
      prepNotes: editInterview.value.prepNotes,
    })

    if (editInterview.value.date && application.value) {
      await applicationStore.updateApplication(props.applicationId, {
        ...application.value,
        status: 'Interview Scheduled',
      })
    }
    editMode.value = false
  } catch (err) {
    console.error('Error saving interview:', err)
  }
}
const cancelEdit = () => (editMode.value = false)
const startEdit = () => {
  editInterview.value = { ...interview.value, job: props.applicationId }
  editMode.value = true
}

const close = () => {
  document.body.style.overflow = ''
  emit('close')
}

/* 打开时：填充表单 + 锁滚动；关闭时：恢复滚动 */
watch(
  () => props.isVisible,
  async (v) => {
    if (v) {
      editMode.value = false
      await nextTick()
      editInterview.value = { ...interview.value, job: props.applicationId }
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
<<<<<<< HEAD
  <!-- Teleport: 避免被父级 transform 限制 -->
  <teleport to="body">
    <div v-if="isVisible" class="it-overlay" @click.self="close" @keydown.esc="close" tabindex="0">
      <div class="it-modal" @click.stop>
        <header class="it-header">
          <h2>Interview Details</h2>
          <button class="icon-btn" aria-label="Close" @click="close">✕</button>
        </header>

        <!-- 查看态 -->
        <section v-if="!editMode" class="it-view">
          <div class="it-box">
            <p>
              <span class="k">Date:</span> <span class="v">{{ interview.date || 'Not set' }}</span>
            </p>
            <p>
              <span class="k">Interviewer:</span>
              <span class="v">{{ interview.interviewer || 'Not set' }}</span>
            </p>
            <div class="notes">
              <div class="k">Prep Notes:</div>
              <pre class="v">{{ interview.prepNotes || 'None' }}</pre>
            </div>
          </div>
          <div class="it-actions">
            <button class="btn primary" @click="startEdit">Edit Interview Info</button>
            <button class="btn ghost" @click="close">Close</button>
          </div>
        </section>

        <!-- 编辑态 -->
        <section v-else class="it-edit">
          <div class="form-row">
            <label for="interviewDate">Interview Date</label>
            <input id="interviewDate" type="date" v-model="editInterview.date" />
=======
  <div v-if="isVisible" class="interview-tracker-overlay">
    <div class="interview-tracker-modal">
      <p class="application-title">{{ application?.title }} - {{ application?.company }}</p>
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
>>>>>>> ef381848015c9f954c0f727bafa167debbe11c51
          </div>

          <div class="form-row">
            <label for="interviewerName">Interviewer</label>
            <input id="interviewerName" type="text" v-model="editInterview.interviewer" />
          </div>

          <div class="form-row">
            <label for="prepNotes">Prep Notes</label>
            <textarea id="prepNotes" rows="8" v-model="editInterview.prepNotes"></textarea>
          </div>

          <div class="it-actions">
            <button class="btn primary" @click="saveInterview">Save</button>
            <button class="btn ghost" @click="cancelEdit">Cancel</button>
          </div>
        </section>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* 遮罩：全屏覆盖 */
.it-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 不透明深色弹窗（与其它弹窗一致） */
.it-modal {
  width: 720px;
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

.it-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 12px;
  border-bottom: 1px solid #262c36;
}
.it-header h2 {
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

.it-view,
.it-edit {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 6px 4px;
}

/* 查看态信息块 */
.it-box {
  background: #1e2430;
  border: 1px solid #313848;
  border-radius: 12px;
  padding: 18px;
  max-height: 52vh;
  overflow: auto;
}
.it-box p {
  margin: 0 0 10px 0;
  line-height: 1.7;
}
.k {
  color: #9fb0d0;
  margin-right: 6px;
}
.v {
  color: #e9eefc;
}
.notes {
  margin-top: 6px;
}
pre {
  margin: 6px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.65;
  color: #e9eefc;
}

/* 表单 */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row label {
  font-size: 13px;
  color: #9fb0d0;
}
input,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  outline: none;
  background: #1e2430;
  color: #eef3ff;
  border: 1px solid #313848;
}
textarea {
  resize: vertical;
}

/* 按钮体系 */
.it-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 6px;
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

/* 自定义滚动条（可选） */
.it-box::-webkit-scrollbar {
  width: 10px;
}
.it-box::-webkit-scrollbar-thumb {
  background: #3a4354;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.it-box::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 640px) {
  .it-modal {
    width: 92vw;
    padding: 14px;
  }
  .it-header h2 {
    font-size: 22px;
  }
  .btn {
    padding: 10px 14px;
  }
}
</style>

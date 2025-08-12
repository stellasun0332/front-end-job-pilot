<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useApplicationStore, type Application } from '@/stores/applicationStore'
import JobDescriptionAnalysis from './JobDescriptionAnalysis.vue'

const props = defineProps<{ applicationId: number; isVisible: boolean }>()
const emit = defineEmits(['close'])

const applicationStore = useApplicationStore()
const application = computed((): Application | undefined =>
  applicationStore.applications.find((a: any) => a.id === props.applicationId),
)
const jobDescription = computed(() => application.value?.jobDescription || 'None')

const editMode = ref(false)
const editDescription = ref('')
const showAnalysis = ref(false)

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

const close = () => emit('close')
const analyzeDescription = () => {
  showAnalysis.value = true
}
const closeAnalysis = () => {
  showAnalysis.value = false
}

/* 打开时填充内容并锁滚动；关闭时恢复 */
watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      editMode.value = false
      await nextTick()
      editDescription.value = application.value?.jobDescription || ''
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
  <!-- 关键：把弹窗传送到 body，避免被卡片的 transform 限制 -->
  <teleport to="body">
    <div v-if="isVisible" class="jd-overlay" @keydown.esc="close" tabindex="0">
      <div class="jd-modal">
        <header class="jd-header">
          <h2>Job Description</h2>
          <button class="icon-btn" aria-label="Close" @click="close">✕</button>
        </header>

        <section v-if="!editMode" class="jd-view">
          <div class="jd-content">
            <p>{{ jobDescription }}</p>
          </div>
          <div class="jd-actions">
            <button class="btn primary" @click="startEdit">Edit Description</button>
            <button class="btn primary" @click="analyzeDescription">Analyze Description</button>
            <button class="btn ghost" @click="close">Close</button>
          </div>
        </section>

        <section v-else class="jd-edit">
          <div class="form-row">
            <label for="jobDescriptionEdit">Job Description</label>
            <textarea
              id="jobDescriptionEdit"
              v-model="editDescription"
              placeholder="Enter job description here"
              rows="14"
            ></textarea>
          </div>
          <div class="jd-actions">
            <button class="btn primary" @click="saveDescription">Save</button>
            <button class="btn ghost" @click="cancelEdit">Cancel</button>
          </div>
        </section>
      </div>

      <!-- Analyzer 子弹窗也会被放到 body 顶层 -->
      <JobDescriptionAnalysis
        :applicationId="props.applicationId"
        :isVisible="showAnalysis"
        @close="closeAnalysis"
      />
    </div>
  </teleport>
</template>

<style scoped>
/* 全屏遮罩（不受卡片影响） */
.jd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 不透明深色弹窗 */
.jd-modal {
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

.jd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 12px;
  border-bottom: 1px solid #262c36;
}
.jd-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #ffffff;
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

.jd-view,
.jd-edit {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 6px 4px;
}

/* 正文容器（不透明） */
.jd-content {
  background-color: #1e2430;
  border: 1px solid #313848;
  border-radius: 12px;
  padding: 18px;
  max-height: 52vh;
  overflow: auto;
  line-height: 1.7;
  color: #e9eefc;
}
.jd-content p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 编辑区 */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row label {
  font-size: 13px;
  color: #9fb0d0;
}
textarea {
  width: 100%;
  min-height: 300px;
  resize: vertical;
  padding: 12px 14px;
  border-radius: 12px;
  outline: none;
  background-color: #1e2430;
  color: #eaf0ff;
  border: 1px solid #313848;
  line-height: 1.6;
}

/* 按钮体系 */
.jd-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
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

/* 简洁滚动条 */
.jd-content::-webkit-scrollbar,
textarea::-webkit-scrollbar {
  width: 10px;
}
.jd-content::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
  background: #3a4354;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.jd-content::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 640px) {
  .jd-modal {
    width: 92vw;
    padding: 14px;
  }
  .jd-header h2 {
    font-size: 22px;
  }
  .btn {
    padding: 10px 14px;
  }
}
</style>

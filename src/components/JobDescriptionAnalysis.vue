<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

const analysisResult = ref<string>('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const analyzeJobDescription = async () => {
  isLoading.value = true
  error.value = null
  analysisResult.value = ''

  try {
    const response = await axios.post('https://jobpilot-backend-62hx.onrender.com/api/jd/analyze', {
      jobId: props.applicationId,
    })
    analysisResult.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to analyze job description.'
    console.error('Error analyzing job description:', err)
  } finally {
    isLoading.value = false
  }
}

const close = () => emit('close')

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      analyzeJobDescription()
    }
  },
)
</script>

<template>
  <div v-if="isVisible" class="analysis-overlay">
    <div class="analysis-modal">
      <h2>Job Description Analysis</h2>
      <div v-if="isLoading" class="loading-content">
        <p>Analyzing job description, please wait...</p>
      </div>
      <div v-else-if="error" class="error-content">
        <p>{{ error }}</p>
      </div>
      <div v-else class="analysis-content">
        <div class="analysis-result">
          <p>{{ analysisResult }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Higher than JobDescription modal */
}

.analysis-modal {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: white;
}

.analysis-modal h2 {
  margin-bottom: 20px;
  text-align: center;
}

.loading-content {
  text-align: center;
  padding: 40px 20px;
}

.loading-content p {
  font-size: 16px;
  color: #ccc;
}

.error-content {
  text-align: center;
  padding: 20px;
}

.error-content p {
  color: #ff6b6b;
  font-weight: bold;
}

.analysis-content {
  margin-bottom: 20px;
}

.analysis-result {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 5px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  word-wrap: break-word;
}

.analysis-result p {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
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
  background-color: #6c757d;
  color: white;
}

.modal-actions button:hover {
  background-color: #545b62;
}
</style>

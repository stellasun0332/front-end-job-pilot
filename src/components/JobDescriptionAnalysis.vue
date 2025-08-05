<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import axios from 'axios'

const props = defineProps<{
  applicationId: number
  isVisible: boolean
}>()
const emit = defineEmits(['close'])

interface AnalysisData {
  summary: string
  keywords: string[]
  hardSkills: string[]
  softSkills: string[]
}

const analysisResult = ref<string>('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const parsedAnalysis = computed((): AnalysisData | null => {
  if (!analysisResult.value) return null

  try {
    const data =
      typeof analysisResult.value === 'string'
        ? JSON.parse(analysisResult.value)
        : analysisResult.value

    return {
      summary: data.oneSentenceSummary || '',
      keywords: data.keywords || [],
      hardSkills: data.hardSkills || [],
      softSkills: data.softSkills || [],
    }
  } catch (err) {
    console.error('Error parsing analysis result:', err)
    return null
  }
})

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
      <div v-else-if="parsedAnalysis" class="analysis-content">
        <!-- SUMMARY -->
        <div v-if="parsedAnalysis.summary" class="analysis-section">
          <h3>Summary</h3>
          <div class="summary-content">
            <p>{{ parsedAnalysis.summary }}</p>
          </div>
        </div>
        <!-- KEYWORDS -->
        <div v-if="parsedAnalysis.keywords.length > 0" class="analysis-section">
          <h3>Keywords</h3>
          <ul class="skills-list">
            <li v-for="keyword in parsedAnalysis.keywords" :key="keyword">
              {{ keyword }}
            </li>
          </ul>
        </div>
        <!-- HARD SKILLS -->
        <div v-if="parsedAnalysis.hardSkills.length > 0" class="analysis-section">
          <h3>Hard Skills</h3>
          <ul class="skills-list">
            <li v-for="skill in parsedAnalysis.hardSkills" :key="skill">
              {{ skill }}
            </li>
          </ul>
        </div>
        <!-- SOFT SKILLS -->
        <div v-if="parsedAnalysis.softSkills.length > 0" class="analysis-section">
          <h3>Soft Skills</h3>
          <ul class="skills-list">
            <li v-for="skill in parsedAnalysis.softSkills" :key="skill">
              {{ skill }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="!isLoading && !error" class="error-content">
        <p>Unable to parse analysis results. Please try again.</p>
      </div>
      <!-- <div v-else class="analysis-content">
        <div class="analysis-result">
          <p>{{ analysisResult }}</p>
        </div>
      </div> -->

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
  z-index: 1001;
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

.analysis-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.analysis-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.analysis-section h3 {
  margin: 0 0 15px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
}

.summary-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 5px;
  line-height: 1.6;
}

.summary-content p {
  margin: 0;
}

.skills-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.skills-list li {
  margin-bottom: 8px;
  line-height: 1.4;
  color: #f0f0f0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 15px;
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

@media (max-width: 768px) {
  .analysis-modal {
    width: 95vw;
    padding: 15px;
  }

  .analysis-section h3 {
    font-size: 16px;
  }

  .skills-list {
    padding-left: 15px;
  }
}
</style>

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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.analysis-modal {
  width: 700px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #171b22;
  color: #eaf0ff;
  border: 1px solid #2a2f3a;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  padding: 16px;
}

.analysis-modal h2 {
  margin: 0 0 10px 0;
  padding: 2px 4px 10px;
  border-bottom: 1px solid #262c36;
  font-size: 18px;
  font-weight: 850;
  color: #fff;
  text-align: center;
}

.loading-content {
  text-align: center;
  padding: 40px 20px;
  position: relative;
}

.loading-content::before {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid #313848;
  border-top: 3px solid #5aa3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  display: block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content p {
  font-size: 14px;
  color: #9fb0d0;
  margin: 0;
}

.error-content {
  text-align: center;
  padding: 40px 20px;
}

.error-content p {
  color: #ff8e8e;
  font-weight: 500;
  margin: 0;
  font-size: 14px;
}

.analysis-content {
  padding: 10px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.analysis-section h3 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
}

.summary-content {
  background: rgba(255, 255, 255, 0.03);
  padding: 14px;
  border-radius: 10px;
  line-height: 1.55;
  border: 1px solid #313848;
  border-left: 4px solid #5aa3ff;
}

.summary-content p {
  margin: 0;
  color: #eef3ff;
}

.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skills-list li {
  background: #1e2430;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #eef3ff;
  border: 1px solid #313848;
  transition: all 0.25s ease;
}

.skills-list li:hover {
  background: #242a35;
  border-color: #4a90e2;
  transform: translateY(-1px);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 8px 4px 4px;
  border-top: 1px solid #262c36;
  margin-top: 6px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  line-height: 1.1;
  border: 1px solid #343b47;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    opacity 0.2s ease;
  min-height: 40px;
  background: #242a35;
  color: #eaf0ff;
}

.modal-actions button:hover {
  transform: translateY(-1px);
  border-color: #4a90e2;
}

.modal-actions button:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .analysis-modal {
    width: 92vw;
    padding: 14px;
  }

  .analysis-modal h2 {
    font-size: 16px;
  }

  .analysis-section {
    padding: 12px;
  }

  .analysis-section h3 {
    font-size: 14px;
  }

  .skills-list {
    gap: 6px;
  }

  .skills-list li {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>

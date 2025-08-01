<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'submitted'])
const form = ref({
  user: { id: '' },
  title: '',
  company: '',
  jobDescription: '',
  dateApplied: '',
  status: 'Applied',
  notes: '',
})

const submitApplication = async () => {
  try {
    const response = await axios.post('https://jobpilot-backend-62hx.onrender.com/jobs', form.value)
    emit('submitted', response.data)
    emit('close')
  } catch (error) {
    console.error('Error submitting application: ', error)
  }
}

const close = () => {
  emit('close')
}
</script>

<template>
  <div class="overlay" @click="close">
    <div class="upload-form" @click.stop>
      <h2>Add New Application</h2>
      <form @submit.prevent="submitApplication">
        <div class="form-group">
          <!--TODO: REMOVE ID FIELD ONCE USER AUTH IS IMPLEMENTED -->
          <!--! TESTING CURRENTLY REQUIRES ENTERING A USER ID MANUALLY-->
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
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upload-form {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: white;
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
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
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
  background-color: #007bff;
  color: white;
}

.modal-actions button[type='submit']:hover {
  background-color: #0056b3;
}

.modal-actions button[type='button'] {
  background-color: #6c757d;
  color: white;
}

.modal-actions button[type='button']:hover {
  background-color: #545b62;
}

@media (max-width: 500px) {
  .upload-form {
    width: 95vw;
    padding: 15px;
  }
}
</style>

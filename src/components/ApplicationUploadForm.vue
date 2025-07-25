<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close'])
const form = ref({
  title: '',
  company: '',
  appliedOn: '',
  status: 'Applied',
  notes: '',
})

const submitApplication = async () => {
  try {
    await axios.post('https://jobpilot-backend-62hx.onrender.com/jobs', form.value)
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
      <button class="close-button" @click="close">X</button>
      <h2>Add New Application</h2>
      <form @submit.prevent="submitApplication">
        <div>
          <label for="title">Job Title:</label>
          <input type="text" v-model="form.title" required />
        </div>
        <div>
          <label for="company">Company:</label>
          <input type="text" v-model="form.company" required />
        </div>
        <div>
          <label for="appliedOn">Applied On:</label>
          <input type="date" v-model="form.appliedOn" required />
        </div>
        <div>
          <label for="status">Status:</label>
          <select v-model="form.status" required>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer Received">Offer Received</option>
          </select>
        </div>
        <div>
          <label for="notes">Notes:</label>
          <textarea v-model="form.notes"></textarea>
        </div>
        <button type="submit">Save</button>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.upload-form {
  background: rgb(70, 68, 68);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
</style>

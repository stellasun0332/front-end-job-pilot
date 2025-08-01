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
    //! Change below back to deployed backend API route after testing
    const response = await axios.post('http://localhost:8080/jobs', form.value)
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
      <button class="close-button" @click="close">X</button>
      <h2>Add New Application</h2>
      <form @submit.prevent="submitApplication">
        <div>
          <!--TODO: REMOVE ID FIELD ONCE USER AUTH IS IMPLEMENTED -->
          <!--! TESTING CURRENTLY REQUIRES ENTERING A USER ID MANUALLY-->
          <label for="id">Your ID:</label>
          <input id="id" type="number" v-model="form.user.id" required />
        </div>
        <div>
          <label for="title">Job Title:</label>
          <input id="title" type="text" v-model="form.title" required />
        </div>
        <div>
          <label for="company">Company:</label>
          <input id="company" type="text" v-model="form.company" required />
        </div>
        <div>
          <label for="jobDescription">Job Description</label>
          <textarea id="jobDescription" v-model="form.jobDescription"></textarea>
        </div>
        <div>
          <label for="appliedOn">Applied On:</label>
          <input id="appliedOn" type="date" v-model="form.dateApplied" required />
        </div>
        <div>
          <label for="status">Status:</label>
          <select id="status" v-model="form.status" required>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer Received">Offer Received</option>
          </select>
        </div>
        <div>
          <label for="notes">Notes:</label>
          <textarea id="notes" v-model="form.notes"></textarea>
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

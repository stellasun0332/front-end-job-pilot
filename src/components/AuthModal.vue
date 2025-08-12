<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ mode: 'login' | 'signup' }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useAuthStore()
const email = ref(''),
  password = ref(''),
  name = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    if (props.mode === 'signup') {
      await store.signup({
        email: email.value.trim(),
        password: password.value,
        name: name.value.trim(),
      })
    } else {
      await store.login({ email: email.value.trim(), password: password.value })
    }
    emit('close')
  } catch (e: any) {
    errorMsg.value = store.error || 'Failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h2>{{ props.mode === 'signup' ? 'Sign Up' : 'Log In' }}</h2>

      <form @submit.prevent="submit">
        <div v-if="props.mode === 'signup'" class="form-group">
          <label>Name</label>
          <input v-model="name" type="text" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" required minlength="6" />
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <div class="actions">
          <button type="submit" :disabled="submitting">
            {{
              submitting ? 'Submitting...' : props.mode === 'signup' ? 'Create account' : 'Log in'
            }}
          </button>
          <button type="button" @click="$emit('close')" :disabled="submitting">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #464444;
  color: #fff;
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
}
.form-group {
  margin: 10px 0;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fff;
  color: #000;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
button {
  padding: 8px 16px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}
button[type='submit'] {
  background: #007bff;
  color: #fff;
}
button[type='submit']:hover {
  background: #0056b3;
}
button[type='button'] {
  background: #6c757d;
  color: #fff;
}
button[type='button']:hover {
  background: #545b62;
}
.error {
  color: #ff6b6b;
  margin-top: 8px;
}
</style>

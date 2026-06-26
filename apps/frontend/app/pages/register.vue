<script setup lang="ts">
definePageMeta({ layout: 'auth', guestOnly: true })

const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await register(name.value, email.value, password.value)
    await navigateTo('/')
  } catch (e) {
    console.log('register error', e)
    error.value = 'Ошибка регистрации'
  }
}
</script>

<template>
  <div class="auth">
    <form class="auth__form" @submit.prevent="submit">
      <h1 class="auth__title">Регистрация</h1>
      <input
        v-model="name"
        class="auth__input"
        placeholder="Имя"
      >
      <input
        v-model="email"
        class="auth__input"
        type="email"
        placeholder="Email"
      >
      <input
        v-model="password"
        class="auth__input"
        type="password"
        placeholder="Пароль"
      >
      <p v-if="error" class="auth__error">{{ error }}</p>
      <button class="auth__btn" type="submit">Зарегистрироваться</button>
      <NuxtLink class="auth__link" to="/login">Уже есть аккаунт? Войти</NuxtLink>
    </form>
  </div>
</template>

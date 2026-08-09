<script setup lang="ts">
definePageMeta({ layout: 'auth', guestOnly: true })

const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (e) {
    console.log('login error', e)
    error.value = 'Неверный email или пароль'
  }
}
</script>

<template>
  <div class="auth">
    <form class="auth__form" @submit.prevent="submit">
      <h1 class="auth__title">Вход</h1>
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
      <button class="auth__btn" type="submit">Войти</button>
      <NuxtLink class="auth__link" to="/register">Нет аккаунта? Зарегистрироваться</NuxtLink>
    </form>
  </div>
</template>

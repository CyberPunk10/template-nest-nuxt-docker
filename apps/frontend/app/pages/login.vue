<script setup lang="ts">
definePageMeta({ layout: 'auth', guestOnly: true })

const email = ref('')
const password = ref('')

function submit() {
  console.log('login', { email: email.value, password: password.value })
}
</script>

<template>
  <div class="auth">
    <form class="auth__form" @submit.prevent="submit">
      <h1 class="auth__title">Вход</h1>
      <input v-model="email" class="auth__input" type="email" placeholder="Email" />
      <input v-model="password" class="auth__input" type="password" placeholder="Пароль" />
      <button class="auth__btn" type="submit">Войти</button>
      <NuxtLink class="auth__link" to="/register">Нет аккаунта? Зарегистрироваться</NuxtLink>
    </form>
  </div>
</template>

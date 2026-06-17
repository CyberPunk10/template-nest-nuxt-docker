<script setup lang="ts">
definePageMeta({ layout: 'auth', guestOnly: true })

const name = ref('')
const email = ref('')
const password = ref('')

function submit() {
  console.log('register', { name: name.value, email: email.value, password: password.value })
}
</script>

<template>
  <div class="auth">
    <form class="auth__form" @submit.prevent="submit">
      <h1 class="auth__title">Регистрация</h1>
      <input v-model="name" class="auth__input" placeholder="Имя" />
      <input v-model="email" class="auth__input" type="email" placeholder="Email" />
      <input v-model="password" class="auth__input" type="password" placeholder="Пароль" />
      <button class="auth__btn" type="submit">Зарегистрироваться</button>
      <NuxtLink class="auth__link" to="/login">Уже есть аккаунт? Войти</NuxtLink>
    </form>
  </div>
</template>

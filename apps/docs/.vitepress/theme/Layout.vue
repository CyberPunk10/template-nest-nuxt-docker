<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import CustomHome from './components/CustomHome.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <Layout>
    <template v-if="frontmatter.showcase" #layout-bottom>
      <CustomHome />
    </template>
  </Layout>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'


const router = useRouter();

function createSurvey() {
  router.push("/survey");
}
</script>

<template>
  <header class="px-3 py-2 d-flex justify-content-between align-items-center">
    <h1>
      <RouterLink class="app-title" to="/">Super Survey System</RouterLink>
    </h1>
    <o-button class="mx-1" @click="createSurvey" variant="primary">
      <o-icon icon="plus" variant="white" />
    </o-button>
  </header>
  <RouterView />
</template>
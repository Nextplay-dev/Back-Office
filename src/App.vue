<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

onMounted(() => {
  if (localStorage.getItem('lang')) {
    return locale.value = localStorage.getItem('lang')!;
  }
  if (navigator.language) {
    return locale.value = navigator.language.split('-')[0];
  }
  locale.value = 'en';
})
</script>

<template>
  <RouterView />
</template>

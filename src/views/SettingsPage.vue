<script setup lang="ts">
import ThemeGallery from '../components/settings/ThemeGallery.vue'
import ThemeEditor from '../components/settings/ThemeEditor.vue'
</script>

<template>
  <main class="page">
    <h1>Настройки</h1>

    <section>
      <h2>Тема оформления</h2>
      <ThemeGallery />
    </section>

    <section>
      <h2>Своя тема</h2>
      <ThemeEditor />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
h2 {
  margin-bottom: var(--space-3);
}
</style>

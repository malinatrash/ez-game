<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="empty-state">
    <p>{{ message }}</p>
    <RouterLink to="/library">К библиотеке игр</RouterLink>
  </div>
</template>

<style scoped>
.empty-state {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: center;
  color: var(--color-text-muted);
}
</style>

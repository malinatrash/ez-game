<script setup lang="ts">
withDefaults(defineProps<{ icon: string; title: string; description: string; to?: string }>(), {})
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'button'"
    :to="to"
    class="card"
    :type="to ? undefined : 'button'"
    @click="!to && emit('click')"
  >
    <span class="icon">{{ icon }}</span>
    <span class="title">{{ title }}</span>
    <span class="description">{{ description }}</span>
  </component>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-4);
  min-width: 220px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: inherit;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: transform var(--duration-fast) var(--ease-bounce), box-shadow var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent-border);
}
.icon {
  font-size: var(--font-size-xl);
}
.title {
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--color-text-heading);
}
.description {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>

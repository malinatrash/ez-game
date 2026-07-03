<script setup lang="ts">
import type { StatTile } from '../../services/resultsAnalytics'

defineProps<{ stats: StatTile[] }>()
</script>

<template>
  <div class="grid">
    <div
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="tile"
      v-motion
      :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 200 + index * 80 } }"
    >
      <span class="icon">{{ stat.icon }}</span>
      <span class="value">{{ stat.value }}</span>
      <span class="label">{{ stat.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  width: 100%;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  text-align: center;
}
.icon {
  font-size: var(--font-size-xl);
}
.value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-heading);
  font-variant-numeric: tabular-nums;
}
.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>

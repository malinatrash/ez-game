<script setup lang="ts">
import type { FunFact } from '../../services/resultsAnalytics'

defineProps<{ facts: FunFact[] }>()
</script>

<template>
  <ul class="facts">
    <li
      v-for="(fact, index) in facts"
      :key="fact.text"
      class="fact"
      v-motion
      :initial="{ opacity: 0, x: 16 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 320, delay: 300 + index * 110 } }"
    >
      <span class="icon">{{ fact.icon }}</span>
      <span class="text">{{ fact.text }}</span>
    </li>
  </ul>
</template>

<style scoped>
.facts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}
.fact {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
}
.icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}
.text {
  color: var(--color-text);
  line-height: 1.4;
}
</style>

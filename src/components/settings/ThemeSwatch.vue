<script setup lang="ts">
defineProps<{
  name: string
  active: boolean
  colors: { bg: string; accent: string; surface: string; text: string }
}>()
const emit = defineEmits<{ select: []; remove: [] }>()
</script>

<template>
  <button type="button" class="swatch" :class="{ active }" @click="emit('select')">
    <span class="preview" :style="{ background: colors.bg }">
      <span class="dot" :style="{ background: colors.accent }" />
      <span class="dot" :style="{ background: colors.surface }" />
      <span class="dot" :style="{ background: colors.text }" />
    </span>
    <span class="name">{{ name }}</span>
    <span v-if="$slots.default" class="extra"><slot /></span>
  </button>
</template>

<style scoped>
.swatch {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface-raised);
  cursor: pointer;
  min-width: 140px;
  transition: transform var(--duration-fast) var(--ease-bounce),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.swatch:hover {
  transform: translateY(-3px);
}
.swatch.active {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-glow);
}
.preview {
  height: 56px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: var(--space-2);
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.name {
  font-size: var(--font-size-sm);
  text-align: left;
}
.extra {
  display: flex;
  justify-content: flex-end;
}
</style>

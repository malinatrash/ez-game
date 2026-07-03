<script setup lang="ts">
withDefaults(defineProps<{ accept?: string; size?: 'sm' | 'md' }>(), { size: 'md' })
const emit = defineEmits<{ pick: [file: File] }>()

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) emit('pick', file)
}
</script>

<template>
  <label class="file-btn" :class="size">
    <slot />
    <input type="file" :accept="accept" @change="onChange" />
  </label>
</template>

<style scoped>
.file-btn {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: border-color var(--duration-fast) var(--ease-standard),
    background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.file-btn.sm {
  height: 32px;
  padding: 0 var(--space-3);
}
.file-btn:hover {
  border-color: var(--color-accent-border);
  background: var(--color-accent-bg);
  color: var(--color-accent);
}
.file-btn input {
  display: none;
}
</style>

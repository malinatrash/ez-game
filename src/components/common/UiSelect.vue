<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="ui-select">
    <select :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <slot />
    </select>
    <span class="chevron">▾</span>
  </div>
</template>

<style scoped>
.ui-select {
  position: relative;
  display: inline-flex;
  width: 100%;
}
select {
  appearance: none;
  width: 100%;
  height: var(--size-button-height);
  padding: 0 var(--space-6) 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
select:focus {
  outline: none;
  border-color: var(--color-accent-border);
  box-shadow: 0 0 0 3px var(--color-accent-bg);
}
.chevron {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: var(--font-size-sm);
}
</style>

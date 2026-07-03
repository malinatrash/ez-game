<script setup lang="ts">
defineProps<{ modelValue: boolean; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="switch-row">
    <span class="switch-label"><slot>{{ label }}</slot></span>
    <span
      class="switch"
      :class="{ checked: modelValue }"
      role="switch"
      :aria-checked="modelValue"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="thumb" />
    </span>
  </label>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  user-select: none;
}
.switch-label {
  flex: 1;
}
.switch {
  --w: 40px;
  --h: 22px;
  position: relative;
  display: inline-flex;
  align-items: center;
  width: var(--w);
  height: var(--h);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
}
.switch.checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}
.thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-text-heading);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.switch.checked .thumb {
  transform: translateX(18px);
}
</style>

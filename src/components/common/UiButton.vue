<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    iconOnly?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'default', size: 'md', iconOnly: false, disabled: false, type: 'button' },
)
</script>

<template>
  <button :type="type" :disabled="disabled" class="ui-btn" :class="[variant, size, { 'icon-only': iconOnly }]">
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: border-color var(--duration-fast) var(--ease-standard),
    background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}
.ui-btn:hover:not(:disabled) {
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
.ui-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.ui-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-btn.sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
}
.ui-btn.icon-only {
  padding: 0;
  width: var(--size-button-height);
}
.ui-btn.icon-only.sm {
  width: 32px;
}

.ui-btn.primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
  font-weight: 600;
}
.ui-btn.primary:hover:not(:disabled) {
  color: var(--color-bg);
  filter: brightness(1.08);
}

.ui-btn.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-text-muted);
}
.ui-btn.ghost:hover:not(:disabled) {
  background: var(--color-accent-bg);
  color: var(--color-accent);
}

.ui-btn.danger {
  color: var(--color-danger);
  border-color: transparent;
  background: transparent;
}
.ui-btn.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: var(--color-danger);
}
</style>

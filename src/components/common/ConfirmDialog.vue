<script setup lang="ts">
import { useConfirmState, settleConfirm } from '../../composables/useConfirm'
import UiButton from './UiButton.vue'

const state = useConfirmState()
</script>

<template>
  <Transition name="confirm-fade">
    <div v-if="state.visible" class="overlay" @click.self="settleConfirm(false)">
      <div class="dialog" role="alertdialog" aria-modal="true">
        <p class="message">{{ state.message }}</p>
        <div class="actions">
          <UiButton variant="ghost" @click="settleConfirm(false)">Отмена</UiButton>
          <UiButton variant="danger" @click="settleConfirm(true)">Подтвердить</UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.dialog {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.message {
  margin: 0;
  color: var(--color-text-heading);
  font-size: var(--font-size-md);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-standard);
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import type { Player } from '../../../types/player'
import PlayerAvatarPicker from './PlayerAvatarPicker.vue'
import UiButton from '../../common/UiButton.vue'

defineProps<{ player: Player }>()
const emit = defineEmits<{ remove: []; moveUp: []; moveDown: [] }>()
</script>

<template>
  <div class="row" :style="{ '--player-color': player.color }">
    <div class="controls">
      <UiButton size="sm" variant="ghost" icon-only title="Выше" @click="emit('moveUp')">↑</UiButton>
      <UiButton size="sm" variant="ghost" icon-only title="Ниже" @click="emit('moveDown')">↓</UiButton>
      <UiButton size="sm" variant="danger" icon-only title="Удалить" @click="emit('remove')">✕</UiButton>
    </div>

    <PlayerAvatarPicker
      v-model="player.avatarAssetId"
      :color="player.color"
      :fallback="player.name.charAt(0).toUpperCase() || '?'"
    />

    <input v-model="player.name" class="name" placeholder="Имя игрока" />

    <label class="color-picker" :title="'Цвет игрока'">
      <span class="color-swatch" />
      <input v-model="player.color" type="color" class="color-input" />
    </label>
  </div>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: radial-gradient(
    circle at 50% 0%,
    color-mix(in srgb, var(--player-color) 14%, var(--color-surface)) 0%,
    var(--color-surface) 75%
  );
  border: 1px solid color-mix(in srgb, var(--player-color) 30%, var(--color-border));
  box-shadow: var(--shadow-sm);
  min-width: 180px;
  transition: box-shadow var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}
.row:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.controls {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
.row:hover .controls {
  opacity: 1;
}

.name {
  width: 100%;
  height: var(--size-button-height);
  padding: 0 var(--space-2);
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--color-text);
  text-align: center;
  font-weight: 600;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.name:focus {
  outline: none;
  border-bottom-color: var(--player-color);
}

.color-picker {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}
.color-swatch {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background: var(--player-color);
  border: 2px solid var(--color-surface);
  box-shadow: 0 0 0 1px var(--color-border);
}
.color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Player } from '../../../types/player'
import type { Question } from '../../../types/game'
import { useHistoryStore } from '../../../stores/history'

const props = defineProps<{ players: Player[]; question: Question }>()
const emit = defineEmits<{ judged: [winnerId: string | null] }>()

const historyStore = useHistoryStore()
const pulse = reactive<Record<string, 'plus' | 'minus' | ''>>({})
// за вопрос допускается только один "плюс" (правильный ответ), но минус — только один раз на игрока
const winnerId = ref<string | null>(null)
const minusedIds = reactive(new Set<string>())

watch(
  () => props.players.map((player) => player.id),
  (playerIds) => {
    const currentIds = new Set(playerIds)
    if (winnerId.value && !currentIds.has(winnerId.value)) winnerId.value = null
    for (const playerId of minusedIds) {
      if (!currentIds.has(playerId)) minusedIds.delete(playerId)
    }
  },
)

function firePulse(playerId: string, kind: 'plus' | 'minus') {
  pulse[playerId] = kind
  window.setTimeout(() => {
    if (pulse[playerId] === kind) pulse[playerId] = ''
  }, 650)
}

function plus(playerId: string) {
  if (winnerId.value === playerId) {
    // повторный клик по уже отмеченному победителю — отмена
    historyStore.record({ playerId, questionId: props.question.id, delta: -props.question.cost, reason: 'manual' })
    winnerId.value = null
    return
  }
  if (winnerId.value) {
    // плюс переносится на другого игрока — снимаем предыдущий
    historyStore.record({ playerId: winnerId.value, questionId: props.question.id, delta: -props.question.cost, reason: 'manual' })
  }
  historyStore.record({ playerId, questionId: props.question.id, delta: props.question.cost, reason: 'correct' })
  winnerId.value = playerId
  firePulse(playerId, 'plus')
}

function minus(playerId: string) {
  if (minusedIds.has(playerId)) return
  historyStore.record({ playerId, questionId: props.question.id, delta: -props.question.cost, reason: 'incorrect' })
  minusedIds.add(playerId)
  firePulse(playerId, 'minus')
}

function finish() {
  emit('judged', winnerId.value)
}
</script>

<template>
  <div class="judge">
    <div v-for="player in players" :key="player.id" class="row" :class="pulse[player.id] && `pulse-${pulse[player.id]}`">
      <span class="name">{{ player.name }}</span>
      <button
        class="stepper minus"
        :disabled="minusedIds.has(player.id)"
        @click="minus(player.id)"
        aria-label="Неверно"
      >
        <span class="glyph">−</span>
      </button>
      <button
        class="stepper plus"
        :class="{ chosen: winnerId === player.id }"
        :disabled="winnerId !== null && winnerId !== player.id"
        @click="plus(player.id)"
        aria-label="Верно"
      >
        <span class="glyph">+</span>
        <span class="ring" />
      </button>
    </div>
    <div class="finish-row">
      <button class="nobody" @click="emit('judged', null)">Никто не ответил</button>
      <button class="done" @click="finish">Готово →</button>
    </div>
  </div>
</template>

<style scoped>
.judge {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 480px;
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--duration-medium) var(--ease-standard);
}
.name {
  flex: 1;
  font-weight: 600;
  text-align: left;
}
.stepper {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
  display: grid;
  place-items: center;
  overflow: visible;
  transition:
    transform var(--duration-fast) var(--ease-bounce),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.stepper .glyph {
  font-size: var(--font-size-xl);
  font-weight: 700;
  line-height: 1;
  transform: translateY(-1px);
}
.stepper:active {
  transform: scale(0.9);
}
.stepper.plus {
  border-color: var(--color-success);
  color: var(--color-success);
}
.stepper.plus:hover {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 20%, transparent);
  transform: scale(1.08) rotate(-4deg);
}
.stepper.plus.chosen {
  background: var(--color-success);
  color: var(--color-bg);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 30%, transparent);
}
.stepper:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
.stepper.minus {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.stepper.minus:hover {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-danger) 15%, transparent);
  transform: scale(1.05) rotate(3deg);
}

.ring {
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-success);
  opacity: 0;
  pointer-events: none;
}

/* --- plus: сочный "победный" импульс всей строки --- */
.pulse-plus {
  background: color-mix(in srgb, var(--color-success) 14%, transparent);
  animation: row-win var(--duration-xslow) var(--ease-bounce);
}
.pulse-plus .stepper.plus {
  animation: plus-pop var(--duration-xslow) var(--ease-bounce);
}
.pulse-plus .stepper.plus .ring {
  animation: ring-burst var(--duration-xslow) var(--ease-standard);
}
.pulse-plus .name {
  animation: name-glow var(--duration-xslow) var(--ease-standard);
}
@keyframes row-win {
  0% { transform: scale(1); }
  25% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
@keyframes plus-pop {
  0% { transform: scale(1) rotate(0); }
  30% { transform: scale(1.5) rotate(18deg); }
  55% { transform: scale(0.92) rotate(-6deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes ring-burst {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0; transform: scale(2.2); }
}
@keyframes name-glow {
  0%, 100% { text-shadow: none; }
  30% { text-shadow: 0 0 12px var(--color-success); }
}

/* --- minus: жалкая "лузерская" тряска, никакого блеска --- */
.pulse-minus {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  animation: row-fail var(--duration-slow) linear;
}
.pulse-minus .stepper.minus {
  animation: minus-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.pulse-minus .name {
  animation: name-droop var(--duration-xslow) var(--ease-standard) forwards;
}
@keyframes row-fail {
  0%, 100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-6px) rotate(-1deg); }
  30% { transform: translateX(5px) rotate(1deg); }
  45% { transform: translateX(-4px) rotate(-1deg); }
  60% { transform: translateX(3px) rotate(0.5deg); }
  75% { transform: translateX(-2px) rotate(0); }
}
@keyframes minus-shake {
  0%, 100% { transform: scale(1) rotate(0); }
  20% { transform: scale(0.85) rotate(-8deg); }
  40% { transform: scale(0.9) rotate(6deg); }
  60% { transform: scale(0.85) rotate(-4deg); }
  80% { transform: scale(0.95) rotate(2deg); }
}
@keyframes name-droop {
  0% { opacity: 1; filter: grayscale(0); transform: translateY(0); }
  40% { opacity: 0.6; filter: grayscale(0.6); transform: translateY(2px); }
  100% { opacity: 1; filter: grayscale(0); transform: translateY(0); }
}

.finish-row {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}
.nobody {
  height: var(--size-button-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  cursor: pointer;
}
.done {
  height: var(--size-button-height);
  padding: 0 var(--space-5);
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.done:hover {
  transform: scale(1.04);
}
</style>

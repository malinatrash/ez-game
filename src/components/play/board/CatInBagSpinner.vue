<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Player } from '../../../types/player'
import PlayerAvatar from '../../results/PlayerAvatar.vue'

const props = defineProps<{ players: Player[] }>()
const emit = defineEmits<{ picked: [playerId: string] }>()

const SPIN_ROUNDS = 6
const SPIN_DURATION_MS = 3400

const rotation = ref(0)
const settled = ref(false)
const winner = ref<Player | null>(null)

const anglePerPlayer = computed(() => 360 / props.players.length)

function angleFor(index: number) {
  return index * anglePerPlayer.value
}

onMounted(() => {
  const targetIndex = Math.floor(Math.random() * props.players.length)
  const targetAngle = angleFor(targetIndex)
  requestAnimationFrame(() => {
    rotation.value = SPIN_ROUNDS * 360 - targetAngle
  })
  window.setTimeout(() => {
    settled.value = true
    winner.value = props.players[targetIndex]
    window.setTimeout(() => emit('picked', props.players[targetIndex].id), 1100)
  }, SPIN_DURATION_MS)
})
</script>

<template>
  <div class="overlay">
    <div class="stage">
      <h2 class="title">🐱 Кот в мешке!</h2>
      <p class="subtitle">Отвечать будет...</p>
      <div class="wheel-wrap">
        <span class="pointer">▼</span>
        <div class="wheel" :class="{ settled }" :style="{ transform: `rotate(${rotation}deg)` }">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            class="slot"
            :style="{ transform: `rotate(${angleFor(index)}deg) translate(0, -130px) rotate(${-angleFor(index)}deg)` }"
          >
            <PlayerAvatar :player="player" :size="56" />
          </div>
        </div>
        <div class="hub" />
      </div>
      <Transition name="pop">
        <p v-if="winner" class="winner-name" :style="{ color: winner.color }">{{ winner.name }}</p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
}
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.title {
  margin: 0;
  color: var(--color-text-heading);
  font-size: var(--font-size-xxl);
}
.subtitle {
  margin: 0;
  color: var(--color-text-muted);
}
.wheel-wrap {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: var(--color-accent);
  font-size: var(--font-size-xl);
  filter: drop-shadow(0 0 6px var(--color-accent));
}
.wheel {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  border: 2px dashed var(--color-accent-border);
  background: radial-gradient(circle, var(--color-surface) 0%, var(--color-surface-raised) 100%);
  transition: transform 3.4s cubic-bezier(0.15, 0.75, 0.2, 1);
}
.wheel.settled {
  box-shadow: var(--shadow-glow);
}
.slot {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hub {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  z-index: 1;
}
.winner-name {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xxl);
  font-weight: 800;
}
.pop-enter-active {
  animation: pop-in 500ms var(--ease-bounce);
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.5); }
  60% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
</style>

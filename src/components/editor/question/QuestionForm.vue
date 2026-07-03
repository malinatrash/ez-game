<script setup lang="ts">
import { ref } from 'vue'
import type { CanvasElement, Question, SideBackground } from '../../../types/game'
import CanvasEditor from '../canvas/CanvasEditor.vue'
import UiSwitch from '../../common/UiSwitch.vue'

const props = defineProps<{ question: Question }>()

const COST_PRESETS = [100, 200, 300, 400, 500]
const activeSide = ref<'content' | 'answer'>('content')

function onTimeLimitInput(event: Event) {
  const raw = (event.target as HTMLInputElement).valueAsNumber
  props.question.settings.timeLimitSec = Number.isNaN(raw) ? null : raw
}
</script>

<template>
  <div class="form">
    <aside class="meta-col">
      <section class="card cost-card">
        <h4>Стоимость</h4>
        <input v-model.number="question.cost" type="number" step="100" class="cost-input" />
        <div class="presets">
          <button
            v-for="p in COST_PRESETS"
            :key="p"
            type="button"
            class="preset"
            :class="{ active: question.cost === p }"
            @click="question.cost = p"
          >
            {{ p }}
          </button>
        </div>
      </section>

      <section class="card settings-card">
        <h4>Настройки</h4>
        <UiSwitch v-model="question.settings.showTimer">Показывать таймер</UiSwitch>
        <label v-if="question.settings.showTimer" class="field">
          <span>Лимит времени (сек)</span>
          <input type="number" :value="question.settings.timeLimitSec ?? ''" @input="onTimeLimitInput" />
        </label>
        <UiSwitch v-model="question.settings.autoReveal">Авто-открытие ответа</UiSwitch>
        <UiSwitch v-model="question.settings.hideCostAfterReveal">Скрывать стоимость после ответа</UiSwitch>
        <UiSwitch v-model="question.settings.isBonus">Бонусный вопрос</UiSwitch>
      </section>

      <section class="card notes-card">
        <h4>Комментарий ведущему</h4>
        <textarea v-model="question.hostNotes" rows="4" placeholder="Подсказка, которую видит только ведущий…" />
      </section>
    </aside>

    <section class="canvas-card">
      <div class="ribbon-tabs">
        <button type="button" class="tab" :class="{ active: activeSide === 'content' }" @click="activeSide = 'content'">
          ❓ Вопрос
        </button>
        <button type="button" class="tab" :class="{ active: activeSide === 'answer' }" @click="activeSide = 'answer'">
          ✅ Ответ
        </button>
      </div>

      <CanvasEditor
        v-show="activeSide === 'content'"
        :elements="question.content"
        :background="question.contentBackground"
        @update:elements="(v: CanvasElement[]) => (question.content = v)"
        @update:background="(v: SideBackground | null) => (question.contentBackground = v)"
      />
      <CanvasEditor
        v-show="activeSide === 'answer'"
        :elements="question.answer"
        :background="question.answerBackground"
        @update:elements="(v: CanvasElement[]) => (question.answer = v)"
        @update:background="(v: SideBackground | null) => (question.answerBackground = v)"
      />
    </section>
  </div>
</template>

<style scoped>
.form {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-5);
  text-align: left;
  width: 100%;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.card h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.cost-input {
  font-size: var(--font-size-xl);
  font-weight: 700;
  text-align: center;
  color: var(--color-accent);
  width: 100%;
}
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.preset {
  flex: 1;
  min-width: 44px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.preset:hover {
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
.preset.active {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
  font-weight: 600;
}
.notes-card textarea {
  flex: 1;
  resize: vertical;
  min-height: 90px;
}
.settings-card {
  gap: var(--space-3);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.field span {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.canvas-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.ribbon-tabs {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3) 0;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.tab {
  height: 38px;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}
.tab:hover {
  color: var(--color-text);
}
.tab.active {
  background: var(--color-surface);
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

@media (max-width: 960px) {
  .form {
    grid-template-columns: 1fr;
  }
  .meta-col {
    flex-direction: row;
    flex-wrap: wrap;
    overflow-y: visible;
  }
  .meta-col .card {
    flex: 1;
    min-width: 220px;
  }
}
</style>

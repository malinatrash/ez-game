<script setup lang="ts">
import type { CanvasElement, TextAlign } from '../../../types/game'
import ImageUploader from '../../common/ImageUploader.vue'
import VideoUploader from '../../common/VideoUploader.vue'
import AudioUploader from '../../common/AudioUploader.vue'
import UiButton from '../../common/UiButton.vue'
import UiSwitch from '../../common/UiSwitch.vue'
import UiSelect from '../../common/UiSelect.vue'

const props = defineProps<{ element: CanvasElement | null }>()
const emit = defineEmits<{
  patch: [id: string, patch: Partial<CanvasElement>]
  remove: [id: string]
  duplicate: [id: string]
  bringToFront: [id: string]
  sendToBack: [id: string]
}>()

function patch(p: Partial<CanvasElement>) {
  if (props.element) emit('patch', props.element.id, p)
}

function onNumberInput(key: 'x' | 'y' | 'w' | 'h' | 'rotation', event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber
  if (!Number.isNaN(value)) patch({ [key]: value } as Partial<CanvasElement>)
}

function patchTextAlign(align: string) {
  if (props.element?.type === 'text') patch({ style: { ...props.element.style, align: align as TextAlign } })
}

function patchPlayback(key: 'autoplay' | 'loop' | 'muted', value: boolean) {
  if (props.element?.type === 'video' || props.element?.type === 'audio') {
    patch({ playback: { ...props.element.playback, [key]: value } })
  }
}
</script>

<template>
  <div class="panel">
    <p v-if="!element" class="empty">Выберите элемент на холсте, чтобы настроить его</p>
    <template v-else>
      <section class="section">
        <h4>Позиция и размер</h4>
        <div class="transform-grid">
          <label>X <input type="number" :value="element.x" @input="onNumberInput('x', $event)" /></label>
          <label>Y <input type="number" :value="element.y" @input="onNumberInput('y', $event)" /></label>
          <label>Ш <input type="number" :value="element.w" @input="onNumberInput('w', $event)" /></label>
          <label>В <input type="number" :value="element.h" @input="onNumberInput('h', $event)" /></label>
          <label>° <input type="number" :value="element.rotation" @input="onNumberInput('rotation', $event)" /></label>
        </div>
      </section>

      <section v-if="element.type === 'text'" class="section">
        <h4>Текст</h4>
        <textarea
          :value="element.value"
          rows="3"
          placeholder="Введите текст…"
          @input="patch({ value: ($event.target as HTMLTextAreaElement).value })"
        />
        <div class="row">
          <label class="field">
            <span>Размер</span>
            <input
              type="number"
              :value="element.style.fontSize"
              @input="patch({ style: { ...element.style, fontSize: ($event.target as HTMLInputElement).valueAsNumber } })"
            />
          </label>
          <label class="field">
            <span>Цвет</span>
            <input
              type="color"
              :value="element.style.color"
              @input="patch({ style: { ...element.style, color: ($event.target as HTMLInputElement).value } })"
            />
          </label>
          <label class="field grow">
            <span>Выравнивание</span>
            <UiSelect :model-value="element.style.align" @update:model-value="patchTextAlign">
              <option value="left">Слева</option>
              <option value="center">По центру</option>
              <option value="right">Справа</option>
            </UiSelect>
          </label>
        </div>
      </section>

      <section v-else-if="element.type === 'image'" class="section">
        <h4>Изображение</h4>
        <ImageUploader
          :model-value="element.assetId"
          @update:model-value="(id) => id && patch({ assetId: id })"
        />
      </section>

      <section v-else class="section">
        <h4>{{ element.type === 'video' ? 'Видео' : 'Аудио' }}</h4>
        <component
          :is="element.type === 'video' ? VideoUploader : AudioUploader"
          :model-value="element.assetId"
          @update:model-value="(id: string | undefined, filename?: string) => id && patch({ assetId: id, label: filename ?? (element as any).label })"
        />
        <div class="switches">
          <UiSwitch :model-value="element.playback.autoplay" @update:model-value="patchPlayback('autoplay', $event)">
            Автовоспроизведение
          </UiSwitch>
          <UiSwitch :model-value="element.playback.loop" @update:model-value="patchPlayback('loop', $event)">
            Зациклить
          </UiSwitch>
          <UiSwitch :model-value="element.playback.muted" @update:model-value="patchPlayback('muted', $event)">
            Без звука
          </UiSwitch>
        </div>
      </section>

      <section class="section">
        <h4>Слой</h4>
        <div class="row">
          <UiButton size="sm" title="На передний план" @click="emit('bringToFront', element.id)">⬆ Вперёд</UiButton>
          <UiButton size="sm" title="На задний план" @click="emit('sendToBack', element.id)">⬇ Назад</UiButton>
          <UiButton size="sm" title="Дублировать" @click="emit('duplicate', element.id)">⧉ Копия</UiButton>
          <UiButton size="sm" variant="danger" title="Удалить" @click="emit('remove', element.id)">🗑 Удалить</UiButton>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: var(--space-4);
  background: var(--color-surface-raised);
  border-left: 1px solid var(--color-border);
}
.empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.section h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.transform-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}
.transform-grid label {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.transform-grid input {
  width: 100%;
  min-width: 0;
}
.switches {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.field.grow {
  flex: 1;
}
.row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
textarea {
  width: 100%;
  resize: vertical;
}
</style>

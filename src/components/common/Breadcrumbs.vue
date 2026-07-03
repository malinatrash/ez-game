<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../../stores/gameEditor'
import { useGameLibraryStore } from '../../stores/gameLibrary'

interface Crumb {
  label: string
  to?: string
}

const route = useRoute()
const router = useRouter()
const gameStore = useGameEditorStore()
const libraryStore = useGameLibraryStore()

function gameTitle(gameId: string): string {
  if (gameStore.game?.id === gameId) return gameStore.game.meta.title
  return libraryStore.entries.find((e) => e.id === gameId)?.meta.title ?? 'Игра'
}

const crumbs = computed<Crumb[]>(() => {
  const path = route.path
  if (path === '/') return []

  const home: Crumb = { label: 'Главная', to: '/' }

  if (path === '/library') return [home, { label: 'Библиотека игр' }]
  if (path === '/settings') return [home, { label: 'Настройки' }]
  if (path === '/about') return [home, { label: 'О программе' }]

  const gameId = route.params.gameId as string | undefined
  if (!gameId) return [home]

  const library: Crumb = { label: 'Библиотека игр', to: '/library' }
  const editorRoot: Crumb = { label: gameTitle(gameId), to: `/editor/${gameId}` }

  if (path === `/editor/${gameId}`) return [home, library, { label: gameTitle(gameId) }]

  if (path === `/editor/${gameId}/question/${route.params.questionId}`) {
    const cost = gameStore.findQuestion(route.params.questionId as string)?.cost
    return [home, library, editorRoot, { label: cost ? `Вопрос за ${cost}` : 'Вопрос' }]
  }

  if (path === `/play/${gameId}/setup`) return [home, library, editorRoot, { label: 'Игроки' }]

  const board: Crumb = { label: 'Доска', to: `/play/${gameId}/board` }
  if (path === `/play/${gameId}/board`) return [home, library, editorRoot, { label: 'Доска' }]
  if (path === `/play/${gameId}/question/${route.params.questionId}`) {
    return [home, library, editorRoot, board, { label: 'Вопрос' }]
  }
  if (path === `/play/${gameId}/results`) return [home, library, editorRoot, board, { label: 'Результаты' }]

  return [home]
})

async function go(to: string) {
  if (gameStore.dirty) await gameStore.persist()
  router.push(to)
}
</script>

<template>
  <nav v-if="crumbs.length" class="breadcrumbs" aria-label="Хлебные крошки">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <button v-if="crumb.to" type="button" class="crumb link" @click="go(crumb.to)">{{ crumb.label }}</button>
      <span v-else class="crumb current" aria-current="page">{{ crumb.label }}</span>
      <span v-if="i < crumbs.length - 1" class="sep">›</span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  height: var(--size-breadcrumbs-height);
  padding: 0 var(--space-8);
  font-size: var(--font-size-sm);
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: var(--z-header);
}
.crumb {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}
.crumb.link {
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  transition: color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard);
}
.crumb.link:hover {
  color: var(--color-accent);
  background: var(--color-accent-bg);
}
.crumb.current {
  color: var(--color-text-heading);
  font-weight: 600;
}
.sep {
  color: var(--color-text-muted);
  opacity: 0.6;
}
</style>

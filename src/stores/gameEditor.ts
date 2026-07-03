import { defineStore } from 'pinia'
import type { Category, Game, GameMeta, Question } from '../types/game'
import { idb } from '../services/idb'
import { createId } from '../services/id'
import { migrateGameToV2 } from '../services/legacyMigration'

function createQuestion(cost: number): Question {
  return {
    id: createId(),
    cost,
    text: '',
    hostNotes: '',
    content: [],
    answer: [],
    settings: {
      timeLimitSec: null,
      showTimer: true,
      autoReveal: false,
      hideCostAfterReveal: false,
      isBonus: false,
    },
    answered: false,
  }
}

export const useGameEditorStore = defineStore('gameEditor', {
  state: () => ({
    game: null as Game | null,
    dirty: false,
  }),
  actions: {
    async loadGame(id: string) {
      const game = (await idb.getGame(id)) ?? null
      this.game = game ? migrateGameToV2(game) : null
      this.dirty = false
    },

    async persist() {
      if (!this.game) return
      this.game.meta.updatedAt = new Date().toISOString()
      await idb.setGame(this.game)
      this.dirty = false
    },

    updateMeta(patch: Partial<GameMeta>) {
      if (this.game) Object.assign(this.game.meta, patch)
    },

    addCategory(title: string) {
      const category: Category = { id: createId(), title, questions: [] }
      this.game?.categories.push(category)
    },

    removeCategory(categoryId: string) {
      if (!this.game) return
      this.game.categories = this.game.categories.filter((c) => c.id !== categoryId)
    },

    moveCategory(categoryId: string, direction: -1 | 1) {
      const categories = this.game?.categories
      if (!categories) return
      const index = categories.findIndex((c) => c.id === categoryId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= categories.length) return
      ;[categories[index], categories[target]] = [categories[target], categories[index]]
    },

    addQuestion(categoryId: string, cost: number) {
      const category = this.game?.categories.find((c) => c.id === categoryId)
      category?.questions.push(createQuestion(cost))
    },

    removeQuestion(questionId: string) {
      if (!this.game) return
      for (const category of this.game.categories) {
        category.questions = category.questions.filter((q) => q.id !== questionId)
      }
    },

    findQuestion(questionId: string): Question | undefined {
      for (const category of this.game?.categories ?? []) {
        const question = category.questions.find((q) => q.id === questionId)
        if (question) return question
      }
      return undefined
    },
  },
})

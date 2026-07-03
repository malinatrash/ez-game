import { createRouter, createWebHistory } from 'vue-router'
import MainMenuPage from '../views/MainMenuPage.vue'
import LibraryPage from '../views/LibraryPage.vue'
import GameEditorPage from '../views/GameEditorPage.vue'
import QuestionEditorPage from '../views/QuestionEditorPage.vue'
import PlaySetupPage from '../views/PlaySetupPage.vue'
import PlayBoardPage from '../views/PlayBoardPage.vue'
import PlayQuestionPage from '../views/PlayQuestionPage.vue'
import ResultsPage from '../views/ResultsPage.vue'
import SettingsPage from '../views/SettingsPage.vue'
import AboutPage from '../views/AboutPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MainMenuPage },
    { path: '/settings', component: SettingsPage },
    { path: '/about', component: AboutPage },
    { path: '/library', component: LibraryPage },
    { path: '/editor/:gameId', component: GameEditorPage },
    { path: '/editor/:gameId/question/:questionId', component: QuestionEditorPage },
    { path: '/play/:gameId/setup', component: PlaySetupPage },
    { path: '/play/:gameId/board', component: PlayBoardPage },
    { path: '/play/:gameId/question/:questionId', component: PlayQuestionPage },
    { path: '/play/:gameId/results', component: ResultsPage },
  ],
})

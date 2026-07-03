import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import VueKonva from 'vue-konva'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/base.css'
import App from './App.vue'
import { router } from './router'

document.documentElement.dataset.theme = 'dark'

createApp(App).use(createPinia()).use(router).use(MotionPlugin).use(VueKonva).mount('#app')

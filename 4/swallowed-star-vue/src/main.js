import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/pages.css'
import './styles/treasure.css'
import './styles/battle.css'

createApp(App).use(router).mount('#app')

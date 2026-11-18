import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/pages.css'
import './styles/treasure.css'
import './styles/battle.css'
import './styles/rank.css'
import './styles/anime.css'
import './styles/userDirectory.css'

createApp(App).use(router).mount('#app')

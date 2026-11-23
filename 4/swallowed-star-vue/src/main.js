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

// 启动即从后端加载「功能配置」，覆盖擂台数值参数（失败静默，用默认值）
import { getFeatureConfig } from './api/config.js'
import { applyBattleConfig } from './game/battle/roster.js'
import { applyTreasureConfig } from './game/treasure/levels.js'
getFeatureConfig().then((cfg) => {
  if (cfg?.numbers?.battle) applyBattleConfig(cfg.numbers.battle)
  if (cfg?.numbers?.treasure) applyTreasureConfig(cfg.numbers.treasure)
}).catch(() => {})

createApp(App).use(router).mount('#app')

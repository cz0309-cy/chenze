/**
 * 星骸远航 · 存档系统
 * ============================================================
 * 战机养成等级、解锁武器、通关进度，localStorage 持久化
 * ============================================================
 */
import { UPGRADES, WEAPONS } from './levels.js'

const SAVE_KEY = 'stardrift_voyage_v2'

export class SaveManager {
  constructor() {
    // 养成等级
    this.upgrades = { attack: 1, speed: 1, shield: 1, missile: 1, charge: 1, cooldown: 1 }
    // 已解锁武器
    this.unlockedWeapons = ['machinegun']
    // 星核（通用货币，用于养成升级）
    this.core = 0
    // 已通关关卡
    this.completedLevels = []
    this._load()
  }

  _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        Object.assign(this.upgrades, s.upgrades || {})
        this.unlockedWeapons = s.unlockedWeapons || ['machinegun']
        this.core = s.core ?? 0
        this.completedLevels = s.completedLevels || []
      }
    } catch (e) {
      /* 忽略损坏存档 */
    }
  }

  save() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          upgrades: this.upgrades,
          unlockedWeapons: this.unlockedWeapons,
          core: this.core,
          completedLevels: this.completedLevels
        })
      )
    } catch (e) {
      /* 忽略写入失败 */
    }
  }

  addCore(n) {
    this.core += n
    this.save()
  }

  // 升级养成项
  upgrade(id) {
    const def = UPGRADES.find((u) => u.id === id)
    if (!def) return false
    if (this.upgrades[id] >= def.max) return false
    const cost = def.cost * this.upgrades[id] // 每级递增
    if (this.core < cost) return false
    this.core -= cost
    this.upgrades[id]++
    this.save()
    return true
  }

  unlockWeapon(key) {
    if (!this.unlockedWeapons.includes(key)) {
      this.unlockedWeapons.push(key)
      this.save()
    }
  }

  markLevelComplete(id) {
    if (!this.completedLevels.includes(id)) {
      this.completedLevels.push(id)
      this.save()
    }
  }
}

export { UPGRADES, WEAPONS }

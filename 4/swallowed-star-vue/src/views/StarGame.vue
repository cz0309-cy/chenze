<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">STARDRIFT VOYAGE</div>
        <h1>星骸远航</h1>
        <p>你是星际远航者，驾驶黑金战机穿梭星海，挑战八大关卡。鼠标转向，左键射击，右键蓄力狙击，<b>1-4</b> 切换武器，<b>Q</b> 能量爆发。</p>
      </header>

      <!-- 3D 游戏容器 -->
      <section class="game-wrap" ref="wrap" @contextmenu.prevent>
        <canvas ref="canvas" class="game-canvas"></canvas>

        <!-- 左上 HUD：血条/护盾/关卡 -->
        <div class="hud hud-status">
          <div class="bar-row">
            <span class="bar-label">船体</span>
            <div class="bar"><i class="bar-hp" :style="{ width: (hp / maxHp) * 100 + '%' }"></i></div>
          </div>
          <div class="bar-row">
            <span class="bar-label">护盾</span>
            <div class="bar"><i class="bar-shield" :style="{ width: (shield / maxShield) * 100 + '%' }"></i></div>
          </div>
          <div class="level-info">
            <span>第 {{ currentLevelId }} 关 · {{ currentLevelName }}</span>
          </div>
          <div class="objective">
            <span>目标：{{ currentObjective }}</span>
          </div>
          <div class="weapon-info">
            武器：<b>{{ weaponName }}</b> <span v-if="killCount" class="kill-count">击杀 {{ killCount }}/{{ totalEnemies }}</span>
          </div>
        </div>

        <!-- 右上：武器栏 -->
        <div class="hud hud-weapons">
          <button
            v-for="w in weaponBar"
            :key="w.key"
            type="button"
            class="w-btn"
            :class="{ active: currentWeapon === w.key, locked: !w.unlocked }"
            :disabled="!w.unlocked"
            @click="switchWeapon(w.key)"
          >
            {{ w.num }} {{ w.name }}
          </button>
        </div>

        <!-- 底部提示 -->
        <div class="hud hud-bottom">
          左键射击 · 右键蓄力狙击 · WASD 机动 · 鼠标转向 · Shift 加速 · Q 爆发
        </div>

        <!-- 关卡选择界面（初始） -->
        <div v-if="showLevelSelect" class="panel center-panel level-select">
          <h2>选择关卡</h2>
          <div class="level-grid">
            <button
              v-for="lv in LEVELS"
              :key="lv.id"
              type="button"
              class="level-card"
              :class="{ unlocked: isLevelUnlocked(lv.id), current: currentLevelId === lv.id }"
              :disabled="!isLevelUnlocked(lv.id)"
              @click="startLevel(lv.id)"
            >
              <b>第 {{ lv.id }} 关</b>
              <span>{{ lv.name }}</span>
              <i>{{ lv.subtitle }}</i>
            </button>
          </div>
          <div class="panel-actions">
            <button class="btn-secondary" type="button" @click="showUpgrade = true">战机养成</button>
            <button class="btn-primary" type="button" @click="showLevelSelect = false">进入当前关</button>
          </div>
        </div>

        <!-- 战机养成面板 -->
        <div v-if="showUpgrade" class="panel center-panel">
          <h2>战机养成 <span class="core-badge">星核 {{ save.core }}</span></h2>
          <div class="upgrade-list">
            <div v-for="u in UPGRADES" :key="u.id" class="upgrade-item">
              <div class="u-info">
                <b>{{ u.name }}</b>
                <i>{{ u.desc }}</i>
              </div>
              <div class="u-level">Lv.{{ save.upgrades[u.id] }}</div>
              <button
                type="button"
                class="u-btn"
                :disabled="save.upgrades[u.id] >= u.max || save.core < u.cost * save.upgrades[u.id]"
                @click="doUpgrade(u.id)"
              >
                {{ u.cost * save.upgrades[u.id] }} 🔮
              </button>
            </div>
          </div>
          <button class="close-btn" type="button" @click="showUpgrade = false">关闭</button>
        </div>

        <!-- 通关遮罩 -->
        <div v-if="showComplete" class="overlay">
          <div class="over-box">
            <h2>🎉 通关成功！</h2>
            <p>{{ completeText }}</p>
            <button class="btn-primary" type="button" @click="nextLevel">下一关</button>
            <button class="btn-secondary" type="button" @click="showLevelSelect = true; showComplete = false">选关</button>
          </div>
        </div>

        <!-- 死亡遮罩 -->
        <div v-if="showDeath" class="overlay">
          <div class="over-box">
            <h2>💥 战机被击毁</h2>
            <p>再接再厉，强化战机后再来挑战</p>
            <button class="btn-primary" type="button" @click="retry">重新挑战</button>
            <button class="btn-secondary" type="button" @click="showLevelSelect = true; showDeath = false">返回选关</button>
          </div>
        </div>
      </section>

      <p class="hint">八大关卡 · 战机养成 · 武器系统。通关奖励：连发炮 / 护盾充能 / 导弹发射器 / 喷射近战 / 速度提升 / 能量护盾 / 终极爆发。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { StardriftEngine, LEVELS, UPGRADES, WEAPONS } from '../game/engine.js'
import { SaveManager } from '../game/save.js'

const canvas = ref(null)
const wrap = ref(null)

// 存档
const save = new SaveManager()

// HUD 状态
const hp = ref(100)
const maxHp = ref(100)
const shield = ref(50)
const maxShield = ref(50)
const currentLevelId = ref(1)
const currentLevelName = ref('')
const currentObjective = ref('')
const currentWeapon = ref('machinegun')
const killCount = ref(0)
const totalEnemies = ref(0)

// UI 面板状态
const showLevelSelect = ref(true)
const showUpgrade = ref(false)
const showComplete = ref(false)
const showDeath = ref(false)
const completeText = ref('')

// 武器栏（1-4 键）
const weaponBar = computed(() => [
  { key: 'machinegun', num: 1, name: '机枪', unlocked: save.unlockedWeapons.includes('machinegun') },
  { key: 'sniper', num: 2, name: '狙击', unlocked: save.unlockedWeapons.includes('sniper') },
  { key: 'missile', num: 3, name: '导弹', unlocked: save.unlockedWeapons.includes('missile') },
  { key: 'scatter', num: 4, name: '散射', unlocked: save.unlockedWeapons.includes('scatter') }
])

const weaponName = computed(() => WEAPONS[currentWeapon.value]?.name || '能量机枪')

let engine = null

onMounted(() => {
  engine = new StardriftEngine(canvas.value, {
    onLevelLoad: (def) => {
      currentLevelId.value = def.id
      currentLevelName.value = def.name
      currentObjective.value = def.objective
      killCount.value = 0
      totalEnemies.value = def.enemies.reduce((s, g) => s + g.count, 0)
      showComplete.value = false
      showDeath.value = false
    },
    onKill: (enemy, killed, total) => {
      killCount.value = killed
      totalEnemies.value = total
      save.addCore(5) // 击杀奖励星核
    },
    onDamage: (h, mh, s, ms) => {
      hp.value = h
      maxHp.value = mh
      shield.value = s
      maxShield.value = ms
    },
    onDeath: () => {
      showDeath.value = true
    },
    onLevelComplete: (def) => {
      save.markLevelComplete(def.id)
      save.addCore(50) // 通关奖励
      completeText.value = def.reward ? def.reward.desc : '完成关卡'
      // 解锁武器
      if (def.reward?.kind === 'weapon') {
        const map = { '连发炮': 'machinegun', '导弹发射器': 'missile', '喷射近战': 'scatter', '狙击炮': 'sniper', '能量爆发': 'burst' }
        const key = map[def.reward.name]
        if (key) save.unlockWeapon(key)
      }
      showComplete.value = true
    },
    onWeaponChange: (key) => { currentWeapon.value = key }
  })

  // 应用养成到引擎
  engine.upgrades = { ...save.upgrades }
  engine.maxHp = 100 + (save.upgrades.shield - 1) * 20
  engine.maxShield = 50 + (save.upgrades.shield - 1) * 15
  engine.hp = engine.maxHp
  engine.shield = engine.maxShield
  maxHp.value = engine.maxHp
  maxShield.value = engine.maxShield
  hp.value = engine.hp
  shield.value = engine.shield
})

function isLevelUnlocked(id) {
  // 第1关始终解锁；其余需完成前一关
  if (id === 1) return true
  return save.completedLevels.includes(id - 1)
}

function startLevel(id) {
  currentLevelId.value = id
  engine?.loadLevel(id - 1)
  showLevelSelect.value = false
  showComplete.value = false
  showDeath.value = false
}

function nextLevel() {
  const next = currentLevelId.value + 1
  if (next <= 8) startLevel(next)
  else showLevelSelect.value = true
}

function retry() {
  engine?.loadLevel(currentLevelId.value - 1)
}

function switchWeapon(key) {
  if (save.unlockedWeapons.includes(key)) {
    currentWeapon.value = key
    engine?._switchWeapon(key)
  }
}

function doUpgrade(id) {
  if (save.upgrade(id)) {
    // 同步到引擎
    engine.upgrades = { ...save.upgrades }
    engine.maxHp = 100 + (save.upgrades.shield - 1) * 20
    engine.maxShield = 50 + (save.upgrades.shield - 1) * 15
    maxHp.value = engine.maxHp
    maxShield.value = engine.maxShield
    // 回血
    engine.hp = engine.maxHp
    engine.shield = engine.maxShield
    hp.value = engine.hp
    shield.value = engine.shield
  }
}

onBeforeUnmount(() => {
  engine?.dispose()
})
</script>

<style scoped>
.game-wrap {
  position: relative;
  height: 560px;
  border-radius: 14px;
  overflow: hidden;
  background: #050a1e;
  cursor: crosshair;
}
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* HUD */
.hud {
  position: absolute;
  pointer-events: none;
  color: #e8eef8;
  user-select: none;
  z-index: 5;
}
.hud-status {
  top: 14px;
  left: 16px;
  background: rgba(5, 8, 16, 0.7);
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 212, 121, 0.2);
  min-width: 220px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.bar-label {
  font-size: 12px;
  width: 28px;
  color: #9fb3c8;
}
.bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}
.bar-hp {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ff5f5f, #ffaa44);
  transition: width 0.2s;
}
.bar-shield {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #44aaff, #88ddff);
  transition: width 0.2s;
}
.level-info {
  margin-top: 8px;
  font-size: 14px;
  color: #ffd479;
}
.objective {
  font-size: 11px;
  color: #9fb3c8;
  margin-top: 4px;
}
.weapon-info {
  font-size: 12px;
  color: #cfd8e4;
  margin-top: 4px;
}
.weapon-info b { color: #ffd479; }
.kill-count { margin-left: 8px; color: #8fd0ff; }

.hud-weapons {
  top: 14px;
  right: 16px;
  display: flex;
  gap: 6px;
  pointer-events: auto;
}
.w-btn {
  padding: 6px 10px;
  font-size: 12px;
  color: #cfcfcf;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  cursor: pointer;
}
.w-btn.active {
  color: #000;
  background: #ffd479;
  border-color: #ffd479;
}
.w-btn.locked {
  opacity: 0.35;
  cursor: not-allowed;
}

.hud-bottom {
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #cfd8e4;
  background: rgba(5, 8, 16, 0.55);
  padding: 8px 18px;
  border-radius: 20px;
  white-space: nowrap;
}

/* 面板 */
.panel {
  position: absolute;
  z-index: 10;
  background: rgba(8, 12, 24, 0.94);
  border: 1px solid rgba(255, 212, 121, 0.25);
  border-radius: 14px;
  padding: 22px;
  color: #e8eef8;
  pointer-events: auto;
  max-height: 86%;
  overflow-y: auto;
}
.center-panel {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
}
.panel h2 {
  margin: 0 0 14px;
  font-size: 20px;
  color: #ffd479;
  letter-spacing: 1px;
}
.core-badge {
  float: right;
  font-size: 14px;
  color: #ffd479;
}

/* 关卡选择 */
.level-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.level-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  color: #e8eef8;
}
.level-card b { font-size: 15px; color: #ffd479; }
.level-card span { font-size: 14px; }
.level-card i { font-style: normal; font-size: 12px; color: #9fb3c8; }
.level-card:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.level-card.unlocked:hover {
  border-color: rgba(255, 212, 121, 0.5);
  background: rgba(255, 212, 121, 0.08);
}
.level-card.current {
  border-color: #5fdc8a;
}

.panel-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.btn-primary {
  flex: 1;
  padding: 10px;
  background: #ffd479;
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}
.btn-secondary {
  flex: 1;
  padding: 10px;
  background: rgba(255, 212, 121, 0.15);
  color: #ffd479;
  border: 1px solid rgba(255, 212, 121, 0.4);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

/* 养成 */
.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upgrade-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}
.u-info { flex: 1; display: flex; flex-direction: column; }
.u-info b { font-size: 14px; }
.u-info i { font-style: normal; font-size: 12px; color: #9fb3c8; }
.u-level { font-size: 13px; color: #8fd0ff; width: 50px; }
.u-btn {
  padding: 6px 14px;
  background: rgba(255, 212, 121, 0.15);
  border: 1px solid rgba(255, 212, 121, 0.4);
  color: #ffd479;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.u-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.close-btn {
  margin-top: 16px;
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cfcfcf;
  border-radius: 8px;
  cursor: pointer;
}

/* 遮罩 */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 20;
}
.over-box {
  text-align: center;
  color: #fff;
  padding: 30px;
}
.over-box h2 {
  margin: 0 0 10px;
  font-size: 28px;
  letter-spacing: 1px;
}
.over-box p {
  margin: 0 0 20px;
  color: #cfcfcf;
  font-size: 15px;
}
.over-box .btn-primary,
.over-box .btn-secondary {
  flex: none;
  margin: 4px;
  min-width: 120px;
}

.hint {
  margin-top: 12px;
  text-align: center;
  color: #889;
  font-size: 13px;
}
</style>

/**
 * 星骸远航 · 3D 引擎核心（战役关卡制）
 * ============================================================
 * 基于 Three.js 的太空飞行射击引擎：
 *   - 8 关卡战役（数据驱动）
 *   - 第三人称战机（黑金装甲）+ 鼠标转向 + Shift 加速
 *   - 5 种武器 / 敌人 / 爆炸特效 / BOSS 三阶段
 *   - 战机养成（攻击/速度/护盾/导弹/蓄力/冷却）
 * ============================================================
 */
import * as THREE from 'three'
import { LEVELS, UPGRADES, WEAPONS } from './levels.js'
import { CombatSystem } from './combat.js'
import { BossSystem } from './boss.js'

export class StardriftEngine {
  constructor(canvas, ui = {}) {
    this.canvas = canvas
    this.ui = ui

    // 战机养成（默认等级 1）
    this.upgrades = { attack: 1, speed: 1, shield: 1, missile: 1, charge: 1, cooldown: 1 }
    // 解锁的武器
    this.unlockedWeapons = ['machinegun']
    // 当前武器
    this.currentWeapon = 'machinegun'

    // 关卡状态
    this.currentLevel = 0 // 索引
    this.levelComplete = false
    this.killCount = 0

    // 战机状态
    this.hp = 100
    this.maxHp = 100
    this.shield = 50
    this.maxShield = 50

    this._initRenderer()
    this._initScene()
    this._initLighting()
    this._initShip()
    this._initControls()

    // 战斗系统 + BOSS
    this.combat = new CombatSystem(this.scene)
    this.boss = new BossSystem(this.scene, this.combat)

    this._lastTime = performance.now()
    this._running = true
    this._loop = this._loop.bind(this)
    requestAnimationFrame(this._loop)

    // 初始加载第 1 关
    this.loadLevel(0)
  }

  // ----------------------------------------------------------
  // 渲染器 / 场景 / 光照
  // ----------------------------------------------------------
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x050a1e)
    this.camera = new THREE.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 20000)
    this.camera.position.set(0, 18, 70)
    this.scene.fog = new THREE.FogExp2(0x050a1e, 0.00008)
  }

  _initLighting() {
    this.sunLight = new THREE.PointLight(0xfff2d0, 2.0, 8000, 1.5)
    this.sunLight.position.set(0, 0, -800)
    this.scene.add(this.sunLight)
    this.scene.add(new THREE.AmbientLight(0x334466, 1.2))
    this.shipLight = new THREE.PointLight(0x88bbff, 1.5, 150, 2)
  }

  // ----------------------------------------------------------
  // 战机（黑金装甲）
  // ----------------------------------------------------------
  _initShip() {
    this.ship = new THREE.Group()

    // 机身：黑金色调
    const bodyGeo = new THREE.ConeGeometry(2.4, 10, 8)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a20, metalness: 0.9, roughness: 0.3 })
    this.shipBody = new THREE.Mesh(bodyGeo, bodyMat)
    this.shipBody.rotation.x = Math.PI / 2
    this.ship.add(this.shipBody)

    // 金色装甲条纹
    const stripeGeo = new THREE.TorusGeometry(2.0, 0.25, 8, 24)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.9, roughness: 0.2, emissive: 0x664400, emissiveIntensity: 0.5 })
    const stripe = new THREE.Mesh(stripeGeo, stripeMat)
    stripe.rotation.x = Math.PI / 2
    stripe.position.z = -1
    this.ship.add(stripe)

    // 机翼（黑金）
    const wingGeo = new THREE.BoxGeometry(8, 0.3, 3)
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x222228, metalness: 0.85, roughness: 0.3 })
    this.shipWings = new THREE.Mesh(wingGeo, wingMat)
    this.shipWings.position.set(0, 0, -1.5)
    this.ship.add(this.shipWings)

    // 金色翼尖
    const tipGeo = new THREE.BoxGeometry(1.5, 0.4, 3)
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.9, roughness: 0.2 })
    const tipL = new THREE.Mesh(tipGeo, tipMat)
    tipL.position.set(-3.5, 0, -1.5)
    this.ship.add(tipL)
    const tipR = new THREE.Mesh(tipGeo, tipMat)
    tipR.position.set(3.5, 0, -1.5)
    this.ship.add(tipR)

    // 引擎（发光）
    const engineGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.6, 12)
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x3366cc, emissive: 0x2255aa, emissiveIntensity: 2.0 })
    this.shipEngine = new THREE.Mesh(engineGeo, engineMat)
    this.shipEngine.rotation.x = Math.PI / 2
    this.shipEngine.position.set(0, 0, -5)
    this.ship.add(this.shipEngine)

    this.ship.add(this.shipLight)
    this.shipLight.position.set(0, 0, 4)
    this.ship.position.set(0, 0, 0)
    this.scene.add(this.ship)

    this.shipVel = new THREE.Vector3()
    this.shipAngle = 0
    this.shipPitch = 0
  }

  // ----------------------------------------------------------
  // 星空背景
  // ----------------------------------------------------------
  _initStarfield() {
    if (this.starField) this.scene.remove(this.starField)
    const count = 1600
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2000 + Math.random() * 6000
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      pos[i * 3 + 2] = r * Math.cos(ph)
      // 星星颜色：白/蓝/暖白
      const c = Math.random()
      col[i * 3] = c < 0.3 ? 0.6 : 1
      col[i * 3 + 1] = c < 0.3 ? 0.7 : 1
      col[i * 3 + 2] = 1
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = new THREE.PointsMaterial({ vertexColors: true, size: 2.0, sizeAttenuation: true, transparent: true, opacity: 0.9 })
    this.starField = new THREE.Points(geo, mat)
    this.scene.add(this.starField)
  }

  // 陨石带（第1关等）
  _initAsteroids(count = 60) {
    if (this.asteroids) {
      for (const a of this.asteroids) this.scene.remove(a)
    }
    this.asteroids = []
    for (let i = 0; i < count; i++) {
      const geo = new THREE.IcosahedronGeometry(2 + Math.random() * 5, 0)
      const mat = new THREE.MeshStandardMaterial({ color: 0x777788, roughness: 0.9, metalness: 0.1 })
      const a = new THREE.Mesh(geo, mat)
      // 散布在前进方向
      a.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200,
        -200 - Math.random() * 2000
      )
      a.userData = { rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()) }
      this.scene.add(a)
      this.asteroids.push(a)
    }
  }

  // ----------------------------------------------------------
  // 关卡加载
  // ----------------------------------------------------------
  loadLevel(index) {
    this.currentLevel = index
    const def = LEVELS[index]
    this.levelDef = def
    this.levelComplete = false
    this.killCount = 0

    // 场景配色
    this.scene.background = new THREE.Color(def.skyColor)
    this.scene.fog = new THREE.FogExp2(def.skyColor, 0.00008)

    // 清空战斗
    this.combat.clearAll()
    this.boss.dispose()

    // 重置战机
    this.ship.position.set(0, 0, 0)
    this.shipVel.set(0, 0, 0)
    this.hp = this.maxHp
    this.shield = this.maxShield

    // 星空
    this._initStarfield()

    // 生成敌人
    if (def.enemies.length > 0) {
      this.combat.spawnWave(def, this.ship.position)
      this.totalEnemies = this.combat.enemies.length
    } else {
      this.totalEnemies = 0
    }

    // 陨石（第1关、第4关有陨石带）
    if (index === 0 || index === 3) {
      this._initAsteroids(index === 0 ? 60 : 40)
    } else if (this.asteroids) {
      for (const a of this.asteroids) this.scene.remove(a)
      this.asteroids = []
    }

    // BOSS 关（第8关）
    if (def.boss) {
      this.boss.spawn(new THREE.Vector3(0, 0, -500))
    }

    this.ui.onLevelLoad?.(def)
  }

  // 通关
  _completeLevel() {
    if (this.levelComplete) return
    this.levelComplete = true
    const def = this.levelDef
    // 发放奖励
    if (def.reward) {
      if (def.reward.kind === 'weapon') {
        // 解锁武器
        const weaponKey = this._rewardToWeapon(def.reward.name)
        if (weaponKey && !this.unlockedWeapons.includes(weaponKey)) {
          this.unlockedWeapons.push(weaponKey)
        }
      }
    }
    this.ui.onLevelComplete?.(def)
  }

  _rewardToWeapon(name) {
    const map = {
      '连发炮': 'machinegun',
      '导弹发射器': 'missile',
      '喷射近战': 'scatter',
      '狙击炮': 'sniper',
      '能量爆发': 'burst'
    }
    return map[name]
  }

  // ----------------------------------------------------------
  // 输入
  // ----------------------------------------------------------
  _initControls() {
    this.keys = {}
    this.mouse = { x: 0, y: 0, down: false, right: false, wheel: 0 }
    this.camDist = 46

    this._onKeyDown = (e) => this._handleKey(e, true)
    this._onKeyUp = (e) => this._handleKey(e, false)
    this._onMouseMove = (e) => this._handleMouseMove(e)
    this._onMouseDown = (e) => this._handleMouseDown(e, true)
    this._onMouseUp = (e) => this._handleMouseDown(e, false)
    this._onWheel = (e) => { this.mouse.wheel += e.deltaY }
    this._onResize = () => this._resize()

    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    window.addEventListener('mousemove', this._onMouseMove)
    window.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('mouseup', this._onMouseUp)
    window.addEventListener('wheel', this._onWheel)
    window.addEventListener('resize', this._onResize)
  }

  _handleKey(e, down) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
    this.keys[e.code] = down
    if (down) {
      if (e.code === 'Digit1') this._switchWeapon('machinegun')
      if (e.code === 'Digit2') this._switchWeapon('sniper')
      if (e.code === 'Digit3') this._switchWeapon('missile')
      if (e.code === 'Digit4') this._switchWeapon('scatter')
      if (e.code === 'KeyQ') this._fireBurst()
    }
  }

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  _handleMouseDown(e, down) {
    if (e.button === 0) this.mouse.down = down
    if (e.button === 2) this.mouse.right = down
  }

  _resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  _switchWeapon(key) {
    if (this.unlockedWeapons.includes(key)) {
      this.currentWeapon = key
      this.ui.onWeaponChange?.(key)
    }
  }

  _fireBurst() {
    // 能量爆发：范围清场
    if (this.currentWeapon !== 'burst') return
    this.combat.spawnExplosion(this.ship.position.clone(), 0x88ddff, 4)
    for (const e of this.combat.enemies) {
      if (e.position.distanceTo(this.ship.position) < 80) {
        e.hp -= 100
        if (e.hp <= 0) {
          e.dead = true
          this.killCount++
        }
      }
    }
  }

  // ----------------------------------------------------------
  // 主循环
  // ----------------------------------------------------------
  _loop() {
    if (!this._running) return
    const now = performance.now()
    const dt = Math.min(0.05, (now - this._lastTime) / 1000)
    this._lastTime = now

    this._updateShip(dt)
    this._updateCombat(dt)
    this._updateCamera(dt)
    this._updateEnvironment(dt)

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this._loop)
  }

  _updateShip(dt) {
    const spd = 120 * (1 + (this.upgrades.speed - 1) * 0.15)
    const boost = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? 1.8 : 1
    const fwd = new THREE.Vector3(0, 0, -1).applyEuler(this.ship.rotation)

    if (this.keys['KeyW']) this.shipVel.addScaledVector(fwd, spd * boost * dt)
    if (this.keys['KeyS']) this.shipVel.addScaledVector(fwd, -spd * 0.6 * dt)

    this.shipAngle -= this.mouse.x * 1.6 * dt * 3
    this.shipPitch -= this.mouse.y * 1.3 * dt * 3
    this.shipPitch = Math.max(-1.2, Math.min(1.2, this.shipPitch))
    this.ship.rotation.y = this.shipAngle
    this.ship.rotation.x = this.shipPitch

    const right = new THREE.Vector3(1, 0, 0).applyEuler(this.ship.rotation)
    if (this.keys['KeyA']) this.shipVel.addScaledVector(right, -spd * 0.5 * dt)
    if (this.keys['KeyD']) this.shipVel.addScaledVector(right, spd * 0.5 * dt)

    this.shipVel.multiplyScalar(Math.pow(0.93, dt * 60))
    this.ship.position.addScaledVector(this.shipVel, dt)

    // 引擎发光随速度变化
    this.shipEngine.material.emissiveIntensity = boost > 1 ? 4 : 2

    // 射击
    if (this.mouse.down && !this.levelComplete) {
      this._fireCooldown = this._fireCooldown || 0
      this._fireCooldown -= dt
      if (this._fireCooldown <= 0) {
        const rate = this.currentWeapon === 'machinegun' ? 0.12 : 0.5
        this._fireCooldown = rate
        this.combat.firePlayer(this.currentWeapon, this.ship, this.camera, {
          attackMult: 1 + (this.upgrades.attack - 1) * 0.25
        })
      }
    }

    // 狙击蓄力（右键）
    if (this.mouse.right && this.currentWeapon === 'sniper') {
      this._chargePower = (this._chargePower || 0) + dt
    } else {
      this._chargePower = 0
    }
  }

  _updateCombat(dt) {
    if (this.levelComplete) return

    // 战斗系统更新
    this.combat.update(
      dt,
      this.ship,
      (enemy) => {
        this.killCount++
        this.ui.onKill?.(enemy, this.killCount, this.totalEnemies)
      },
      (damage) => {
        this._takeDamage(damage)
      }
    )

    // BOSS 更新
    if (this.boss.active) {
      this.boss.update(dt, this.ship, (dmg) => this._takeDamage(dmg), () => {
        // BOSS 召唤小怪
        this.combat.spawnEnemy('starBeastCub', this.boss.boss.position.clone().add(new THREE.Vector3(20, 0, 0)))
      })
    }

    // 通关判定
    if (this.levelDef) {
      // BOSS 关：击败 BOSS 通关
      if (this.levelDef.boss) {
        if (this.boss.boss?.dead) this._completeLevel()
      } else if (this.levelDef.enemies.length > 0) {
        // 普通关：消灭所有敌人
        if (this.killCount >= this.totalEnemies && this.combat.enemies.length === 0) {
          this._completeLevel()
        }
      }
    }
  }

  _takeDamage(dmg) {
    // 先扣护盾
    if (this.shield > 0) {
      this.shield -= dmg
      if (this.shield < 0) {
        this.hp += this.shield // 溢出到血量
        this.shield = 0
      }
    } else {
      this.hp -= dmg
    }
    this.ui.onDamage?.(this.hp, this.maxHp, this.shield, this.maxShield)
    if (this.hp <= 0) {
      this.hp = 0
      this.ui.onDeath?.()
    }
  }

  _updateCamera(dt) {
    const back = new THREE.Vector3(0, 0, 1).applyEuler(this.ship.rotation)
    const target = this.ship.position.clone().addScaledVector(back, this.camDist)
    target.y += 8
    this.camera.position.lerp(target, Math.min(1, dt * 6))
    this.camera.lookAt(this.ship.position)

    this.camDist += this.mouse.wheel * 0.05
    this.camDist = Math.max(20, Math.min(120, this.camDist))
    this.mouse.wheel = 0
  }

  _updateEnvironment(dt) {
    this.starField.rotation.y += dt * 0.004
    // 陨石自转
    if (this.asteroids) {
      for (const a of this.asteroids) {
        a.rotation.x += a.userData.rot.x * dt
        a.rotation.y += a.userData.rot.y * dt
        a.rotation.z += a.userData.rot.z * dt
      }
    }
    // 引擎光跟随
    this.shipLight.position.copy(this.ship.position)
  }

  // ----------------------------------------------------------
  // 清理
  // ----------------------------------------------------------
  dispose() {
    this._running = false
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    window.removeEventListener('mousemove', this._onMouseMove)
    window.removeEventListener('mousedown', this._onMouseDown)
    window.removeEventListener('mouseup', this._onMouseUp)
    window.removeEventListener('wheel', this._onWheel)
    window.removeEventListener('resize', this._onResize)
    this.combat.clearAll()
    this.boss.dispose()
    this.renderer.dispose()
  }
}

export { LEVELS, UPGRADES, WEAPONS }

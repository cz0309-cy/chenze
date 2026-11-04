/**
 * 星骸远航 · 战斗系统
 * ============================================================
 * 敌人、玩家子弹、敌方子弹、爆炸特效、碰撞检测、BOSS 状态机
 * ============================================================
 */
import * as THREE from 'three'
import { ENEMY_TYPES } from './levels.js'

export class CombatSystem {
  constructor(scene) {
    this.scene = scene
    this.enemies = [] // 敌方实体
    this.playerBullets = [] // 玩家子弹
    this.enemyBullets = [] // 敌方子弹
    this.effects = [] // 爆炸等特效
  }

  // ----------------------------------------------------------
  // 生成敌人
  // ----------------------------------------------------------
  spawnEnemy(typeKey, position) {
    const def = ENEMY_TYPES[typeKey]
    if (!def) return null

    const geo = new THREE.IcosahedronGeometry(def.size, 0)
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      metalness: 0.6,
      roughness: 0.4,
      emissive: def.color,
      emissiveIntensity: 0.3
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(position)
    this.scene.add(mesh)

    const enemy = {
      key: typeKey,
      def,
      mesh,
      hp: def.hp,
      maxHp: def.hp,
      position: mesh.position,
      velocity: new THREE.Vector3(),
      dead: false,
      fireCd: Math.random() * 2,
      phase: Math.random() * Math.PI * 2
    }
    this.enemies.push(enemy)
    return enemy
  }

  // 批量生成（按关卡定义，围绕玩家散布）
  spawnWave(levelDef, playerPos) {
    const spawned = []
    for (const group of levelDef.enemies) {
      for (let i = 0; i < group.count; i++) {
        const ang = Math.random() * Math.PI * 2
        const dist = 120 + Math.random() * 200
        const pos = new THREE.Vector3(
          playerPos.x + Math.cos(ang) * dist,
          playerPos.y + (Math.random() - 0.5) * 60,
          playerPos.z + Math.sin(ang) * dist
        )
        const e = this.spawnEnemy(group.type, pos)
        if (e) spawned.push(e)
      }
    }
    return spawned
  }

  // ----------------------------------------------------------
  // 玩家射击
  // ----------------------------------------------------------
  firePlayer(weapon, ship, cam, opts = {}) {
    // 计算射击方向：机头朝向
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(ship.rotation).normalize()
    const origin = ship.position.clone().addScaledVector(dir, 6)

    const bullets = []
    const count = weapon === 'scatter' ? 5 : 1
    const spread = weapon === 'scatter' ? 0.35 : 0

    for (let i = 0; i < count; i++) {
      let bdir = dir.clone()
      if (spread > 0) {
        bdir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i - (count - 1) / 2) * spread)
      }
      const geo = new THREE.SphereGeometry(weapon === 'sniper' ? 0.9 : 0.5, 8, 8)
      const col = weapon === 'sniper' ? 0xffcc44 : weapon === 'missile' ? 0xff8844 : 0x88ddff
      const mat = new THREE.MeshBasicMaterial({ color: col })
      const bm = new THREE.Mesh(geo, mat)
      bm.position.copy(origin)
      this.scene.add(bm)

      const speed = weapon === 'sniper' ? 260 : weapon === 'missile' ? 90 : 200
      const b = {
        mesh: bm,
        position: bm.position,
        velocity: bdir.clone().multiplyScalar(speed),
        damage: (opts.attackMult || 1) * (weapon === 'sniper' ? 40 : weapon === 'missile' ? 50 : 12),
        weapon,
        life: 3.0,
        homing: weapon === 'missile'
      }
      bullets.push(b)
      this.playerBullets.push(b)
    }
    return bullets
  }

  // ----------------------------------------------------------
  // 敌方射击（简易弹幕）
  // ----------------------------------------------------------
  enemyFire(enemy, shipPos) {
    const dir = shipPos.clone().sub(enemy.position).normalize()
    const geo = new THREE.SphereGeometry(0.5, 6, 6)
    const mat = new THREE.MeshBasicMaterial({ color: 0xff5533 })
    const bm = new THREE.Mesh(geo, mat)
    bm.position.copy(enemy.position)
    this.scene.add(bm)
    this.enemyBullets.push({
      mesh: bm,
      position: bm.position,
      velocity: dir.multiplyScalar(70),
      damage: 8,
      life: 4.0
    })
  }

  // ----------------------------------------------------------
  // 爆炸特效
  // ----------------------------------------------------------
  spawnExplosion(pos, color = 0xffaa33, scale = 1) {
    const count = 12
    const group = new THREE.Group()
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.8 * scale, 6, 6)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
      const m = new THREE.Mesh(geo, mat)
      m.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3)
      const v = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(20 * scale)
      group.add(m)
      m.userData.vel = v
    }
    group.position.copy(pos)
    this.scene.add(group)
    this.effects.push({ group, life: 0.8, type: 'explosion' })
  }

  // ----------------------------------------------------------
  // 每帧更新
  // ----------------------------------------------------------
  update(dt, ship, onEnemyKilled, onPlayerHit) {
    // 玩家子弹
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i]
      b.life -= dt
      // 导弹追踪最近敌人
      if (b.homing && this.enemies.length > 0) {
        const target = this._nearestEnemy(b.position)
        if (target) {
          const dir = target.position.clone().sub(b.position).normalize()
          b.velocity.lerp(dir.clone().multiplyScalar(90), dt * 4)
        }
      }
      b.position.addScaledVector(b.velocity, dt)
      if (b.life <= 0) {
        this._removeBullet(b, i)
        continue
      }
      // 命中检测
      let hit = false
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j]
        if (e.dead) continue
        if (b.position.distanceTo(e.position) < e.def.size + 1) {
          e.hp -= b.damage
          hit = true
          if (e.hp <= 0) {
            this._killEnemy(j)
            onEnemyKilled?.(e)
          }
          break
        }
      }
      if (hit) {
        this._removeBullet(b, i)
      }
    }

    // 敌方行为
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (e.dead) { this._killEnemy(i); continue }
      // 追踪玩家
      if (e.def.speed > 0) {
        const dir = ship.position.clone().sub(e.position).normalize()
        e.velocity.lerp(dir.clone().multiplyScalar(e.def.speed), dt * 2)
        e.position.addScaledVector(e.velocity, dt)
      }
      // 环绕动画
      e.mesh.rotation.x += dt * 1.5
      e.mesh.rotation.y += dt * 1.2
      // 射击
      e.fireCd -= dt
      if (e.fireCd <= 0 && e.position.distanceTo(ship.position) < 300) {
        e.fireCd = 2 + Math.random() * 2
        this.enemyFire(e, ship.position)
      }
    }

    // 敌方子弹
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i]
      b.life -= dt
      b.position.addScaledVector(b.velocity, dt)
      if (b.life <= 0) {
        this._removeEnemyBullet(b, i)
        continue
      }
      // 命中玩家
      if (b.position.distanceTo(ship.position) < 3.5) {
        onPlayerHit?.(b.damage)
        this._removeEnemyBullet(b, i)
      }
    }

    // 特效
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i]
      fx.life -= dt
      if (fx.type === 'explosion') {
        for (const m of fx.group.children) {
          m.position.addScaledVector(m.userData.vel, dt)
          m.material.opacity = Math.max(0, fx.life / 0.8)
        }
      }
      if (fx.life <= 0) {
        this.scene.remove(fx.group)
        this.effects.splice(i, 1)
      }
    }
  }

  _nearestEnemy(pos) {
    let best = null
    let bestD = Infinity
    for (const e of this.enemies) {
      if (e.dead) continue
      const d = pos.distanceTo(e.position)
      if (d < bestD) { bestD = d; best = e }
    }
    return best
  }

  _killEnemy(i) {
    const e = this.enemies[i]
    if (e.mesh) {
      this.spawnExplosion(e.position.clone(), e.def.color, e.def.size / 2)
      this.scene.remove(e.mesh)
    }
    this.enemies.splice(i, 1)
  }

  _removeBullet(b, i) {
    this.scene.remove(b.mesh)
    this.playerBullets.splice(i, 1)
  }

  _removeEnemyBullet(b, i) {
    this.scene.remove(b.mesh)
    this.enemyBullets.splice(i, 1)
  }

  clearAll() {
    for (const e of this.enemies) if (e.mesh) this.scene.remove(e.mesh)
    for (const b of this.playerBullets) this.scene.remove(b.mesh)
    for (const b of this.enemyBullets) this.scene.remove(b.mesh)
    for (const fx of this.effects) this.scene.remove(fx.group)
    this.enemies = []
    this.playerBullets = []
    this.enemyBullets = []
    this.effects = []
  }
}

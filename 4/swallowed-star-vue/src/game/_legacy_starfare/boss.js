/**
 * 星骸远航 · BOSS 系统（星兽之王）
 * ============================================================
 * 远古星兽之王：体型巨大，三个阶段
 *   阶段1：冲撞攻击 / 尾部横扫 / 召唤小怪
 *   阶段2：开启护甲 / 能量弹幕 / 俯冲撕咬
 *   阶段3：能量爆发 / 引力漩涡 / 胸口弱点
 * ============================================================
 */
import * as THREE from 'three'

export class BossSystem {
  constructor(scene, combat) {
    this.scene = scene
    this.combat = combat
    this.boss = null
    this.phase = 1
    this.attackCd = 0
    this.active = false
  }

  // 创建 BOSS
  spawn(position) {
    // 主体：巨大球体 + 触手/角
    const group = new THREE.Group()

    const bodyGeo = new THREE.SphereGeometry(14, 32, 32)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x442266,
      metalness: 0.4,
      roughness: 0.5,
      emissive: 0x331155,
      emissiveIntensity: 0.5
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    group.add(body)

    // 触手（环绕的锥形）
    this.tentacles = []
    for (let i = 0; i < 10; i++) {
      const tGeo = new THREE.ConeGeometry(2, 14, 8)
      const tMat = new THREE.MeshStandardMaterial({ color: 0x553377, emissive: 0x221133, emissiveIntensity: 0.4 })
      const t = new THREE.Mesh(tGeo, tMat)
      const ang = (i / 10) * Math.PI * 2
      t.position.set(Math.cos(ang) * 14, Math.sin(ang) * 8, 0)
      t.rotation.z = -Math.cos(ang) * 1.2
      t.rotation.x = Math.sin(ang) * 0.6
      group.add(t)
      this.tentacles.push(t)
    }

    // 胸口弱点（核心，第三阶段暴露）
    const coreGeo = new THREE.SphereGeometry(4, 16, 16)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff3344,
      emissive: 0xff2222,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.4
    })
    this.core = new THREE.Mesh(coreGeo, coreMat)
    this.core.position.set(0, 0, 10)
    group.add(this.core)

    // 眼睛（发光）
    const eyeGeo = new THREE.SphereGeometry(2.5, 12, 12)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    for (let i = 0; i < 4; i++) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat)
      const ang = (i / 4) * Math.PI * 2
      eye.position.set(Math.cos(ang) * 9, Math.sin(ang) * 7, 8)
      group.add(eye)
    }

    group.position.copy(position)
    this.scene.add(group)

    this.boss = {
      group,
      body,
      hp: 1200,
      maxHp: 1200,
      position: group.position,
      velocity: new THREE.Vector3(),
      phase: 1,
      attackCd: 3,
      dead: false
    }
    this.active = true
    return this.boss
  }

  // 切换阶段
  _setPhase(p) {
    if (this.boss.phase === p) return
    this.boss.phase = p
    // 第三阶段：暴露胸口弱点
    if (p === 3) {
      this.core.material.opacity = 1.0
      this.core.material.emissiveIntensity = 4.0
    }
  }

  // 每帧更新
  update(dt, ship, onPlayerHit, onSummon) {
    if (!this.boss || this.boss.dead) return
    const b = this.boss

    // 阶段切换：血量阈值
    const ratio = b.hp / b.maxHp
    if (ratio < 0.33) this._setPhase(3)
    else if (ratio < 0.66) this._setPhase(2)

    // 追踪玩家（缓慢）
    const dir = ship.position.clone().sub(b.position).normalize()
    b.velocity.lerp(dir.clone().multiplyScalar(6), dt)
    b.position.addScaledVector(b.velocity, dt)

    // 身体旋转
    b.body.rotation.y += dt * 0.4
    b.body.rotation.x += dt * 0.2

    // 攻击行为
    b.attackCd -= dt
    if (b.attackCd <= 0) {
      this._attack(ship, onPlayerHit, onSummon)
      b.attackCd = b.phase === 1 ? 3.5 : b.phase === 2 ? 2.8 : 2.2
    }

    // 第三阶段：引力漩涡（把玩家拉向 BOSS）
    if (b.phase === 3) {
      const pull = ship.position.clone().sub(b.position).normalize().multiplyScalar(-4 * dt)
      ship.position.add(pull)
    }
  }

  _attack(ship, onPlayerHit, onSummon) {
    const b = this.boss
    switch (b.phase) {
      case 1: {
        // 冲撞：快速靠近玩家
        const dir = ship.position.clone().sub(b.position).normalize()
        b.velocity.addScaledVector(dir, 30)
        // 召唤小怪
        onSummon?.()
        break
      }
      case 2: {
        // 能量弹幕：扇形多发
        const base = ship.position.clone().sub(b.position).normalize()
        for (let i = -3; i <= 3; i++) {
          const d = base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.15)
          this._fireOrb(d)
        }
        break
      }
      case 3: {
        // 能量爆发：全周弹幕 + 引力漩涡（已在 update 中处理）
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2
          const d = new THREE.Vector3(Math.cos(ang), Math.sin(ang) * 0.5, Math.sin(ang))
          this._fireOrb(d)
        }
        break
      }
    }
  }

  _fireOrb(dir) {
    const geo = new THREE.SphereGeometry(1.2, 8, 8)
    const mat = new THREE.MeshBasicMaterial({ color: 0xcc44ff })
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(this.boss.position)
    this.scene.add(m)
    this.combat.enemyBullets.push({
      mesh: m,
      position: m.position,
      velocity: dir.multiplyScalar(60),
      damage: 15,
      life: 5.0
    })
  }

  // BOSS 受伤
  takeDamage(amount) {
    if (!this.boss || this.boss.dead) return false
    this.boss.hp -= amount
    if (this.boss.hp <= 0) {
      this.boss.dead = true
      this.combat.spawnExplosion(this.boss.position.clone(), 0xcc44ff, 3)
      this.scene.remove(this.boss.group)
      this.active = false
      return true // 已击杀
    }
    return false
  }

  dispose() {
    if (this.boss?.group) this.scene.remove(this.boss.group)
    this.boss = null
    this.active = false
  }
}

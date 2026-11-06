/**
 * 星骸远航 · 关卡数据定义
 * ============================================================
 * 8 个战役关卡，数据驱动。每个关卡定义：
 *   - 名称 / 风格（场景配色）
 *   - 敌人类型与数量
 *   - 通关目标
 *   - 通关奖励（解锁武器/技能/升级）
 * ============================================================
 */

// 敌人类型定义
export const ENEMY_TYPES = {
  // 第1关
  miningDrone: { name: '采矿无人机', hp: 20, speed: 12, size: 1.6, color: 0x8899bb, score: 10 },
  starBeastCub: { name: '星兽幼体', hp: 30, speed: 15, size: 2.2, color: 0xaa66cc, score: 20 },
  // 第3关
  scout: { name: '侦察机', hp: 25, speed: 18, size: 1.8, color: 0x7799dd, score: 15 },
  missileBoat: { name: '导弹艇', hp: 50, speed: 10, size: 2.6, color: 0xcc8844, score: 30 },
  autoTurret: { name: '自动炮台', hp: 60, speed: 0, size: 2.8, color: 0x888899, score: 25 },
  heavyFrigate: { name: '重型护卫舰', hp: 160, speed: 6, size: 5.0, color: 0x556688, score: 80 },
  // 第4关
  clawBeast: { name: '利爪异星兽', hp: 70, speed: 22, size: 3.0, color: 0x9966cc, score: 40 },
  acidBug: { name: '喷酸虫族', hp: 45, speed: 14, size: 2.0, color: 0x66cc66, score: 30 },
  armoredBeast: { name: '巨型装甲星兽', hp: 220, speed: 8, size: 6.0, color: 0x8855aa, score: 120 },
  // 第6关
  ancientMech: { name: '古代机甲', hp: 90, speed: 12, size: 3.4, color: 0xaaa888, score: 50 },
  suicideDrone: { name: '自爆无人机', hp: 15, speed: 28, size: 1.4, color: 0xff6644, score: 20 },
  heavyTurret: { name: '重型防御炮台', hp: 140, speed: 0, size: 4.0, color: 0x777788, score: 70 },
  // 第7关
  fastScout: { name: '高速侦察机', hp: 30, speed: 30, size: 1.7, color: 0x66aadd, score: 20 },
  heavyMech: { name: '重装机甲', hp: 200, speed: 8, size: 5.5, color: 0x997755, score: 100 },
  eliteHunter: { name: '精英猎杀者', hp: 320, speed: 16, size: 4.5, color: 0xcc3344, score: 200 }
}

// 关卡定义
export const LEVELS = [
  {
    id: 1,
    name: '陨石狩猎场',
    subtitle: '教学飞行战斗',
    desc: '学习飞行、射击与躲避陨石，穿越碎石带抵达跃迁点。',
    skyColor: 0x050a1e, // 深蓝宇宙
    enemies: [
      { type: 'miningDrone', count: 4 },
      { type: 'starBeastCub', count: 2 }
    ],
    objective: '击毁所有敌人并穿越陨石带，到达终点跃迁点',
    reward: { kind: 'weapon', name: '连发炮', desc: '解锁【连发炮】' }
  },
  {
    id: 2,
    name: '离子风暴区',
    subtitle: '高速躲避关',
    desc: '离子风暴周期性爆发，激光屏障横扫，考验飞行路线。',
    skyColor: 0x1a0a30, // 紫色离子云
    enemies: [],
    objective: '在风暴中存活，依次激活 3 个信标节点',
    reward: { kind: 'skill', name: '护盾充能', desc: '解锁【护盾充能】' }
  },
  {
    id: 3,
    name: '机械封锁线',
    subtitle: '空战闯关',
    desc: '巨型炮台与机械舰队封锁航道，摧毁防线打开要塞大门。',
    skyColor: 0x0a0a14,
    enemies: [
      { type: 'scout', count: 5 },
      { type: 'missileBoat', count: 3 },
      { type: 'autoTurret', count: 4 },
      { type: 'heavyFrigate', count: 1 }
    ],
    objective: '摧毁敌方防线，打开要塞大门',
    reward: { kind: 'weapon', name: '导弹发射器', desc: '解锁【导弹发射器】' }
  },
  {
    id: 4,
    name: '星兽峡谷',
    subtitle: '追踪猎杀关',
    desc: '巨大生物残骸与虫族巢穴，猎杀凶猛星兽，小心被包围。',
    skyColor: 0x0a1410,
    enemies: [
      { type: 'clawBeast', count: 4 },
      { type: 'acidBug', count: 5 },
      { type: 'armoredBeast', count: 1 }
    ],
    objective: '消灭区域内所有星兽',
    reward: { kind: 'weapon', name: '喷射近战', desc: '解锁【喷射近战】' }
  },
  {
    id: 5,
    name: '虚空虫洞',
    subtitle: '飞行解谜关',
    desc: '高速穿越收缩的虫洞，穿过连续能量环稳定通道。',
    skyColor: 0x080820,
    enemies: [],
    objective: '在虫洞崩塌前到达另一端',
    reward: { kind: 'upgrade', name: '速度提升', desc: '战机速度提升' }
  },
  {
    id: 6,
    name: '远古战舰残骸',
    subtitle: '战斗解谜关',
    desc: '清理守卫、修复能源、开启隔离门，抵达核心区域。',
    skyColor: 0x12100c,
    enemies: [
      { type: 'ancientMech', count: 3 },
      { type: 'suicideDrone', count: 5 },
      { type: 'heavyTurret', count: 2 }
    ],
    objective: '清理守卫并开启 3 个隔离门，到达核心区域',
    reward: { kind: 'skill', name: '能量护盾', desc: '解锁【能量护盾技能】' }
  },
  {
    id: 7,
    name: '猎手试炼场',
    subtitle: '精英战斗关',
    desc: '圆形竞技场内连续挑战四波精英敌人，完成全部试炼。',
    skyColor: 0x140a08,
    enemies: [
      { type: 'fastScout', count: 6 },
      { type: 'heavyMech', count: 2 },
      { type: 'armoredBeast', count: 2 },
      { type: 'eliteHunter', count: 1 }
    ],
    objective: '完成全部试炼，不被击毁',
    reward: { kind: 'skill', name: '终极爆发', desc: '解锁【终极爆发技能】' }
  },
  {
    id: 8,
    name: '星兽之王',
    subtitle: '最终 BOSS 关',
    desc: '远古星兽之王，体型巨大，三个阶段，攻击胸口弱点。',
    skyColor: 0x200610,
    enemies: [], // BOSS 单独处理
    boss: { name: '远古星兽之王', hp: 1200 },
    objective: '攻击弱点，击败星兽之王',
    reward: { kind: 'ending', name: '传说星猎', desc: '成为传说级星猎，解锁银河狩猎模式' }
  }
]

// 战机养成项定义
export const UPGRADES = [
  { id: 'attack', name: '攻击力', desc: '能量弹伤害提升', cost: 50, max: 5 },
  { id: 'speed', name: '飞行速度', desc: '闪避更灵活', cost: 40, max: 5 },
  { id: 'shield', name: '护盾上限', desc: '承受更多伤害', cost: 60, max: 5 },
  { id: 'missile', name: '导弹容量', desc: '增加导弹数量', cost: 55, max: 5 },
  { id: 'charge', name: '蓄力威力', desc: '狙击炮更强', cost: 65, max: 5 },
  { id: 'cooldown', name: '技能冷却', desc: '大招释放更频繁', cost: 70, max: 5 }
]

// 武器定义
export const WEAPONS = {
  machinegun: { name: '能量机枪', desc: '连续射击，适合清理小怪', type: 'rapid' },
  sniper: { name: '狙击炮', desc: '右键蓄力，单体高伤', type: 'charge' },
  missile: { name: '导弹', desc: '锁定敌人，追踪攻击', type: 'lockon' },
  scatter: { name: '散射炮', desc: '近距离扇形攻击', type: 'scatter' },
  burst: { name: '能量爆发', desc: '范围清场技能', type: 'aoe' }
}

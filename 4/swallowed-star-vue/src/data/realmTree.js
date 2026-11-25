/**
 * 武者境界体系阶梯数据（独立于「意识修炼」的念师 REALMS）
 * 从准武者 / 学徒级 → 行星 → 恒星 → 宇宙 → 域主 → 界主 → 不朽 → 尊者 → 宇宙之主 → 神王
 * power：战力指数（以学徒级九阶 = 1 为基准的相对倍数，用于刻度可视化）
 * lifespan：寿元（年），-1 表示理论永生
 */

// 大阶段分组：用于阶梯配色与分组导航
export const REALM_TIERS = [
  { key: 'mortal', label: '凡俗起步', en: 'MORTAL', color: '#8fa0c8', hint: '地球上的起点' },
  { key: 'planet', label: '行星 · 恒星', en: 'PLANETARY', color: '#66e0ff', hint: '走出母星' },
  { key: 'galaxy', label: '宇宙 · 域主 · 界主', en: 'GALACTIC', color: '#a97bff', hint: '纵横星海' },
  { key: 'immortal', label: '不朽 · 尊者', en: 'IMMORTAL', color: '#ffd479', hint: '寿命的门槛' },
  { key: 'god', label: '宇宙之主 · 神王', en: 'DIVINE', color: '#ff6b81', hint: '触及法则顶端' }
]

export const REALM_LADDER = [
  {
    id: 'warrior', name: '准武者 / 武者', en: 'WARRIOR', tier: 'mortal',
    power: 0.008, powerText: '约 1 / 125', life: 100, lifeText: '约 100 年',
    stage: '学徒级之前的门槛', gate: '体能测试达标，觉醒基本战斗本能',
    desc: '普通人的极限之上、真正修行之下。能通过武者考核的，已是人群中的极少数。',
    ability: ['体能超常', '基础格斗', '短距感知']
  },
  {
    id: 'apprentice', name: '学徒级', en: 'APPRENTICE', tier: 'mortal',
    power: 1, powerText: '基准 ×1', life: 150, lifeText: '约 150 年',
    stage: '九阶：一阶 → 九阶', gate: '精神力与身体同步精进，逐阶攀升',
    desc: '修行的第一道正门。九阶之差，拳力可相差数十倍——罗峰当年，就是从这里一步步走上来的。',
    ability: ['拳力数万公斤', '身法初成', '念力觉醒']
  },
  {
    id: 'planetary', name: '行星级', en: 'PLANETARY', tier: 'planet',
    power: 32, powerText: '×32', life: 1000, lifeText: '约 1,000 年',
    stage: '一至九阶', gate: '精神力、身体、真力三者合一，突破生命层次',
    desc: '一拳之威可撼动山岳，寿命以千年计。行星级在地球已是可用「国宝」形容的存在。',
    ability: ['拳力百万公斤级', '短距飞行', '寿命千年']
  },
  {
    id: 'stellar', name: '恒星级', en: 'STELLAR', tier: 'planet',
    power: 1000, powerText: '×1,000', life: 10000, lifeText: '约 1 万年',
    stage: '一至九阶', gate: '凝聚恒星能量核心，可独立于星球生存',
    desc: '以恒星为名，体内能量足以焚烧一片大地。恒星级是闯荡宇宙的「入门票」。',
    ability: ['恒星能量', '真空生存', '寿命万年']
  },
  {
    id: 'cosmic', name: '宇宙级', en: 'COSMIC', tier: 'galaxy',
    power: 32000, powerText: '×32,000', life: 100000, lifeText: '约 10 万年',
    stage: '一至九阶', gate: '领悟初步法则，意识可横跨星系',
    desc: '名副其实的「宇宙公民」。一念可跨越遥远星域，寻常舰队在他们面前形同纸糊。',
    ability: ['法则雏形', '星系级感知', '寿命十万载']
  },
  {
    id: 'dominator', name: '域主级', en: 'DOMINATOR', tier: 'galaxy',
    power: 1000000, powerText: '×100 万', life: 1000000, lifeText: '约 100 万年',
    stage: '一至九阶', gate: '开辟意识领域，领域内近乎无敌',
    desc: '掌控一片「域」，领域展开即是主场。域主在人类疆域中，已是一方诸侯。',
    ability: ['意识领域', '法则运用', '寿命百万年']
  },
  {
    id: 'boundary', name: '界主级', en: 'BOUNDARY LORD', tier: 'galaxy',
    power: 32000000, powerText: '×3,200 万', life: 10000000, lifeText: '约 1,000 万年',
    stage: '一至九阶', gate: '领域凝练至极，触摸不朽的门槛',
    desc: '一界之主。九阶界主距离不朽只差一线，无数强者穷尽一生，终究停在了这道门前。',
    ability: ['领域圆满', '法则大成', '寿命千万年']
  },
  {
    id: 'immortal', name: '不朽', en: 'IMMORTAL', tier: 'immortal',
    power: 1000000000, powerText: '×10 亿', life: -1, lifeText: '理论永生',
    stage: '普通 → 封侯 → 封王', gate: '凝练不朽神体，神体不灭则近乎不死',
    desc: '寿命的门槛被彻底跨过。封王不朽已能横渡宇宙海，是人类文明真正的核心战力。',
    ability: ['不朽神体', '神国传送', '近乎永生']
  },
  {
    id: 'admiral', name: '宇宙尊者', en: 'COSMIC ADMIRAL', tier: 'immortal',
    power: 100000000000, powerText: '×1,000 亿', life: -1, lifeText: '理论永生',
    stage: '普通 → 封王极限', gate: '神体蜕变，法则感悟达到尊者层次',
    desc: '宇宙尊者，一方霸主。放到任何星域，都是能让整片星空屏息的存在。',
    ability: ['尊者神体', '法则主导', '威压星海']
  },
  {
    id: 'overlord', name: '宇宙之主', en: 'UNIVERSE LORD', tier: 'god',
    power: 10000000000000, powerText: '×100 万亿', life: -1, lifeText: '与宇宙同寿',
    stage: '一至六阶', gate: '悟透一条完整法则，生命层次彻底跃迁',
    desc: '一念可生灭星系。罗峰在此境以一己之力改写战局，「宇宙之主」四字，重若千钧。',
    ability: ['完整法则', '一念生灭', '宇宙级权柄']
  },
  {
    id: 'godking', name: '神王', en: 'GOD KING', tier: 'god',
    power: 1000000000000000, powerText: '×10¹⁵', life: -1, lifeText: '超脱寿元',
    stage: '混沌主宰之上', gate: '集多条顶级法则于一身，执掌宇宙本源',
    desc: '站在已知体系的最顶端。于神王而言，宇宙不再是战场，而是可以执掌的棋盘。',
    ability: ['本源执掌', '法则汇聚', '超脱轮回']
  }
]

/** 战力指数取对数用于刻度条：log10(power) 归一到 0~1 */
export function powerLevel(r) {
  const v = Math.log10(Math.max(r.power, 0.001)) + 3 // 准武者 0.008 → 约 1.1
  const max = Math.log10(1e15) + 3 // 神王
  return Math.min(1, Math.max(0.03, v / max))
}

export default REALM_LADDER

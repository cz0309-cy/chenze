// 星域擂台 · 数值与文案配置
// 本文件只放数据，不含状态机逻辑（逻辑见 engine.js）。
// 规则详见 PROJECT_AI_NOTE.md 第 13 / 13.1 / 13.2 节。

// ---------- 对战模式 ----------
export const MODES = [
  { key: 'ai', label: '挑战星域强敌', desc: '人机对战 · 巨兽或人物 · 3 档难度' },
  { key: 'pvp', label: '双人对战', desc: '本机同屏 · 各方选一人 · 镜像对决' }
]

// ---------- 4 名出战者（取自 lore.js 人物档案，数值由能力条折算）----------
// art = 秘法特效；tier 用不到（玩家修为来自 localStorage），此处仅展示定位
export const FIGHTERS = [
  { id: 'luofeng', name: '罗峰', en: 'LUO FENG', glyph: '锋', color: '#ffd479',
    art: { name: '血海秘法', effect: 'drain' },
    desc: '精神念师 · 意志如铁', quote: '认定的事，哪怕对手是整个宇宙，也会一头撞上去。' },
  { id: 'leishen', name: '雷神', en: 'THOR', glyph: '雷', color: '#66e0ff',
    art: { name: '雷狱领域', effect: 'pierce' },
    desc: '雷电法则 · 攻势如雷', quote: '雷霆所至，万物皆寂。' },
  { id: 'xuxin', name: '徐欣', en: 'XU XIN', glyph: '欣', color: '#b98cff',
    art: { name: '生命回响', effect: 'heal' },
    desc: '医者之心 · 以柔克刚', quote: '你去打你的宇宙，我守着我们的家。' },
  { id: 'babata', name: '巴巴塔', en: 'BABATA', glyph: '巴', color: '#7dffb0',
    art: { name: '精神侵蚀', effect: 'drainMp' },
    desc: '智能生命 · 战术大师', quote: '主人，我建议你冷静——不过你从来没听过。' }
]

// ---------- 4 名对手（取自文明图鉴敌对势力）----------
// tier = 境界阶（3–6），对手修为 = 10^tier × 难度 pow
export const FOES = [
  { id: 'goldhorn', name: '金角巨兽', en: 'GOLD-HORNED BEAST', glyph: '角', color: '#ff8a5c',
    tier: 4, art: { name: '巨兽撕咬', effect: 'drain' },
    desc: '星空巨兽联盟 · 吞噬本源', quote: '在绝对的体积面前，技巧毫无意义。' },
  { id: 'hive', name: '母巢意志', en: 'HIVE MIND', glyph: '巢', color: '#c96bff',
    tier: 5, art: { name: '虫群侵蚀', effect: 'drainMp' },
    desc: '虫族 · 亿万为一', quote: '我们从不害怕死亡，因为个体从未存在。' },
  { id: 'annihilator', name: '湮灭者', en: 'ANNIHILATOR', glyph: '灭', color: '#66e0ff',
    tier: 6, art: { name: '湮灭射线', effect: 'pierce' },
    desc: '机械族 · 冷酷的法则', quote: '计算完毕。目标，清除。' },
  { id: 'nameless', name: '未名者', en: 'THE NAMELESS', glyph: '谜', color: '#ff6b8a',
    tier: 3, art: { name: '虚空低语', effect: 'heal' },
    desc: '幽暗宇宙 · 不可名状', quote: '你看见我的时候，已经太迟了。' }
]

// ---------- 3 档难度 ----------
// tierAdj：对手境界阶 ±1；pow：修为倍率
export const DIFFICULTY = [
  { key: 'normal', label: '寻常', tierAdj: -1, pow: 0.85, reward: 1500,
    desc: '对手境界 -1，修为 ×0.85' },
  { key: 'hard', label: '险境', tierAdj: 0, pow: 1, reward: 2400,
    desc: '对手境界不变，修为 ×1' },
  { key: 'abyss', label: '深渊', tierAdj: 1, pow: 1.15, reward: 3600,
    desc: '对手境界 +1，修为 ×1.15' }
]

// ---------- 4 个指令 ----------
export const ACTIONS = [
  { key: 'attack', label: '普攻', icon: '⚔', desc: '标准一击，无消耗' },
  { key: 'guard', label: '护体', icon: '🛡', desc: '本回合减伤 60%，回念 12' },
  { key: 'focus', label: '凝神', icon: '✨', desc: '回念 30，但本回合多受 20% 伤害' },
  { key: 'art', label: '秘法', icon: '🔥', desc: '耗念 45，倍率 ×2，附特效' }
]

// ---------- 公式常量 ----------
export const RULES = {
  attackRatio: 0.18,       // 攻击 = 血条 × 该比例 × (1 + 境界 × 0.12)
  realmAtkBonus: 0.12,
  suppressionPerTier: 0.08,// 境界压制：每差一境 ±8%
  defenseRatio: 0.03,      // 防御减伤：境界阶 × 3%
  logMin: 0,               // 修为 1（=1万）→ 血条 20
  logMax: 6,               // 修为 1e6 → 血条 140
  hpMin: 20,
  hpMax: 140,
  critBase: 0.08,          // 暴击率 = 0.08 + 速度 × 0.004，上限 0.22
  critPerSpeed: 0.004,
  critCap: 0.22,
  critMul: 1.6,
  dmgJitter: [0.9, 1.1],   // 伤害浮动
  guardReduction: 0.6,
  guardMp: 12,
  focusMp: 30,
  focusVuln: 0.2,
  artMp: 45,
  artMul: 2,
  naturalMp: 6,            // 每回合末自然回念
  mpMax: 100,
  loseReward: 200          // 失败补贴
}

// 玩家修为存档 key（与 Cultivate.vue 一致）
export const STORE_REALM = 'ss_cultivate_realm'
export const STORE_POWER = 'ss_cultivate_power'
export const STORE_RECORD = 'ss_battle_record'

// 秘法特效文案（结算飘字用）
export const EFFECT_LABEL = {
  drain: '吸血',
  pierce: '穿透 · 无视护体',
  heal: '治疗',
  drainMp: '吸念'
}

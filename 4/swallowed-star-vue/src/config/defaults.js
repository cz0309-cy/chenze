/**
 * 功能中心配置 · 默认值（同时是配置 schema 的单一来源）
 * ============================================================
 * 后端 feature_config 表(key=features)存一份 JSON 覆盖这里的默认值。
 * 后台「功能配置」页编辑的就是这份结构；前端 5 个功能页启动时读取后端配置，
 * 深合并到默认值上，实现「数值参数 / 内容数据 / 功能开关」后台可改、前台实时生效。
 *
 * 三级结构：
 *   switches  功能开关：控制页面是否启用、是否在前台导航显示
 *   numbers   数值参数：擂台公式系数/难度奖励、秘境关卡参数、战力折算系数
 *   content   内容数据：动画分季与视频、成员名录、擂台对手
 */

export const DEFAULT_FEATURES = {
  /* ---------------- 功能开关 ---------------- */
  switches: {
    treasure: { enabled: true, showInNav: true },   // 秘境寻宝
    battle: { enabled: true, showInNav: true },     // 星域擂台
    rank: { enabled: true, showInNav: true },       // 战力排行榜
    anime: { enabled: true, showInNav: true },      // 动画专区
    members: { enabled: true, showInNav: true }     // 成员名录
  },

  /* ---------------- 数值参数 ---------------- */
  numbers: {
    // 星域擂台对战公式（对应 game/battle/roster.js 的 RULES）
    battle: {
      attackRatio: 0.18,        // 攻击 = 血条 × 该比例 × (1 + 境界 × realmAtkBonus)
      realmAtkBonus: 0.12,
      suppressionPerTier: 0.08, // 境界压制：每差一境 ±8%
      defenseRatio: 0.03,       // 防御减伤：境界阶 ×3%
      hpMin: 20,                // 修为 1 万 → 血条 20
      hpMax: 140,               // 修为 100 万 → 血条 140
      critBase: 0.08,           // 暴击率 = critBase + 速度 × critPerSpeed，上限 critCap
      critPerSpeed: 0.004,
      critCap: 0.22,
      critMul: 1.6,             // 暴击伤害倍率
      guardReduction: 0.6,      // 护体减伤
      guardMp: 12,
      focusMp: 30,
      focusVuln: 0.2,
      artMp: 45,                // 秘法耗念
      artMul: 2,                // 秘法倍率
      naturalMp: 6,             // 每回合自然回念
      mpMax: 100,
      loseReward: 200,          // 失败补贴币
      rewards: { normal: 1500, hard: 2400, abyss: 3600 } // 三档难度胜利奖励
    },
    // 秘境寻宝关卡参数（对应 game/treasure/levels.js）
    treasure: {
      totalLevels: 6,
      maxPlayers: 4,
      minPlayers: 1,
      maxAttempt: 2,
      L1: { seconds: 10, needCount: 5 },
      L2: { targetStreak: 3, maxMiss: 3, window: 1200, gap: [1400, 2100] },
      L4: { beats: 8, beatMs: 1200, leadMs: 2000 },
      L5: { readSeconds: 8, blankSeconds: 5 }
    },
    // 战力排行榜折算系数（对应 PowerRank.vue 的 charScore/myScore）
    rank: {
      charScoreBase: 800,       // 无能力条人物的默认指数
      charScoreScale: 10,       // 能力条均值 × 该系数
      myBase: 400,              // 我的指数基础值
      myPerRealm: 70,           // 每层境界加成
      myPowerLogScale: 12       // 念力对数加成
    }
  },

  /* ---------------- 内容数据 ---------------- */
  content: {
    // 动画专区 · B站预设视频（可增删，前台点选即放映）
    animeVideos: [
      { bvid: 'BV1qV4y1P7kK', title: '614集 · 罗峰突破到宇宙之主、蜕变' },
      { bvid: 'BV1QY411Y7mN', title: '1.5亿氢弹 VS 金角巨兽' },
      { bvid: 'BV1ea4y1z77t', title: '罗峰收小弟，成为灯塔为地球开路' },
      { bvid: 'BV1N94y1h7ok', title: '燃爆全场主题曲 MV' },
      { bvid: 'BV1W24y1i7iy', title: '罗峰×中国青年说·航天新人' }
    ],
    // 成员名录 · 本地演示成员（后端无 /auth/users 时展示）
    members: [
      { id: 1001, username: 'chenze', nickname: '星河守护者', permission: 0, online: true, joinedAt: '2026-10-15' },
      { id: 1002, username: 'luofeng_fan', nickname: '罗峰的刀', permission: 1, online: true, joinedAt: '2026-11-02' },
      { id: 1003, username: 'star_walker', nickname: '星海旅人', permission: 1, online: false, joinedAt: '2026-11-08' },
      { id: 1004, username: 'babata_fan', nickname: '巴巴塔的铁粉', permission: 1, online: true, joinedAt: '2026-11-14' },
      { id: 1005, username: 'killing_field', nickname: '杀戮场主', permission: 1, online: false, joinedAt: '2026-11-19' }
    ]
  }
}

/** 深合并：用后端配置覆盖默认值（只覆盖出现的键，未出现的保留默认） */
export function deepMerge(base, override) {
  if (override === null || override === undefined) return base
  if (Array.isArray(override)) return override
  if (typeof override !== 'object') return override
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return override
  const out = { ...base }
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k])
  }
  return out
}

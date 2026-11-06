/**
 * 秘境寻宝 · 关卡规则定义
 * ============================================================
 * 这里只放「规则参数」与关卡元信息：
 *   秒数、节拍、需要记住几件、连续几次……
 *
 * 具体题目（物品 / 推理题 / 动作组合 / 短句 / 谜语）全部由
 * questionBank.js 在每次进入关卡时随机抽取，本文件不再保存固定题目。
 * 交互逻辑在 engine.js / 各关卡组件。
 * ============================================================
 */

export const TOTAL_LEVELS = 6
export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 1

// 每关允许失败次数：第一次失败可重试，第二次失败退回上一关
export const MAX_ATTEMPT = 2

/* ---------------- 第 1 关：眼力观察 ---------------- */
export const L1 = {
  seconds: 10, // 观察时间
  needCount: 5 // 需要记住几件（题库会再补 4 件干扰项）
}

/* ---------------- 第 2 关：反应挑战 ---------------- */
export const L2 = {
  targetStreak: 3, // 连续答对几次过关
  maxMiss: 3, // 累计几次失误判负
  window: 1200, // 每次口令的反应窗口（毫秒）
  gap: [1400, 2100] // 口令之间的随机停顿区间
}

/* ---------------- 第 3 关：逻辑小推理 ---------------- */
// 纯题库关，无固定参数，题目见 questionBank.js 的 L3_BANK

/* ---------------- 第 4 关：手脑配合 ---------------- */
export const L4 = {
  beats: 8, // 连续 8 拍
  beatMs: 1200, // 每拍时长（需留足「左手→右手」两下的时间）
  leadMs: 2000 // 开始前预备时间
  // 左右手具体动作由 questionBank.js 的 L4_COMBOS 随机抽取
}

/* ---------------- 第 5 关：短句记忆 ---------------- */
export const L5 = {
  readSeconds: 8, // 记忆时间
  blankSeconds: 5 // 停顿遮蔽时间
  // 句子与词块由 questionBank.js 的 L5_BANK 随机抽取
}

/* ---------------- 第 6 关：谜题闯关 ---------------- */
// 纯题库关，无固定参数，题目见 questionBank.js 的 L6_BANK

/* ---------------- 关卡元信息 ---------------- */
export const LEVELS = [
  {
    id: 1,
    key: 'observe',
    name: '眼力观察',
    icon: '👁️',
    tag: 'OBSERVE',
    rule: '看一组物品 10 秒，遮住后说出全部 5 个，漏一个就失败。'
  },
  {
    id: 2,
    key: 'reaction',
    name: '反应挑战',
    icon: '🚦',
    tag: 'REACTION',
    rule: '喊绿灯才能快速拍手，喊红灯必须不动，连续 3 次不做错过关。'
  },
  {
    id: 3,
    key: 'logic',
    name: '逻辑小推理',
    icon: '🧠',
    tag: 'LOGIC',
    rule: '答对推理题即可过关，答错这一轮就失败。'
  },
  {
    id: 4,
    key: 'rhythm',
    name: '手脑配合',
    icon: '🤹',
    tag: 'RHYTHM',
    rule: '左手先、右手后，连续 8 拍动作不乱、不搞反。'
  },
  {
    id: 5,
    key: 'memory',
    name: '短句记忆',
    icon: '📜',
    tag: 'MEMORY',
    rule: '记住一句话，停顿 5 秒后完整复述，错一个字都算失败。'
  },
  {
    id: 6,
    key: 'riddle',
    name: '谜题闯关',
    icon: '🔮',
    tag: 'RIDDLE',
    rule: '猜出谜底，通关即可拿到秘境宝藏。'
  }
]

export function levelOf(id) {
  return LEVELS[Math.min(Math.max(id, 1), TOTAL_LEVELS) - 1]
}

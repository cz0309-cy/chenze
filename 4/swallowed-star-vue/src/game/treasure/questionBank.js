/**
 * 秘境寻宝 · 随机题库
 * ============================================================
 * 只负责「题目内容」的随机抽取，不改动任何关卡玩法与判定规则。
 * 规则常量（秒数、节拍、次数）仍在 levels.js。
 *
 * 每次关卡组件重建（进关 / 重试 / 退回再进）都会重新抽一次，
 * 所以同一关连着玩也不会撞到同一道题。
 * ============================================================
 */
import { L1, L4, L5 } from './levels.js'

/* ============================================================
 * 第 1 关 · 眼力观察
 * 一个 50 件物品的池子，每次抽 5 件要记的 + 4 件干扰项
 * ============================================================ */
export const L1_POOL = [
  { name: '芒果', icon: '🥭' },
  { name: '钢笔', icon: '🖊️' },
  { name: '雨伞', icon: '☂️' },
  { name: '闹钟', icon: '⏰' },
  { name: '星星', icon: '⭐' },
  { name: '橡皮', icon: '🧽' },
  { name: '钥匙', icon: '🔑' },
  { name: '气球', icon: '🎈' },
  { name: '月亮', icon: '🌙' },
  { name: '苹果', icon: '🍎' },
  { name: '香蕉', icon: '🍌' },
  { name: '西瓜', icon: '🍉' },
  { name: '葡萄', icon: '🍇' },
  { name: '草莓', icon: '🍓' },
  { name: '柠檬', icon: '🍋' },
  { name: '面包', icon: '🍞' },
  { name: '蛋糕', icon: '🍰' },
  { name: '牛奶', icon: '🥛' },
  { name: '咖啡', icon: '☕' },
  { name: '冰淇淋', icon: '🍦' },
  { name: '篮球', icon: '🏀' },
  { name: '足球', icon: '⚽' },
  { name: '羽毛球', icon: '🏸' },
  { name: '乒乓球', icon: '🏓' },
  { name: '书包', icon: '🎒' },
  { name: '铅笔', icon: '✏️' },
  { name: '尺子', icon: '📏' },
  { name: '剪刀', icon: '✂️' },
  { name: '吉他', icon: '🎸' },
  { name: '喇叭', icon: '📯' },
  { name: '耳机', icon: '🎧' },
  { name: '相机', icon: '📷' },
  { name: '电话', icon: '☎️' },
  { name: '手表', icon: '⌚' },
  { name: '手电', icon: '🔦' },
  { name: '蜡烛', icon: '🕯️' },
  { name: '灯泡', icon: '💡' },
  { name: '火车', icon: '🚂' },
  { name: '飞机', icon: '✈️' },
  { name: '自行车', icon: '🚲' },
  { name: '汽车', icon: '🚗' },
  { name: '轮船', icon: '🚢' },
  { name: '花朵', icon: '🌸' },
  { name: '大树', icon: '🌳' },
  { name: '白云', icon: '☁️' },
  { name: '火焰', icon: '🔥' },
  { name: '雪花', icon: '❄️' },
  { name: '太阳', icon: '☀️' },
  { name: '彩虹', icon: '🌈' },
  { name: '贝壳', icon: '🐚' }
]

const L1_DECOY_COUNT = 4

export function drawL1() {
  // 极低概率会抽到与上一次完全相同的 9 件，撞了就重抽
  let picked = shuffle(L1_POOL).slice(0, L1.needCount + L1_DECOY_COUNT)
  let key = picked.map((it) => it.name).sort().join(',')
  for (let guard = 0; guard < 4 && key === lastL1Key; guard += 1) {
    picked = shuffle(L1_POOL).slice(0, L1.needCount + L1_DECOY_COUNT)
    key = picked.map((it) => it.name).sort().join(',')
  }
  lastL1Key = key

  const targets = picked.slice(0, L1.needCount)
  const decoys = picked.slice(L1.needCount)

  const icons = {}
  picked.forEach((it) => {
    icons[it.name] = it.icon
  })

  return {
    seconds: L1.seconds,
    needCount: L1.needCount,
    words: targets.map((it) => it.name),
    decoys: decoys.map((it) => it.name),
    icons
  }
}

/* ============================================================
 * 第 3 关 · 逻辑小推理
 * 每题都是唯一解，答案由选项随机排序后呈现
 * ============================================================ */
export const L3_BANK = [
  {
    question: '小红比小明高，小明比小亮高，请问谁最矮？',
    options: ['小红', '小明', '小亮'],
    answer: '小亮',
    explain: '小红 > 小明 > 小亮，所以最矮的是小亮。'
  },
  {
    question: '甲箱比乙箱重，丙箱比甲箱重，请问哪一箱最重？',
    options: ['甲箱', '乙箱', '丙箱'],
    answer: '丙箱',
    explain: '丙 > 甲 > 乙，最重的是丙箱。'
  },
  {
    question: '小刚跑得比小林快，小林跑得比小方快，请问谁跑得最慢？',
    options: ['小刚', '小林', '小方'],
    answer: '小方',
    explain: '小刚 > 小林 > 小方，最慢的是小方。'
  },
  {
    question: '猫比狗轻，狗比马轻，请问谁最重？',
    options: ['猫', '狗', '马'],
    answer: '马',
    explain: '马 > 狗 > 猫，最重的是马。'
  },
  {
    question: 'A 书比 B 书厚，C 书比 A 书厚，D 书比 C 书厚，请问哪本书最厚？',
    options: ['A 书', 'B 书', 'C 书', 'D 书'],
    answer: 'D 书',
    explain: 'D > C > A > B，最厚的是 D 书。'
  },
  {
    question: '小美比小云大，小云比小晴大，请问谁最小？',
    options: ['小美', '小云', '小晴'],
    answer: '小晴',
    explain: '小美 > 小云 > 小晴，最小的是小晴。'
  },
  {
    question: '苹果比香蕉便宜，梨比苹果便宜，葡萄比香蕉贵，请问哪种水果最贵？',
    options: ['苹果', '香蕉', '梨', '葡萄'],
    answer: '葡萄',
    explain: '价格由低到高是 梨 < 苹果 < 香蕉 < 葡萄，最贵的是葡萄。'
  },
  {
    question: '甲、乙、丙三人排队，丙排在最后，乙排在甲前面，请问谁排在最前面？',
    options: ['甲', '乙', '丙'],
    answer: '乙',
    explain: '丙在最后，乙又在甲前面，所以顺序是 乙 → 甲 → 丙。'
  },
  {
    question: '三人比身高：小林比小周矮，小周比小吴矮，请问谁最高？',
    options: ['小林', '小周', '小吴'],
    answer: '小吴',
    explain: '小吴 > 小周 > 小林，最高的是小吴。'
  },
  {
    question: '四个盒子称重：红盒比蓝盒轻，蓝盒比黄盒轻，绿盒比黄盒重，请问哪个最重？',
    options: ['红盒', '蓝盒', '黄盒', '绿盒'],
    answer: '绿盒',
    explain: '红 < 蓝 < 黄，而绿比黄还重，所以最重的是绿盒。'
  }
]

export function drawL3() {
  const q = pickFrom('L3', L3_BANK)
  return {
    question: q.question,
    options: shuffle(q.options),
    answer: q.answer,
    explain: q.explain
  }
}

/* ============================================================
 * 第 4 关 · 手脑配合
 * 玩法固定「左先右后」，但每次抽不同的动作组合
 * ============================================================ */
export const L4_COMBOS = [
  { left: '拍大腿', right: '摸鼻子' },
  { left: '拍桌子', right: '摸耳朵' },
  { left: '拍肩膀', right: '摸下巴' },
  { left: '掐腰', right: '摸头顶' },
  { left: '拍大腿', right: '捏耳垂' },
  { left: '摸膝盖', right: '拍肩膀' }
]

export function drawL4() {
  const combo = pickFrom('L4', L4_COMBOS)
  return {
    beats: L4.beats,
    beatMs: L4.beatMs,
    leadMs: L4.leadMs,
    leftAct: combo.left,
    rightAct: combo.right
  }
}

/* ============================================================
 * 第 5 关 · 短句记忆
 * segments 直接拼成原句，词块由 segments 去标点得来，
 * 保证「展示的句子」和「正确拼法」永远一致。
 * ============================================================ */
export const L5_BANK = [
  {
    segments: ['傍晚', '风', '轻轻', '吹过', '山坡，', '蝴蝶', '跟着', '晚霞', '飞。'],
    decoys: ['晨雾', '落雪']
  },
  {
    segments: ['清晨', '露水', '打湿', '石阶，', '古井', '苔痕', '泛着', '青光。'],
    decoys: ['黄昏', '铁栏']
  },
  {
    segments: ['灯笼', '一盏盏', '亮起来，', '把青石板路', '照得', '暖黄。'],
    decoys: ['蜡烛', '冷白']
  },
  {
    segments: ['夜里', '山雾', '漫过', '门槛，', '守门人', '提灯', '走进', '旧院。'],
    decoys: ['渔船', '柴门']
  },
  {
    segments: ['雨后', '泥土', '带着', '青草味，', '蜗牛', '沿着', '墙根', '慢慢', '爬。'],
    decoys: ['雪后', '蚂蚁']
  },
  {
    segments: ['木门', '吱呀', '一声', '开了，', '院子', '飘出', '桂花', '味道。'],
    decoys: ['铁窗', '荷香']
  },
  {
    segments: ['桌上', '茶已', '凉了，', '窗外', '月光', '挪到', '台阶。'],
    decoys: ['酒杯', '灯影']
  },
  {
    segments: ['小舟', '停在', '芦苇荡里，', '桨上', '挂着', '亮晶晶', '水珠。'],
    decoys: ['木筏', '石桥']
  },
  {
    segments: ['屋檐', '滴着', '雨水，', '青苔', '顺着', '砖缝', '爬上', '墙。'],
    decoys: ['瓦片', '藤蔓']
  },
  {
    segments: ['山路', '越走', '越窄，', '松针', '铺了', '厚厚', '一层。'],
    decoys: ['竹叶', '碎石']
  }
]

const PUNCT = /[，。！？、；：""''（）《》【】…—\s]/g

export function drawL5() {
  const q = pickFrom('L5', L5_BANK)
  const tokens = q.segments.map((s) => s.replace(PUNCT, '')).filter(Boolean)
  const decoys = q.decoys.filter((d) => !tokens.includes(d))

  return {
    readSeconds: L5.readSeconds,
    blankSeconds: L5.blankSeconds,
    tokens,
    decoys,
    display: q.segments.join(''),
    target: tokens.join('')
  }
}

/* ============================================================
 * 第 6 关 · 谜题闯关
 * ============================================================ */
export const L6_BANK = [
  {
    question: '有门没有锁，有顶没有底，夜间才用它，白天挂墙壁。（打一物品）',
    options: ['蚊帐', '窗帘', '雨伞', '灯笼'],
    answer: '蚊帐',
    hints: [
      '提示一：它是一件「软」的东西，住在卧室里。',
      '提示二：夏天最需要它，能把你整个人罩起来。'
    ],
    explain: '蚊帐有门（开口）没有锁，有顶没有底，晚上挂起来用，白天收起来挂墙上。'
  },
  {
    question: '一个小姑娘，坐在水中央，身穿粉红衫，坐在绿船上。（打一植物）',
    options: ['荷花', '桃花', '菊花', '梅花'],
    answer: '荷花',
    hints: ['提示一：它长在水里。', '提示二：夏天开满池塘，叶子像大圆盘。'],
    explain: '荷花长在池塘水中央，花瓣粉红，荷叶就是托着它的绿船。'
  },
  {
    question: '兄弟七八个，围着柱子坐，大家一分家，衣服就扯破。（打一植物）',
    options: ['大蒜', '洋葱', '橘子', '石榴'],
    answer: '大蒜',
    hints: ['提示一：厨房里常见，味道很冲。', '提示二：一瓣一瓣抱在一起，外面包着薄皮。'],
    explain: '蒜瓣围着中间的蒜柱生长，掰开的时候外皮就会被撕破。'
  },
  {
    question: '有头没有颈，身上冷冰冰，有翅不能飞，无脚也能行。（打一动物）',
    options: ['鱼', '蛇', '乌龟', '企鹅'],
    answer: '鱼',
    hints: ['提示一：它住在水里。', '提示二：它的「翅膀」是用来游泳的。'],
    explain: '鱼有头无颈，体温随水温变化，鱼鳍不能飞却能让它游得很快。'
  },
  {
    question: '一座弯弯桥，架在半空中，雨后才会出现，太阳一照就没。（打一自然现象）',
    options: ['彩虹', '闪电', '云朵', '露水'],
    answer: '彩虹',
    hints: ['提示一：它由七种颜色排成。', '提示二：要同时有雨和阳光才看得到。'],
    explain: '彩虹是阳光穿过雨滴折射出来的，所以雨后初晴最容易见到。'
  },
  {
    question: '有时落在山腰，有时挂在树梢，有时像面圆镜，有时像把镰刀。（打一天体）',
    options: ['月亮', '太阳', '星星', '云'],
    answer: '月亮',
    hints: ['提示一：它自己不会发光。', '提示二：它的形状每天都在变。'],
    explain: '月亮绕地球转，每天位置不同，形状也有圆有缺，像圆镜也像镰刀。'
  },
  {
    question: '身穿黄衣裳，弯弯像月亮，兄弟排成行，个个甜又香。（打一水果）',
    options: ['香蕉', '芒果', '橘子', '柚子'],
    answer: '香蕉',
    hints: ['提示一：它是热带水果。', '提示二：要剥皮吃，果肉软软的。'],
    explain: '香蕉黄色、弯月形，一串串排成行，剥皮就能吃。'
  },
  {
    question: '身穿绿衣裳，肚里水汪汪，生的儿子多，个个黑脸膛。（打一水果）',
    options: ['西瓜', '冬瓜', '南瓜', '黄瓜'],
    answer: '西瓜',
    hints: ['提示一：夏天最解渴。', '提示二：切开是红瓤，里面藏着黑籽。'],
    explain: '西瓜绿皮、红瓤、水分足，籽是黑亮的。'
  },
  {
    question: '有厚也有薄，有字也有图，知识里面藏，越看越爱读。（打一物）',
    options: ['书', '报纸', '漫画', '海报'],
    answer: '书',
    hints: ['提示一：它可以放在书架上。', '提示二：要一页一页翻着读。'],
    explain: '书有厚有薄，字图兼备，里面装着知识。'
  },
  {
    question: '用手抓不起，用刀切不开，煮饭和洗衣，都要请它来。（打一物）',
    options: ['水', '空气', '风', '火'],
    answer: '水',
    hints: ['提示一：它没有固定形状。', '提示二：倒进什么容器，就是什么形状。'],
    explain: '水抓不住也切不断，做饭洗衣都离不开它。'
  }
]

export function drawL6() {
  const q = pickFrom('L6', L6_BANK)
  return {
    question: q.question,
    options: shuffle(q.options),
    answer: q.answer,
    hints: [...q.hints],
    explain: q.explain
  }
}

/* ---------------- 工具 ---------------- */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 记住每一类题上一次抽到的位置，下次撞到就顺移一格，保证连续两次不一样
const lastPick = new Map()
let lastL1Key = ''

function pickFrom(key, bank) {
  if (!bank.length) return null
  if (bank.length === 1) return bank[0]
  let i = Math.floor(Math.random() * bank.length)
  if (i === lastPick.get(key)) i = (i + 1) % bank.length
  lastPick.set(key, i)
  return bank[i]
}

/** 按关卡 id 抽题，供外部统一调用 */
export function drawQuestion(levelId) {
  switch (levelId) {
    case 1:
      return drawL1()
    case 3:
      return drawL3()
    case 4:
      return drawL4()
    case 5:
      return drawL5()
    case 6:
      return drawL6()
    default:
      return null
  }
}

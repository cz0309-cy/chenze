/**
 * 后台管理模块配置：与前台展示的四大功能一一对应。
 * 每个模块对应后端一个 CRUD 地址（/api/admin/lore/{key}）。
 * 字段类型：text / textarea / number / lines(字符串数组，一行一条) / json / select / switch / list(对象数组，仅境界秘法)
 * 字段 key 与前台 lore.js 的字段名保持一致，保存后前台立即生效。
 */

export const ADMIN_MODULES = [
  {
    key: 'civs',
    title: '文明图鉴',
    icon: '📖',
    subtitle: 'CIVILIZATION CODEX',
    desc: '维护文明编号、类型、立场、危险度与图鉴批注，前台「文明图鉴」页实时读取。',
    groups: [
      {
        key: 'civs',
        label: '文明',
        columns: [
          { key: 'code', label: '编号' },
          { key: 'name', label: '名称' },
          { key: 'type', label: '文明类型' },
          { key: 'level', label: '等级' },
          { key: 'statusText', label: '立场' },
          { key: 'danger', label: '危险度' }
        ],
        fields: [
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 C-010（前台以此为唯一标识，不可重复）' },
          { key: 'name', label: '名称', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'type', label: '文明类型', type: 'text', placeholder: '如 人类文明 / 异族文明 / 未知' },
          { key: 'level', label: '等级', type: 'text', placeholder: '如 Ⅷ · 疆域霸主' },
          {
            key: 'status',
            label: '立场标识',
            type: 'select',
            options: [
              { value: 'ally', label: 'ally · 盟友' },
              { value: 'neutral', label: 'neutral · 中立' },
              { value: 'hostile', label: 'hostile · 敌对' },
              { value: 'unknown', label: 'unknown · 未知' }
            ]
          },
          { key: 'statusText', label: '立场文案', type: 'text', placeholder: '如 盟友 / 中立 / 敌对' },
          { key: 'span', label: '疆域范围', type: 'text' },
          { key: 'danger', label: '危险度 1-5', type: 'number' },
          { key: 'description', label: '描述', type: 'textarea', full: true },
          { key: 'traits', label: '关键特征（每行一条）', type: 'lines', full: true },
          { key: 'relation', label: '与人类关系', type: 'textarea', full: true },
          { key: 'note', label: '图鉴批注', type: 'textarea', full: true }
        ],
        blank: () => ({ status: 'neutral', danger: 1, traits: [] })
      }
    ]
  },
  {
    key: 'goods',
    title: '奇物交易',
    icon: '🗡',
    subtitle: 'EXOTIC MERCHANDISE',
    desc: '维护货品编号、稀有度、价格、库存与热销标记，前台「奇物交易」页实时读取。',
    groups: [
      {
        key: 'goods',
        label: '货品',
        columns: [
          { key: 'code', label: '编号' },
          { key: 'glyph', label: '图标' },
          { key: 'name', label: '名称' },
          { key: 'cat', label: '分类' },
          { key: 'rarity', label: '稀有度' },
          { key: 'price', label: '价格' },
          { key: 'stock', label: '库存' },
          { key: 'hot', label: '热销' }
        ],
        fields: [
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 G-12（前台以此为唯一标识，不可重复）' },
          { key: 'name', label: '名称', type: 'text', required: true },
          { key: 'glyph', label: '图标 emoji', type: 'text', placeholder: '如 🗡' },
          { key: 'cat', label: '分类', type: 'text', placeholder: '兵器 / 传承 / 材料…' },
          {
            key: 'rarity',
            label: '稀有度',
            type: 'select',
            options: ['普通', '精良', '稀有', '史诗', '传说'].map((v) => ({ value: v, label: v }))
          },
          { key: 'price', label: '价格（留空=面议）', type: 'number', nullable: true },
          { key: 'unit', label: '单位', type: 'text', placeholder: '宇宙币 / 面议' },
          { key: 'seller', label: '卖家', type: 'text' },
          { key: 'stock', label: '库存', type: 'number' },
          { key: 'hot', label: '热销推荐', type: 'switch' },
          { key: 'description', label: '描述', type: 'textarea', full: true }
        ],
        blank: () => ({ unit: '宇宙币', stock: 0, hot: 0 })
      }
    ]
  },
  {
    key: 'realms',
    title: '意识修炼',
    icon: '🌀',
    subtitle: 'CONSCIOUS CULTIVATION',
    desc: '维护七境阶梯的精神力门槛、突破关卡、代价，以及每境可修习的秘法传承。',
    groups: [
      {
        key: 'realms',
        label: '境界',
        columns: [
          { key: 'code', label: '编号' },
          { key: 'name', label: '境界' },
          { key: 'minPower', label: '门槛(万)' },
          { key: 'gate', label: '突破关卡' },
          { key: 'arts', label: '秘法' }
        ],
        fields: [
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 awaken（前台以此为唯一标识，不可重复）' },
          { key: 'name', label: '境界名', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'minPower', label: '精神力门槛（万念力单位）', type: 'number' },
          { key: 'gate', label: '突破关卡描述', type: 'textarea', full: true },
          { key: 'powers', label: '境界能力（每行一条）', type: 'lines', full: true },
          {
            key: 'arts',
            label: '秘法传承（可增删，随境界一起保存）',
            type: 'list',
            full: true,
            itemFields: [
              { key: 'name', label: '秘法名', required: true },
              { key: 'type', label: '类型', placeholder: '如 法则 · 顶级' },
              { key: 'from', label: '来源' },
              { key: 'desc', label: '描述', wide: true },
              { key: 'risk', label: '风险', wide: true }
            ]
          },
          { key: 'cost', label: '代价', type: 'textarea', full: true },
          { key: 'description', label: '描述', type: 'textarea', full: true }
        ],
        blank: () => ({ minPower: 0, powers: [], arts: [] })
      }
    ]
  },
  {
    key: 'characters',
    title: '人物档案',
    icon: '👤',
    subtitle: 'CHARACTER ARCHIVE',
    desc: '维护人物头衔、境界、阵营，以及能力条、时间线、关系网等档案细节。',
    groups: [
      {
        key: 'characters',
        label: '人物',
        columns: [
          { key: 'code', label: '编号' },
          { key: 'glyph', label: '' },
          { key: 'name', label: '姓名' },
          { key: 'title', label: '头衔' },
          { key: 'realm', label: '境界' },
          { key: 'camp', label: '阵营' }
        ],
        fields: [
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 luofeng（前台以此为唯一标识，不可重复）' },
          { key: 'name', label: '姓名', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'title', label: '头衔', type: 'text' },
          { key: 'glyph', label: '头像字符', type: 'text', placeholder: '如 锋' },
          { key: 'realm', label: '境界', type: 'text' },
          { key: 'camp', label: '阵营', type: 'text' },
          { key: 'quote', label: '语录', type: 'textarea', full: true },
          { key: 'tags', label: '标签（每行一条）', type: 'lines', full: true },
          { key: 'ability', label: '能力（每行一条）', type: 'lines', full: true },
          { key: 'relations', label: '关系网（每行一条，如「徐欣 · 妻子」）', type: 'lines', full: true },
          { key: 'intro', label: '生平介绍（每行一段）', type: 'lines', full: true },
          {
            key: 'stats',
            label: '能力条 JSON（[{label,value}]，value 0-100）',
            type: 'json',
            full: true,
            placeholder: '[{ "label": "战斗实力", "value": 90 }]'
          },
          {
            key: 'timeline',
            label: '时间线 JSON（[{year,title,desc}]）',
            type: 'json',
            full: true,
            placeholder: '[{ "year": "地球", "title": "成名", "desc": "…"}]'
          }
        ],
        blank: () => ({ tags: [], ability: [], relations: [], intro: [], stats: [], timeline: [] })
      }
    ]
  }
]

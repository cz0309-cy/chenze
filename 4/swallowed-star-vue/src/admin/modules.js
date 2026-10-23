/**
 * 后台管理模块配置：
 * 每个模块可包含多个数据组（group），每组对应后端一个 CRUD module。
 * 字段类型：text / textarea / number / lines(字符串数组，一行一条) / json / select / switch
 */

export const ADMIN_MODULES = [
  {
    key: 'regions',
    title: '星海探索',
    icon: '🧭',
    groups: [
      {
        key: 'regions',
        label: '星域',
        columns: [
          { key: 'code', label: '标识' },
          { key: 'name', label: '名称' },
          { key: 'coord', label: '坐标' },
          { key: 'type', label: '类型' },
          { key: 'danger', label: '危险度' },
          { key: 'progress', label: '进度%' }
        ],
        fields: [
          { key: 'code', label: '标识 code', type: 'text', required: true, placeholder: '如 earth（对应前台 id）' },
          { key: 'name', label: '名称', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'coord', label: '坐标编号', type: 'text', placeholder: '如 α-001' },
          { key: 'danger', label: '危险度 1-5', type: 'number' },
          { key: 'type', label: '星域类型', type: 'text' },
          { key: 'faction', label: '掌控势力', type: 'text' },
          { key: 'progress', label: '探索进度 0-100', type: 'number' },
          { key: 'x', label: '星图 X', type: 'number' },
          { key: 'y', label: '星图 Y', type: 'number' },
          { key: 'resources', label: '资源（每行一条）', type: 'lines', full: true },
          { key: 'events', label: '星域事件（每行一条）', type: 'lines', full: true },
          { key: 'desc', label: '描述', type: 'textarea', full: true }
        ],
        blank: () => ({ danger: 1, progress: 0, x: 0, y: 0, resources: [], events: [] })
      }
    ]
  },
  {
    key: 'civs',
    title: '文明图鉴',
    icon: '📖',
    groups: [
      {
        key: 'civs',
        label: '文明',
        columns: [
          { key: 'code', label: '编号' },
          { key: 'name', label: '名称' },
          { key: 'type', label: '类型' },
          { key: 'level', label: '等级' },
          { key: 'statusText', label: '立场' },
          { key: 'danger', label: '危险度' }
        ],
        fields: [
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 C-010' },
          { key: 'name', label: '名称', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'type', label: '文明类型', type: 'text' },
          { key: 'level', label: '等级', type: 'text', placeholder: '如 Ⅷ · 疆域霸主' },
          {
            key: 'status',
            label: '立场',
            type: 'select',
            options: [
              { value: 'ally', label: 'ally · 盟友' },
              { value: 'neutral', label: 'neutral · 中立' },
              { value: 'hostile', label: 'hostile · 敌对' },
              { value: 'unknown', label: 'unknown · 未知' }
            ]
          },
          { key: 'statusText', label: '立场文案', type: 'text' },
          { key: 'span', label: '疆域范围', type: 'text' },
          { key: 'danger', label: '危险度 1-5', type: 'number' },
          { key: 'desc', label: '描述', type: 'textarea', full: true },
          { key: 'traits', label: '特征（每行一条）', type: 'lines', full: true },
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
          { key: 'code', label: '编号 code', type: 'text', required: true, placeholder: '如 G-12' },
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
          { key: 'desc', label: '描述', type: 'textarea', full: true }
        ],
        blank: () => ({ unit: '宇宙币', stock: 0, hot: 0 })
      }
    ]
  },
  {
    key: 'cultivate',
    title: '意识修炼',
    icon: '🌀',
    groups: [
      {
        key: 'realms',
        label: '境界阶梯',
        columns: [
          { key: 'code', label: '标识' },
          { key: 'name', label: '境界' },
          { key: 'min', label: '门槛(万)' },
          { key: 'gate', label: '突破关卡' }
        ],
        fields: [
          { key: 'code', label: '标识 code', type: 'text', required: true, placeholder: '如 awaken' },
          { key: 'name', label: '境界名', type: 'text', required: true },
          { key: 'en', label: '英文名', type: 'text' },
          { key: 'min', label: '精神力门槛（万念力单位）', type: 'number' },
          { key: 'gate', label: '突破关卡描述', type: 'textarea', full: true },
          { key: 'powers', label: '境界能力（每行一条）', type: 'lines', full: true },
          { key: 'cost', label: '代价', type: 'textarea', full: true },
          { key: 'desc', label: '描述', type: 'textarea', full: true }
        ],
        blank: () => ({ min: 0, powers: [] })
      },
      {
        key: 'arts',
        label: '秘法传承',
        columns: [
          { key: 'name', label: '秘法' },
          { key: 'type', label: '类型' },
          { key: 'from', label: '来源' }
        ],
        fields: [
          { key: 'name', label: '秘法名', type: 'text', required: true },
          { key: 'type', label: '类型', type: 'text', placeholder: '如 法则 · 顶级' },
          { key: 'from', label: '来源', type: 'text' },
          { key: 'desc', label: '描述', type: 'textarea', full: true },
          { key: 'risk', label: '风险', type: 'textarea', full: true }
        ],
        blank: () => ({})
      }
    ]
  },
  {
    key: 'characters',
    title: '人物档案',
    icon: '👤',
    groups: [
      {
        key: 'characters',
        label: '人物',
        columns: [
          { key: 'code', label: '标识' },
          { key: 'glyph', label: '' },
          { key: 'name', label: '姓名' },
          { key: 'title', label: '头衔' },
          { key: 'realm', label: '境界' },
          { key: 'camp', label: '阵营' }
        ],
        fields: [
          { key: 'code', label: '标识 code', type: 'text', required: true, placeholder: '如 luofeng' },
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

<template>
  <div class="cfg-wrap">
    <!-- 顶部操作栏 -->
    <div class="cfg-bar">
      <div class="cfg-bar-info">
        <b>功能中心配置</b>
        <span>修改数值参数、内容数据与功能开关，保存后前台刷新即生效</span>
      </div>
      <div class="cfg-bar-actions">
        <button type="button" class="btn ghost" @click="loadConfig">重新加载</button>
        <button type="button" class="btn ghost danger" @click="resetConfig">恢复默认</button>
        <button type="button" class="btn primary" :disabled="saving" @click="saveConfig">
          {{ saving ? '保存中…' : '保存配置' }}
        </button>
      </div>
    </div>
    <p v-if="msg" class="cfg-msg" :class="msgType">{{ msg }}</p>

    <!-- Tab 切换 -->
    <div class="cfg-tabs">
      <button v-for="t in tabs" :key="t.key" type="button"
        :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
    </div>

    <div v-if="loading" class="cfg-loading">加载配置中…</div>

    <template v-else>
      <!-- ============ 功能开关 ============ -->
      <section v-if="tab === 'switches'" class="cfg-panel">
        <p class="cfg-hint">关闭「启用」后该功能页禁止访问；关闭「导航显示」后从前台导航与首页入口隐藏，但仍可访问。</p>
        <div class="cfg-switch-list">
          <div v-for="(label, key) in FEATURE_LABELS" :key="key" class="cfg-switch-row">
            <div class="cfg-switch-name"><b>{{ label }}</b><code>/{{ key }}</code></div>
            <label class="cfg-toggle">
              <input type="checkbox" v-model="form.switches[key].enabled" />
              <span class="cfg-track"></span><em>启用</em>
            </label>
            <label class="cfg-toggle">
              <input type="checkbox" v-model="form.switches[key].showInNav" />
              <span class="cfg-track"></span><em>导航显示</em>
            </label>
          </div>
        </div>
      </section>

      <!-- ============ 数值参数 ============ -->
      <section v-else-if="tab === 'numbers'" class="cfg-panel">
        <p class="cfg-hint">数值改动会影响游戏平衡与展示，请谨慎填写。留空或非法值在保存时会回退为默认值。</p>

        <div class="cfg-group" v-for="g in NUMBER_GROUPS" :key="g.key">
          <h4>{{ g.title }} <small>{{ g.sub }}</small></h4>
          <div class="cfg-grid">
            <label v-for="f in g.fields" :key="f.path" class="cfg-field">
              <span>{{ f.label }}<code v-if="f.hint">{{ f.hint }}</code></span>
              <input type="number" :step="f.step || 'any'" :value="getPath(form.numbers, f.path)" @input="setPath(form.numbers, f.path, $event.target.value === '' ? '' : Number($event.target.value))" @change="sanitizePath(form.numbers, f.path, f.def)" />
            </label>
          </div>
          <!-- 擂台三档奖励单独一行 -->
          <div v-if="g.key === 'battle'" class="cfg-grid">
            <label v-for="d in DIFFS" :key="d" class="cfg-field">
              <span>{{ d }} 档胜利奖励</span>
              <input type="number" v-model="form.numbers.battle.rewards[d]" @change="sanitizeNumber(form.numbers.battle.rewards, d, 1000)" />
            </label>
          </div>
        </div>
      </section>

      <!-- ============ 内容数据 ============ -->
      <section v-else class="cfg-panel">
        <p class="cfg-hint">直接编辑 JSON 数组；保存前会校验格式。动画视频的 bvid 为 B 站视频号，成员名录为本地演示数据。</p>

        <div class="cfg-json-block">
          <div class="cfg-json-head"><h4>动画专区 · B站预设视频</h4><span>[{{ animeVideoCount }}] 项</span></div>
          <textarea v-model="animeVideosText" spellcheck="false" rows="10"></textarea>
        </div>

        <div class="cfg-json-block">
          <div class="cfg-json-head"><h4>成员名录 · 本地演示成员</h4><span>[{{ memberCount }}] 项</span></div>
          <textarea v-model="membersText" spellcheck="false" rows="12"></textarea>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchFeatureConfig, saveFeatureConfig, resetFeatureConfig } from '../../api/admin.js'
import { clearFeatureConfigCache } from '../../api/config.js'
import { DEFAULT_FEATURES } from '../../config/defaults.js'

const tabs = [
  { key: 'switches', label: '功能开关' },
  { key: 'numbers', label: '数值参数' },
  { key: 'content', label: '内容数据' }
]
const FEATURE_LABELS = {
  treasure: '秘境寻宝', battle: '星域擂台', rank: '战力排行榜',
  anime: '动画专区', members: '成员名录'
}
const DIFFS = ['normal', 'hard', 'abyss']

// 数值字段 schema：path 为 numbers 下的路径；def 为默认值（非法时回退）
const NUMBER_GROUPS = [
  {
    key: 'battle', title: '⚔️ 星域擂台', sub: '对战公式 / 回念 / 奖励',
    fields: [
      { path: 'battle.attackRatio', label: '攻击比例', def: 0.18, step: '0.01' },
      { path: 'battle.realmAtkBonus', label: '境界攻击加成', def: 0.12, step: '0.01' },
      { path: 'battle.suppressionPerTier', label: '境界压制/境', def: 0.08, step: '0.01' },
      { path: 'battle.defenseRatio', label: '防御减伤/境', def: 0.03, step: '0.01' },
      { path: 'battle.hpMin', label: '血条下限', def: 20, step: '1' },
      { path: 'battle.hpMax', label: '血条上限', def: 140, step: '1' },
      { path: 'battle.critBase', label: '暴击基础', def: 0.08, step: '0.01' },
      { path: 'battle.critPerSpeed', label: '暴击/速度', def: 0.004, step: '0.001' },
      { path: 'battle.critCap', label: '暴击上限', def: 0.22, step: '0.01' },
      { path: 'battle.critMul', label: '暴击倍率', def: 1.6, step: '0.1' },
      { path: 'battle.guardReduction', label: '护体减伤', def: 0.6, step: '0.05' },
      { path: 'battle.guardMp', label: '护体回念', def: 12, step: '1' },
      { path: 'battle.focusMp', label: '凝神回念', def: 30, step: '1' },
      { path: 'battle.focusVuln', label: '凝神易伤', def: 0.2, step: '0.05' },
      { path: 'battle.artMp', label: '秘法耗念', def: 45, step: '1' },
      { path: 'battle.artMul', label: '秘法倍率', def: 2, step: '0.1' },
      { path: 'battle.naturalMp', label: '每回合回念', def: 6, step: '1' },
      { path: 'battle.mpMax', label: '念力上限', def: 100, step: '1' },
      { path: 'battle.loseReward', label: '失败补贴', def: 200, step: '1' }
    ]
  },
  {
    key: 'treasure', title: '🗝️ 秘境寻宝', sub: '关卡难度参数',
    fields: [
      { path: 'treasure.L1.seconds', label: '第1关 · 观察秒数', def: 10, step: '1' },
      { path: 'treasure.L1.needCount', label: '第1关 · 记忆件数', def: 5, step: '1' },
      { path: 'treasure.L2.targetStreak', label: '第2关 · 连对次数', def: 3, step: '1' },
      { path: 'treasure.L2.maxMiss', label: '第2关 · 允许失误', def: 3, step: '1' },
      { path: 'treasure.L2.window', label: '第2关 · 反应窗口ms', def: 1200, step: '50' },
      { path: 'treasure.L4.beats', label: '第4关 · 拍数', def: 8, step: '1' },
      { path: 'treasure.L4.beatMs', label: '第4关 · 每拍ms', def: 1200, step: '50' },
      { path: 'treasure.L4.leadMs', label: '第4关 · 预备ms', def: 2000, step: '50' },
      { path: 'treasure.L5.readSeconds', label: '第5关 · 记忆秒数', def: 8, step: '1' },
      { path: 'treasure.L5.blankSeconds', label: '第5关 · 遮蔽秒数', def: 5, step: '1' }
    ]
  },
  {
    key: 'rank', title: '🏆 战力排行榜', sub: '指数折算系数',
    fields: [
      { path: 'rank.charScoreBase', label: '人物默认指数', def: 800, step: '1' },
      { path: 'rank.charScoreScale', label: '能力条倍率', def: 10, step: '1' },
      { path: 'rank.myBase', label: '我的基础值', def: 400, step: '1' },
      { path: 'rank.myPerRealm', label: '每层境界加成', def: 70, step: '1' },
      { path: 'rank.myPowerLogScale', label: '念力对数倍率', def: 12, step: '1' }
    ]
  }
]

// 配置表单（深拷贝默认值，避免污染默认对象）
function clone(o) { return JSON.parse(JSON.stringify(o)) }
const form = reactive(clone(DEFAULT_FEATURES))
const tab = ref('switches')
const loading = ref(true)
const saving = ref(false)
const msg = ref('')
const msgType = ref('ok')

const animeVideosText = ref('')
const membersText = ref('')
const animeVideoCount = computed(() => {
  try { return JSON.parse(animeVideosText.value).length } catch { return '?' }
})
const memberCount = computed(() => {
  try { return JSON.parse(membersText.value).length } catch { return '?' }
})

// 按点分路径取/设值（v-model 绑定）
function getPath(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
  return cur[parts[parts.length - 1]]
}
function setPath(obj, path, val) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
  cur[parts[parts.length - 1]] = val
}
// v-model 需要可写 computed：这里用一个代理对象技巧——直接对 input 用 :value + @input
// 为简化，getPath 返回的是响应式值，@change 再 sanitize；输入绑定用 getter/setter 方式在模板里改写。

function sanitizeNumber(obj, key, def) {
  const v = Number(obj[key])
  if (obj[key] === '' || !Number.isFinite(v)) { obj[key] = def; return }
  obj[key] = v
}
function sanitizePath(obj, path, def) {
  const parts = path.split('.')
  const key = parts[parts.length - 1]
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
  sanitizeNumber(cur, key, def)
}

function applyToForm(cfg) {
  if (!cfg || typeof cfg !== 'object') return
  // 深合并：后端配置覆盖默认值
  const merged = merge(clone(DEFAULT_FEATURES), cfg)
  Object.assign(form.switches, merged.switches || {})
  Object.assign(form.numbers, merged.numbers || {})
  Object.assign(form.content, merged.content || {})
  animeVideosText.value = JSON.stringify(form.content.animeVideos || [], null, 2)
  membersText.value = JSON.stringify(form.content.members || [], null, 2)
}
function merge(base, override) {
  if (override === null || override === undefined) return base
  if (Array.isArray(override) || typeof override !== 'object') return override
  const out = { ...base }
  for (const k of Object.keys(override)) out[k] = merge(base[k], override[k])
  return out
}

async function loadConfig() {
  loading.value = true
  msg.value = ''
  try {
    const res = await fetchFeatureConfig()
    applyToForm(res?.data)
  } catch (e) {
    showMsg('加载失败：' + e.message, 'err')
  } finally {
    loading.value = false
  }
}

function validateContent() {
  let videos, members
  try {
    videos = JSON.parse(animeVideosText.value)
    if (!Array.isArray(videos)) throw new Error('预设视频必须是数组')
  } catch (e) { showMsg('动画视频 JSON 格式错误：' + e.message, 'err'); return null }
  try {
    members = JSON.parse(membersText.value)
    if (!Array.isArray(members)) throw new Error('成员名录必须是数组')
  } catch (e) { showMsg('成员名录 JSON 格式错误：' + e.message, 'err'); return null }
  form.content.animeVideos = videos
  form.content.members = members
  return true
}

async function saveConfig() {
  if (!validateContent()) return
  saving.value = true
  msg.value = ''
  try {
    await saveFeatureConfig(JSON.parse(JSON.stringify(form)))
    clearFeatureConfigCache()
    showMsg('已保存。刷新前台页面即可看到新配置。', 'ok')
  } catch (e) {
    showMsg('保存失败：' + e.message, 'err')
  } finally {
    saving.value = false
  }
}

async function resetConfig() {
  if (!window.confirm('确定恢复默认配置？这会清除后台保存的所有修改。')) return
  try {
    await resetFeatureConfig()
    clearFeatureConfigCache()
    Object.assign(form, clone(DEFAULT_FEATURES))
    applyToForm(null)
    showMsg('已恢复默认配置。', 'ok')
  } catch (e) {
    showMsg('恢复失败：' + e.message, 'err')
  }
}

function showMsg(text, type) {
  msg.value = text
  msgType.value = type
}

onMounted(loadConfig)
</script>

<style scoped>
.cfg-wrap { max-width: 1000px; }
.cfg-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.cfg-bar-info { display: flex; flex-direction: column; gap: 4px; }
.cfg-bar-info b { font-size: 16px; color: var(--text); }
.cfg-bar-info span { font-size: 12px; color: var(--muted); }
.cfg-bar-actions { display: flex; gap: 8px; }
.btn { cursor: pointer; padding: 9px 16px; border-radius: 9px; font-size: 12px; transition: 0.2s; }
.btn.ghost { border: 1px solid var(--panel-line); background: transparent; color: var(--muted); }
.btn.ghost:hover { color: var(--text); border-color: var(--cyan); }
.btn.ghost.danger:hover { color: #ff6b8a; border-color: #ff6b8a; }
.btn.primary { border: 1px solid var(--gold); color: #1a1206; background: linear-gradient(180deg, #ffe6a8, var(--gold)); font-weight: 600; }
.btn.primary:hover { filter: brightness(1.08); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cfg-msg { margin: 0 0 12px; padding: 9px 14px; border-radius: 8px; font-size: 12px; }
.cfg-msg.ok { color: #7dffb0; background: rgba(125,255,176,.08); border: 1px solid rgba(125,255,176,.3); }
.cfg-msg.err { color: #ff8a5c; background: rgba(255,138,92,.08); border: 1px solid rgba(255,138,92,.3); }
.cfg-tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--panel-line); margin-bottom: 18px; }
.cfg-tabs button { background: none; border: none; color: var(--muted); padding: 10px 18px; font-size: 13px; cursor: pointer; border-bottom: 2px solid transparent; }
.cfg-tabs button.on { color: var(--gold); border-bottom-color: var(--gold); }
.cfg-loading { color: var(--muted); font-size: 13px; padding: 30px; text-align: center; }
.cfg-panel { animation: rise 0.4s ease-out both; }
.cfg-hint { font-size: 12px; color: var(--muted); line-height: 1.7; margin: 0 0 16px; }
.cfg-switch-list { display: flex; flex-direction: column; gap: 8px; }
.cfg-switch-row { display: flex; align-items: center; gap: 24px; padding: 14px 18px; border: 1px solid var(--panel-line); border-radius: 12px; background: rgba(10,16,38,.5); }
.cfg-switch-name { flex: 1; display: flex; align-items: baseline; gap: 10px; }
.cfg-switch-name b { font-size: 14px; }
.cfg-switch-name code { font-size: 11px; color: var(--muted); }
.cfg-toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.cfg-toggle input { display: none; }
.cfg-track { width: 38px; height: 20px; border-radius: 10px; background: rgba(255,255,255,.12); position: relative; transition: 0.2s; }
.cfg-track::after { content: ''; position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: 0.2s; }
.cfg-toggle input:checked + .cfg-track { background: var(--gold); }
.cfg-toggle input:checked + .cfg-track::after { left: 21px; }
.cfg-toggle em { font-style: normal; font-size: 12px; color: var(--muted); }
.cfg-group { margin-bottom: 24px; }
.cfg-group h4 { font-size: 14px; margin: 0 0 12px; color: var(--text); }
.cfg-group h4 small { font-size: 11px; color: var(--muted); margin-left: 8px; font-weight: 400; }
.cfg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; margin-bottom: 10px; }
.cfg-field { display: flex; flex-direction: column; gap: 5px; }
.cfg-field > span { display: flex; align-items: baseline; gap: 6px; font-size: 11.5px; color: var(--muted); }
.cfg-field code { font-size: 10px; color: var(--cyan); }
.cfg-field input { padding: 8px 10px; border-radius: 8px; border: 1px solid var(--panel-line); background: rgba(255,255,255,.03); color: var(--text); font-size: 13px; outline: none; }
.cfg-field input:focus { border-color: var(--cyan); }
.cfg-json-block { margin-bottom: 20px; }
.cfg-json-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.cfg-json-head h4 { font-size: 14px; margin: 0; }
.cfg-json-head span { font-size: 11px; color: var(--muted); }
.cfg-json-block textarea { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--panel-line); background: rgba(5,7,14,.7); color: #a8f0ff; font-family: Consolas, monospace; font-size: 12px; line-height: 1.5; outline: none; resize: vertical; }
.cfg-json-block textarea:focus { border-color: var(--cyan); }
</style>

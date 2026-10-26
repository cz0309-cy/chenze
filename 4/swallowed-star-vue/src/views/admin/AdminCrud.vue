<template>
  <div class="admin-crud">
    <!-- 多数据组切换（如：意识修炼 = 境界 + 秘法） -->
    <div v-if="mod.groups.length > 1" class="group-tabs">
      <button
        v-for="g in mod.groups"
        :key="g.key"
        class="group-tab"
        :class="{ active: group.key === g.key }"
        @click="switchGroup(g)"
      >
        {{ g.label }}
      </button>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <input
          v-model="keyword"
          type="text"
          :placeholder="`搜索${group.label}…（回车搜索）`"
          @keyup.enter="reload"
        />
        <button class="btn ghost" @click="reload">搜索</button>
      </div>
      <span class="spacer"></span>
      <button class="btn ghost" @click="reload">刷新</button>
      <button class="btn primary" @click="openCreate">+ 新增{{ group.label }}</button>
    </div>

    <div class="table-wrap">
      <table v-if="rows.length">
        <thead>
          <tr>
            <th v-for="c in group.columns" :key="c.key">{{ c.label }}</th>
            <th class="op-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="c in group.columns" :key="c.key" :title="cellText(row[c.key])">
              {{ cellText(row[c.key]) }}
            </td>
            <td class="op-col">
              <button class="btn mini" @click="openEdit(row)">编辑</button>
              <button class="btn mini danger" @click="remove(row)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else-if="loading" class="empty">加载中…</div>
      <div v-else class="empty">暂无数据，点击右上角「新增」创建第一条记录</div>
    </div>

    <div class="pager" v-if="total > 0">
      <span class="pager-info">共 {{ total }} 条 · 第 {{ page }}/{{ pages }} 页</span>
      <button class="btn mini" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
      <button class="btn mini" :disabled="page >= pages" @click="goPage(page + 1)">下一页</button>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <Teleport to="body">
      <div v-if="dialog" class="modal-mask" @click.self="closeDialog">
        <div class="modal">
          <header class="modal-head">
            <h3>{{ dialog.mode === 'create' ? '新增' : '编辑' }} · {{ group.label }}</h3>
            <button class="btn mini" @click="closeDialog">✕</button>
          </header>

          <div class="modal-body">
            <div
              v-for="f in group.fields"
              :key="f.key"
              class="form-field"
              :class="{ full: f.full }"
            >
              <label>{{ f.label }}<i v-if="f.required" class="req">*</i></label>

              <textarea
                v-if="f.type === 'textarea'"
                v-model="form[f.key]"
                rows="3"
                :placeholder="f.placeholder"
              ></textarea>

              <textarea
                v-else-if="f.type === 'lines'"
                v-model="form[f.key]"
                rows="4"
                :placeholder="(f.placeholder || '每行一条')"
              ></textarea>

              <textarea
                v-else-if="f.type === 'json'"
                v-model="form[f.key]"
                rows="6"
                class="mono"
                :placeholder="f.placeholder"
              ></textarea>

              <select v-else-if="f.type === 'select'" v-model="form[f.key]">
                <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>

              <label v-else-if="f.type === 'switch'" class="switch-line">
                <input type="checkbox" :checked="!!form[f.key]" @change="form[f.key] = $event.target.checked ? 1 : 0" />
                <span>开启</span>
              </label>

              <input
                v-else-if="f.type === 'number'"
                v-model="form[f.key]"
                type="number"
                :placeholder="f.placeholder"
              />

              <!-- 对象数组（如：境界下的秘法传承），随主记录一起保存 -->
              <div v-else-if="f.type === 'list'" class="list-editor">
                <div v-for="(row, idx) in listValue(f.key)" :key="idx" class="list-row">
                  <div class="list-fields">
                    <label v-for="sub in f.itemFields" :key="sub.key" :class="{ wide: sub.wide }">
                      <span>{{ sub.label }}</span>
                      <textarea
                        v-if="sub.wide"
                        v-model="row[sub.key]"
                        rows="2"
                        :placeholder="sub.placeholder"
                      ></textarea>
                      <input v-else v-model="row[sub.key]" type="text" :placeholder="sub.placeholder" />
                    </label>
                  </div>
                  <button type="button" class="btn mini danger list-del" @click="removeListItem(f.key, idx)">
                    删除
                  </button>
                </div>
                <button type="button" class="btn mini add-item" @click="addListItem(f.key)">
                  + 添加{{ f.label.split('（')[0] }}
                </button>
                <p v-if="!listValue(f.key).length" class="list-empty">暂无，点击上方按钮添加</p>
              </div>

              <input
                v-else
                v-model="form[f.key]"
                type="text"
                :placeholder="f.placeholder"
                maxlength="255"
              />
            </div>
          </div>

          <footer class="modal-foot">
            <span v-if="dialog.error" class="form-error">{{ dialog.error }}</span>
            <span class="spacer"></span>
            <button class="btn ghost" @click="closeDialog">取消</button>
            <button class="btn primary" :disabled="dialog.saving" @click="save">
              {{ dialog.saving ? '保存中…' : '保存' }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from '../../composables/useToast.js'
import {
  createAdminItem,
  deleteAdminItem,
  fetchAdminPage,
  updateAdminItem
} from '../../api/admin.js'

const props = defineProps({
  /** ADMIN_MODULES 中的一项 */
  mod: { type: Object, required: true }
})

const { show } = useToast()

const group = ref(props.mod.groups[0])
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const pages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))
const rows = ref([])
const loading = ref(false)

const dialog = ref(null) // { mode, id, error, saving }
const form = reactive({})

function switchGroup(g) {
  group.value = g
  keyword.value = ''
  page.value = 1
  reload()
}

// 首次进入模块即加载列表
onMounted(() => reload())

async function reload() {
  loading.value = true
  try {
    const res = await fetchAdminPage(group.value.key, {
      keyword: keyword.value.trim(),
      page: page.value,
      size: size.value
    })
    rows.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (e) {
    show(e.message || '列表加载失败', 'err')
    if (e.code === 401) {
      window.dispatchEvent(new CustomEvent('admin-unauthorized'))
    }
  } finally {
    loading.value = false
  }
}

function goPage(p) {
  page.value = Math.min(Math.max(1, p), pages.value)
  reload()
}

/* ---------------- 单元格显示 ---------------- */

function cellText(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? '✓' : '✗'
  if (Array.isArray(v)) {
    if (!v.length) return '—'
    if (typeof v[0] === 'object') return v.length + ' 项'
    return v.join(' / ')
  }
  if (typeof v === 'object') return '…'
  const s = String(v)
  return s.length > 24 ? s.slice(0, 24) + '…' : s
}

/* ---------------- 对象数组（秘法列表） ---------------- */

function listValue(key) {
  if (!Array.isArray(form[key])) form[key] = []
  return form[key]
}

function addListItem(key) {
  const f = group.value.fields.find((x) => x.key === key)
  const row = {}
  f.itemFields.forEach((sub) => { row[sub.key] = '' })
  listValue(key).push(row)
}

function removeListItem(key, idx) {
  listValue(key).splice(idx, 1)
}

/* ---------------- 表单编码 / 解码 ---------------- */

function decodeForForm(row) {
  const out = {}
  for (const f of group.value.fields) {
    let v = row[f.key]
    if (f.type === 'lines') {
      out[f.key] = Array.isArray(v) ? v.join('\n') : ''
    } else if (f.type === 'json') {
      out[f.key] = v === null || v === undefined ? '' : JSON.stringify(v, null, 2)
    } else if (f.type === 'list') {
      out[f.key] = Array.isArray(v)
        ? v.map((item) => {
            const o = {}
            f.itemFields.forEach((sub) => { o[sub.key] = item && item[sub.key] != null ? item[sub.key] : '' })
            return o
          })
        : []
    } else if (f.type === 'number') {
      out[f.key] = v === null || v === undefined ? '' : v
    } else if (f.type === 'switch') {
      out[f.key] = v ? 1 : 0
    } else {
      out[f.key] = v === null || v === undefined ? '' : v
    }
  }
  return out
}

function encodeFromForm() {
  const out = {}
  for (const f of group.value.fields) {
    let v = form[f.key]
    if (f.type === 'lines') {
      out[f.key] = String(v || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (f.type === 'json') {
      const s = String(v || '').trim()
      if (!s) {
        out[f.key] = []
      } else {
        try {
          out[f.key] = JSON.parse(s)
        } catch {
          throw new Error(`「${f.label}」不是合法 JSON`)
        }
      }
    } else if (f.type === 'list') {
      // 丢弃整行为空的项，其余字段去空格
      out[f.key] = (Array.isArray(v) ? v : [])
        .map((item) => {
          const o = {}
          f.itemFields.forEach((sub) => {
            o[sub.key] = String(item[sub.key] ?? '').trim()
          })
          return o
        })
        .filter((o) => Object.values(o).some(Boolean))
    } else if (f.type === 'number') {
      out[f.key] = v === '' || v === null ? (f.nullable ? null : 0) : Number(v)
    } else if (f.type === 'switch') {
      out[f.key] = v ? 1 : 0
    } else {
      out[f.key] = typeof v === 'string' ? v.trim() : v
    }
  }
  return out
}

/* ---------------- 增 / 改 / 删 ---------------- */

function openCreate() {
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, decodeForForm(group.value.blank()))
  dialog.value = { mode: 'create', id: null, error: '', saving: false }
}

function openEdit(row) {
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, decodeForForm(row))
  dialog.value = { mode: 'edit', id: row.id, error: '', saving: false }
}

function closeDialog() {
  dialog.value = null
}

async function save() {
  if (!dialog.value) return
  // 必填校验
  for (const f of group.value.fields) {
    if (f.required && !String(form[f.key] ?? '').trim()) {
      dialog.value.error = `请填写「${f.label}」`
      return
    }
  }
  let payload
  try {
    payload = encodeFromForm()
  } catch (e) {
    dialog.value.error = e.message
    return
  }
  dialog.value.error = ''
  dialog.value.saving = true
  try {
    if (dialog.value.mode === 'create') {
      await createAdminItem(group.value.key, payload)
      show('新增成功', 'ok')
    } else {
      await updateAdminItem(group.value.key, dialog.value.id, payload)
      show('保存成功', 'ok')
    }
    closeDialog()
    reload()
  } catch (e) {
    dialog.value.error = e.message || '保存失败'
    show(e.message || '保存失败', 'err')
  } finally {
    if (dialog.value) dialog.value.saving = false
  }
}

async function remove(row) {
  const label = row.name || row.code || ('#' + row.id)
  if (!window.confirm(`确定删除「${label}」？此操作不可恢复。`)) return
  try {
    await deleteAdminItem(group.value.key, row.id)
    show('已删除', 'ok')
    reload()
  } catch (e) {
    show(e.message || '删除失败', 'err')
  }
}

defineExpose({ reload })
</script>

<style scoped>
.admin-crud {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.group-tabs {
  display: flex;
  gap: 8px;
}
.group-tab {
  padding: 7px 18px;
  border: 1px solid var(--panel-line);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.group-tab.active {
  border-color: rgba(255, 212, 121, 0.55);
  color: var(--gold);
  background: rgba(255, 212, 121, 0.08);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-wrap {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 420px;
}
.search-wrap input {
  flex: 1;
  padding: 8px 14px;
  border: 1px solid var(--panel-line);
  border-radius: 10px;
  background: rgba(7, 11, 26, 0.9);
  color: var(--text);
  outline: none;
}
.search-wrap input:focus {
  border-color: rgba(255, 212, 121, 0.5);
}
.spacer {
  flex: 1;
}
.btn {
  border: 1px solid var(--panel-line);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn.primary {
  border-color: rgba(255, 212, 121, 0.55);
  background: linear-gradient(135deg, rgba(255, 212, 121, 0.2), rgba(245, 166, 35, 0.1));
  color: var(--gold);
}
.btn.primary:hover {
  box-shadow: 0 0 14px rgba(255, 212, 121, 0.3);
}
.btn.ghost:hover {
  border-color: rgba(102, 224, 255, 0.5);
  color: var(--cyan);
}
.btn.danger {
  color: var(--danger);
}
.btn.danger:hover {
  border-color: rgba(255, 107, 129, 0.6);
}
.btn.mini {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 8px;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.table-wrap {
  border: 1px solid var(--panel-line);
  border-radius: 14px;
  background: rgba(7, 11, 26, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  overflow: auto;
  min-height: 120px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  text-align: left;
  padding: 11px 14px;
  border-bottom: 1px solid rgba(140, 170, 255, 0.08);
  white-space: nowrap;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}
th {
  color: var(--muted);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.06em;
  background: rgba(14, 21, 46, 0.92);
}
tbody tr:hover {
  background: rgba(102, 224, 255, 0.05);
}
tbody tr:last-child td {
  border-bottom: none;
}
.op-col {
  text-align: right;
}
.op-col .btn + .btn {
  margin-left: 6px;
}
.empty {
  padding: 42px 0;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}
.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.pager-info {
  color: var(--muted);
  font-size: 12px;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(2, 4, 12, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
}
.modal {
  width: min(760px, 92vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-line);
  border-radius: 18px;
  background: linear-gradient(160deg, #0c1230, #080d20);
  box-shadow: var(--shadow);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-line);
}
.modal-head h3 {
  font-size: 15px;
  color: var(--gold);
  letter-spacing: 0.06em;
}
.modal-body {
  padding: 18px 20px;
  overflow: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field.full {
  grid-column: 1 / -1;
}
.form-field label {
  font-size: 12.5px;
  color: #aab6d8;
  letter-spacing: 0.05em;
}
.req {
  color: var(--danger);
  font-style: normal;
  margin-left: 3px;
}
.form-field input,
.form-field textarea,
.form-field select {
  padding: 9px 12px;
  border: 1px solid var(--panel-line);
  border-radius: 10px;
  background: rgba(6, 10, 26, 0.85);
  color: var(--text);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  width: 100%;
}
.form-field textarea {
  resize: vertical;
  line-height: 1.6;
}
.form-field textarea.mono {
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
}
.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  border-color: rgba(255, 212, 121, 0.5);
}
.switch-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}
.modal-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--panel-line);
}
.form-error {
  color: var(--danger);
  font-size: 12px;
}

/* 对象数组编辑器（秘法传承） */
.list-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.list-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 12px 10px;
  border: 1px solid var(--panel-line);
  border-radius: 12px;
  background: rgba(6, 10, 26, 0.55);
}
.list-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 10px;
}
.list-fields label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  color: #aab6d8;
}
.list-fields label.wide {
  grid-column: 1 / -1;
}
.list-fields input,
.list-fields textarea {
  padding: 7px 10px;
  border: 1px solid var(--panel-line);
  border-radius: 8px;
  background: rgba(10, 15, 36, 0.85);
  color: var(--text);
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
  width: 100%;
}
.list-fields textarea {
  resize: vertical;
  line-height: 1.55;
}
.list-fields input:focus,
.list-fields textarea:focus {
  border-color: rgba(255, 212, 121, 0.5);
}
.list-del {
  margin-top: 18px;
  flex-shrink: 0;
}
.add-item {
  align-self: flex-start;
  color: var(--cyan);
  border-color: rgba(102, 224, 255, 0.35);
}
.list-empty {
  font-size: 11.5px;
  color: var(--muted);
}
@media (max-width: 760px) {
  .list-fields {
    grid-template-columns: 1fr;
  }
}
</style>

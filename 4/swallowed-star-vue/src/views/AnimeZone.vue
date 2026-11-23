<template>
  <div class="page-shell az-page">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">ANIME ZONE</div>
        <h1>动画专区</h1>
        <p>从地球到宇宙海，吞噬星空的影像化编年史。选择你电脑里的视频，即刻在此放映。</p>
      </header>

      <!-- 本地影像馆：选择本地视频即时播放 -->
      <section class="card az-player">
        <div class="card-head">
          <h3>🎬 本地影像馆</h3>
          <span>视频只在你的浏览器播放，不会上传</span>
        </div>

        <div class="az-player-body">
          <!-- 播放区 -->
          <div class="az-stage">
            <video
              v-if="currentVideo"
              ref="videoEl"
              class="az-video"
              :src="currentVideo.url"
              controls
              playsinline
              preload="metadata"
            ></video>
            <div v-else class="az-stage-empty">
              <div class="az-stage-glyph">▶</div>
              <p>还没有视频</p>
              <span>点击下方按钮，从电脑里挑选视频开始放映</span>
            </div>
          </div>

          <!-- 控制栏 -->
          <div class="az-controls">
            <input
              ref="fileInput"
              type="file"
              accept="video/*,.mp4,.webm,.ogg,.mov,.m4v,.mkv,.avi"
              multiple
              class="az-file-input"
              @change="onFileChange"
            />
            <button type="button" class="az-pick-btn" @click="fileInput?.click()">
              <span>＋</span> 选择本地视频
            </button>
            <div class="az-now" v-if="currentVideo">
              <span class="az-now-label">正在放映</span>
              <b :title="currentVideo.name">{{ currentVideo.name }}</b>
              <span class="az-now-size">{{ formatSize(currentVideo.size) }}</span>
            </div>
            <div class="az-now az-now-idle" v-else>
              <span>支持 mp4 / webm / ogg，可一次选择多集</span>
            </div>
          </div>

          <p v-if="hint" class="az-hint">{{ hint }}</p>

          <!-- 播放列表 -->
          <div v-if="playlist.length" class="az-playlist">
            <div class="az-playlist-head">
              <h4>播放列表 <span>{{ playlist.length }} 个视频</span></h4>
              <button type="button" class="az-clear-btn" @click="clearAll">清空</button>
            </div>
            <ul>
              <li
                v-for="(v, i) in playlist"
                :key="v.id"
                :class="{ on: i === currentIndex }"
                @click="selectVideo(i)"
              >
                <span class="az-pl-no">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="az-pl-name" :title="v.name">{{ v.name }}</span>
                <span class="az-pl-size">{{ formatSize(v.size) }}</span>
                <button type="button" class="az-pl-del" title="移除" @click.stop="removeVideo(i)">×</button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- B站在线放映：官方嵌入播放器，不下载不上传 -->
      <section class="card az-bili">
        <div class="card-head">
          <h3>📺 B站在线放映</h3>
          <span>由哔哩哔哩官方播放器提供，视频不落地</span>
        </div>
        <div class="az-bili-body">
          <div class="az-bili-bar">
            <input
              v-model="biliInput"
              type="text"
              class="az-bili-input"
              placeholder="粘贴 B 站视频链接或 BV 号，例如 BV1qV4y1P7kK"
              @keyup.enter="playBili"
            />
            <button type="button" class="az-bili-go" @click="playBili">放映</button>
          </div>
          <p v-if="biliHint" class="az-bili-hint">{{ biliHint }}</p>

          <div class="az-bili-stage">
            <iframe
              v-if="biliBvid"
              :key="biliBvid"
              :src="`https://player.bilibili.com/player.html?bvid=${biliBvid}&page=1&high_quality=1&danmaku=0`"
              class="az-bili-frame"
              scrolling="no"
              border="0"
              frameborder="no"
              framespacing="0"
              allowfullscreen="true"
              referrerpolicy="no-referrer"
            ></iframe>
            <div v-else class="az-bili-empty">
              <div class="az-bili-glyph">BV</div>
              <p>粘贴链接，或点选下方视频开始放映</p>
              <span>播放由哔哩哔哩官方播放器提供</span>
            </div>
          </div>

          <div v-if="biliPresets.length" class="az-bili-list">
            <div class="az-bili-list-head"><h4>《吞噬星空》相关视频</h4><span>点选即可放映</span></div>
            <div class="az-bili-grid">
              <button
                v-for="v in biliPresets"
                :key="v.bvid"
                type="button"
                class="az-bili-item"
                :class="{ on: biliBvid === v.bvid }"
                :title="v.title"
                @click="playPreset(v)"
              >
                <span class="az-bili-play">▶</span>
                <span class="az-bili-title">{{ v.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 分季切换 -->
      <div class="az-seasons">
        <button
          v-for="(s, i) in seasons"
          :key="s.key"
          type="button"
          class="az-season"
          :class="{ on: current === i }"
          @click="current = i"
        >
          <span class="az-season-no">SEASON {{ i + 1 }}</span>
          <b>{{ s.title }}</b>
          <span class="az-season-year">{{ s.year }}</span>
        </button>
      </div>

      <div v-if="season" class="az-detail">
        <!-- 本季概览 -->
        <section class="az-hero card">
          <div class="az-hero-glyph">{{ season.glyph }}</div>
          <div class="az-hero-body">
            <div class="az-hero-eyebrow">{{ season.en }}</div>
            <h2>{{ season.title }}</h2>
            <p>{{ season.desc }}</p>
            <div class="az-hero-meta">
              <span>集数 <b>{{ season.episodes }}</b></span>
              <span>篇章 <b>{{ season.arc }}</b></span>
              <span>主角境界 <b>{{ season.realm }}</b></span>
            </div>
          </div>
        </section>

        <div class="az-cols">
          <!-- 剧情脉络 -->
          <section class="card az-timeline">
            <div class="card-head"><h3>剧情脉络</h3><span>{{ season.timeline.length }} 个节点</span></div>
            <div class="az-tl">
              <div v-for="(t, i) in season.timeline" :key="i" class="az-tl-item">
                <span class="az-tl-dot"></span>
                <div class="az-tl-body">
                  <b>{{ t.title }}</b>
                  <p>{{ t.desc }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 登场角色 -->
          <section class="card az-cast">
            <div class="card-head"><h3>登场角色</h3><span>{{ season.cast.length }} 位</span></div>
            <div class="az-cast-list">
              <div v-for="c in season.cast" :key="c.name" class="az-cast-item">
                <i class="az-cast-avatar" :style="{ '--pc': c.color }">{{ c.glyph }}</i>
                <div>
                  <b>{{ c.name }}</b>
                  <span>{{ c.role }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 剧场版 -->
        <section class="card az-movies" v-if="season.movies && season.movies.length">
          <div class="card-head"><h3>剧场版 / 特别篇</h3><span>{{ season.movies.length }} 部</span></div>
          <div class="az-movie-grid">
            <div v-for="m in season.movies" :key="m.name" class="az-movie">
              <div class="az-movie-cover" :style="{ '--pc': m.color }">{{ m.glyph }}</div>
              <div class="az-movie-info">
                <b>{{ m.name }}</b>
                <span>{{ m.year }} · {{ m.note }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <p class="az-footnote">视频仅在本地浏览器播放，不上传服务器；剧情资料版权归原作方所有。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { getFeatureConfig } from '../api/config.js'
import { DEFAULT_FEATURES, deepMerge } from '../config/defaults.js'

const seasons = ref([
  {
    key: 's1', title: '地球篇', en: 'THE EARTH ARC', year: '地球 · 大涅槃纪',
    glyph: '地', episodes: 26, arc: '武者考核 → 陨墨星', realm: '学徒 → 行星级',
    desc: '大涅槃后的地球，少年罗峰觉醒精神念力。从武者考核到陨墨星传承，他第一次把「不可能」写成「已记录」。',
    timeline: [
      { title: '武者考核', desc: '以近乎自毁的方式通过考核，精神念力初次觉醒。' },
      { title: '渴望雕像', desc: '为强化精神念力，闯荡「九重楼」，与天才们正面交锋。' },
      { title: '陨墨星遗迹', desc: '继承陨墨星主传承，结识智能生命巴巴塔，命运改写。' },
      { title: '告别地球', desc: '踏出地球，正式进入宇宙舞台。' }
    ],
    cast: [
      { name: '罗峰', glyph: '锋', role: '主角 · 精神念师', color: '#ffd479' },
      { name: '巴巴塔', glyph: '巴', role: '导师 · 智能生命', color: '#7dffb0' },
      { name: '徐欣', glyph: '欣', role: '妻子 · 医者', color: '#b98cff' },
      { name: '雷神', glyph: '雷', role: '挚友 · 雷电法则', color: '#66e0ff' }
    ],
    movies: [
      { name: '吞噬星空·起源', glyph: '源', year: '2020', note: '地球篇前传', color: '#ffd479' }
    ]
  },
  {
    key: 's2', title: '宇宙篇', en: 'THE COSMOS ARC', year: '宇宙 · 混沌城',
    glyph: '宇', episodes: 30, arc: '混沌城 → 域外战场', realm: '恒星级 → 宇宙之主',
    desc: '进入宇宙后，罗峰在混沌城参悟九座混沌碑，于域外战场历经百战，一步步登临宇宙之主。',
    timeline: [
      { title: '初入混沌城', desc: '拜入混沌城主门下，在九座混沌碑前苦修。' },
      { title: '金角巨兽', desc: '为守护地球，与星空巨兽联盟的强敌正面决战。' },
      { title: '域外战场', desc: '人类与异族大规模战争，以一己之力改写战局。' },
      { title: '登临宇宙之主', desc: '悟透时空法则，成为人类阵营的顶尖战力。' }
    ],
    cast: [
      { name: '罗峰', glyph: '锋', role: '宇宙之主', color: '#ffd479' },
      { name: '混沌城主', glyph: '混', role: '师尊', color: '#b98cff' },
      { name: '金角巨兽', glyph: '角', role: '宿敌', color: '#ff8a5c' }
    ],
    movies: [
      { name: '吞噬星空·宇宙篇', glyph: '宙', year: '2022', note: '剧场版', color: '#66e0ff' }
    ]
  },
  {
    key: 's3', title: '宇宙海篇', en: 'THE COSMIC SEA', year: '宇宙海 · 起源大陆',
    glyph: '海', episodes: 24, arc: '宇宙海 → 起源大陆', realm: '宇宙之主 → 宇宙最强者',
    desc: '罗峰穿越宇宙海，追寻起源大陆的传说。更大的世界、更强的法则、更深的谜题在前方展开。',
    timeline: [
      { title: '踏入宇宙海', desc: '离开人类疆域，探索未知星域与古老遗迹。' },
      { title: '倾峰界', desc: '闯荡宇宙海秘境，争夺传承与至宝。' },
      { title: '起源大陆', desc: '触及宇宙起源的秘密，逼近力量的天花板。' },
      { title: '星辰之主', desc: '以精神念力登临全新的境界。' }
    ],
    cast: [
      { name: '罗峰', glyph: '锋', role: '主角 · 星辰之主', color: '#ffd479' },
      { name: '巴巴塔', glyph: '巴', role: '战术核心', color: '#7dffb0' },
      { name: '未名者', glyph: '谜', role: '幽暗宇宙', color: '#ff6b8a' }
    ],
    movies: []
  }
])

const current = ref(0)
const season = computed(() => seasons.value[current.value] || null)

/* ---------- B站在线放映 ---------- */
const biliInput = ref('')
const biliBvid = ref('')
const biliHint = ref('')
// 来自 B 站搜索结果的《吞噬星空》相关视频（官方/UP主发布，版权归原作者）
const biliPresets = ref(DEFAULT_FEATURES.content.animeVideos.map(v => ({ ...v })))

onMounted(async () => {
  const cfg = await getFeatureConfig()
  if (!cfg) return
  const merged = deepMerge(DEFAULT_FEATURES, cfg)
  if (Array.isArray(merged?.content?.animeVideos)) {
    biliPresets.value = merged.content.animeVideos
  }
  if (Array.isArray(merged?.content?.animeSeasons) && merged.content.animeSeasons.length) {
    seasons.value = merged.content.animeSeasons
    if (current.value >= seasons.value.length) current.value = 0
  }
})

function parseBvid(input) {
  const s = String(input || '').trim()
  // 直接是 BV 号
  let m = s.match(/BV[0-9A-Za-z]{10}/)
  if (m) return m[0]
  // B站短链 b23.tv 由用户粘贴完整链接时，浏览器已能解析出 BV，这里只处理标准链接
  return ''
}

function playBili() {
  const bv = parseBvid(biliInput.value)
  if (!bv) {
    biliHint.value = '没识别出 BV 号。请粘贴 B 站视频链接（含 BV 号）或直接输入 BV 号，例如 BV1qV4y1P7kK。'
    return
  }
  biliHint.value = ''
  biliBvid.value = bv
}

function playPreset(v) {
  biliHint.value = ''
  biliInput.value = ''
  biliBvid.value = v.bvid
}

/* ---------- 本地视频播放 ---------- */
const fileInput = ref(null)
const videoEl = ref(null)
const playlist = ref([])       // { id, name, size, url }
const currentIndex = ref(-1)
const hint = ref('')
let uid = 0

const currentVideo = computed(() =>
  currentIndex.value >= 0 ? playlist.value[currentIndex.value] || null : null
)

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

function onFileChange(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = '' // 允许再次选择同一文件
  if (!files.length) return
  const added = files.map(f => ({
    id: ++uid,
    name: f.name,
    size: f.size,
    url: URL.createObjectURL(f)
  }))
  playlist.value = added
  currentIndex.value = 0
  hint.value = added.length > 1
    ? `已载入 ${added.length} 个视频，点播放列表可切换。`
    : ''
  nextTick(() => videoEl.value?.load())
}

function selectVideo(i) {
  if (i < 0 || i >= playlist.value.length) return
  currentIndex.value = i
  hint.value = ''
  nextTick(() => {
    videoEl.value?.load()
    videoEl.value?.play().catch(() => {}) // 部分浏览器需手动点播放
  })
}

function removeVideo(i) {
  const [gone] = playlist.value.splice(i, 1)
  if (gone) URL.revokeObjectURL(gone.url)
  if (!playlist.value.length) {
    currentIndex.value = -1
  } else if (i < currentIndex.value) {
    currentIndex.value--
  } else if (i === currentIndex.value) {
    currentIndex.value = Math.min(i, playlist.value.length - 1)
    nextTick(() => videoEl.value?.load())
  }
}

function clearAll() {
  playlist.value.forEach(v => URL.revokeObjectURL(v.url))
  playlist.value = []
  currentIndex.value = -1
  hint.value = ''
}

onBeforeUnmount(clearAll)
</script>

<style scoped>
/* ---------- 本地影像馆 ---------- */
.az-player { max-width: 1000px; margin: 0 auto 22px; padding: 0; overflow: hidden; }
.az-player .card-head { padding: 16px 22px; margin: 0; border-bottom: 1px solid var(--panel-line); }
.az-player .card-head h3 { font-size: 16px; letter-spacing: 1px; }
.az-player .card-head span { font-size: 11px; color: var(--muted); }
.az-player-body { padding: 20px 22px 22px; }

.az-stage {
  position: relative; width: 100%; aspect-ratio: 16 / 9;
  border-radius: 12px; overflow: hidden; background: #05070e;
  border: 1px solid var(--panel-line);
}
.az-video { width: 100%; height: 100%; display: block; background: #05070e; }
.az-stage-empty {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; text-align: center;
  background: radial-gradient(circle at 50% 45%, rgba(255,212,121,.06), transparent 60%);
}
.az-stage-glyph {
  width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%;
  font-size: 26px; color: var(--gold); padding-left: 4px;
  border: 1px solid rgba(255,212,121,.35);
  background: rgba(255,212,121,.08);
}
.az-stage-empty p { margin: 4px 0 0; font-size: 15px; color: var(--text); }
.az-stage-empty span { font-size: 12px; color: var(--muted); }

.az-controls { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 16px; }
.az-file-input { display: none; }
.az-pick-btn {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 11px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; letter-spacing: 1px;
  color: #1a1206; border: 1px solid var(--gold);
  background: linear-gradient(180deg, #ffe6a8, var(--gold)); transition: 0.2s;
}
.az-pick-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
.az-pick-btn span { font-size: 18px; line-height: 1; }
.az-now { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.az-now-label { font-size: 10px; letter-spacing: 2px; color: var(--gold); }
.az-now b { font-size: 13px; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-now-size { font-size: 11px; color: var(--cyan); }
.az-now-idle span { font-size: 12px; color: var(--muted); }
.az-hint { margin: 12px 0 0; font-size: 12px; color: var(--cyan); }

.az-playlist { margin-top: 18px; border-top: 1px solid var(--panel-line); padding-top: 14px; }
.az-playlist-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.az-playlist-head h4 { font-size: 13px; letter-spacing: 1px; }
.az-playlist-head h4 span { font-size: 11px; color: var(--muted); margin-left: 8px; font-weight: 400; }
.az-clear-btn { background: none; border: none; color: var(--muted); font-size: 12px; cursor: pointer; }
.az-clear-btn:hover { color: #ff6b8a; }
.az-playlist ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.az-playlist li {
  display: flex; align-items: center; gap: 12px; padding: 9px 12px; cursor: pointer;
  border-radius: 8px; border: 1px solid transparent; background: rgba(255,255,255,.02); transition: 0.18s;
}
.az-playlist li:hover { background: rgba(255,212,121,.06); }
.az-playlist li.on { border-color: rgba(255,212,121,.4); background: rgba(255,212,121,.09); }
.az-pl-no { font-size: 11px; color: var(--gold); font-variant-numeric: tabular-nums; }
.az-pl-name { flex: 1; min-width: 0; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-pl-size { font-size: 11px; color: var(--muted); }
.az-pl-del {
  background: none; border: none; color: var(--muted); font-size: 18px; line-height: 1;
  cursor: pointer; padding: 0 2px;
}
.az-pl-del:hover { color: #ff6b8a; }

/* ---------- B站在线放映 ---------- */
.az-bili { max-width: 1000px; margin: 0 auto 22px; padding: 0; overflow: hidden; }
.az-bili .card-head { padding: 16px 22px; margin: 0; border-bottom: 1px solid var(--panel-line); }
.az-bili .card-head h3 { font-size: 16px; letter-spacing: 1px; }
.az-bili .card-head span { font-size: 11px; color: var(--muted); }
.az-bili-body { padding: 18px 22px 22px; }
.az-bili-bar { display: flex; gap: 10px; }
.az-bili-input {
  flex: 1; min-width: 0; padding: 11px 14px; font-size: 13px;
  border-radius: 10px; border: 1px solid var(--panel-line);
  background: rgba(255,255,255,.03); color: var(--text); outline: none;
}
.az-bili-input:focus { border-color: rgba(102,224,255,.5); }
.az-bili-input::placeholder { color: var(--muted); }
.az-bili-go {
  cursor: pointer; padding: 11px 22px; border-radius: 10px; font-size: 13px; font-weight: 600;
  color: #04141a; border: 1px solid var(--cyan);
  background: linear-gradient(180deg, #a8f0ff, var(--cyan)); transition: 0.2s;
}
.az-bili-go:hover { filter: brightness(1.08); transform: translateY(-1px); }
.az-bili-hint { margin: 10px 0 0; font-size: 12px; color: #ff8a5c; }
.az-bili-stage {
  position: relative; width: 100%; aspect-ratio: 16 / 9; margin-top: 16px;
  border-radius: 12px; overflow: hidden; background: #05070e;
  border: 1px solid var(--panel-line);
}
.az-bili-frame { width: 100%; height: 100%; border: 0; display: block; background: #05070e; }
.az-bili-empty {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; text-align: center;
  background: radial-gradient(circle at 50% 45%, rgba(102,224,255,.06), transparent 60%);
}
.az-bili-glyph {
  width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%;
  font-size: 20px; font-weight: 700; letter-spacing: 1px; color: var(--cyan);
  border: 1px solid rgba(102,224,255,.35); background: rgba(102,224,255,.08);
}
.az-bili-empty p { margin: 4px 0 0; font-size: 15px; color: var(--text); }
.az-bili-empty span { font-size: 12px; color: var(--muted); }
.az-bili-list { margin-top: 18px; border-top: 1px solid var(--panel-line); padding-top: 14px; }
.az-bili-list-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.az-bili-list-head h4 { font-size: 13px; letter-spacing: 1px; }
.az-bili-list-head span { font-size: 11px; color: var(--muted); }
.az-bili-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
.az-bili-item {
  display: flex; align-items: center; gap: 9px; text-align: left; cursor: pointer;
  padding: 10px 12px; border-radius: 8px; color: var(--text);
  border: 1px solid var(--panel-line); background: rgba(255,255,255,.02); transition: 0.18s;
}
.az-bili-item:hover { border-color: rgba(102,224,255,.4); background: rgba(102,224,255,.06); }
.az-bili-item.on { border-color: var(--cyan); background: rgba(102,224,255,.1); }
.az-bili-play { font-size: 11px; color: var(--cyan); }
.az-bili-title { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---------- 原有分季资料 ---------- */
.az-seasons {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  max-width: 1000px; margin: 0 auto 20px;
}
.az-season {
  text-align: left; padding: 16px 18px;
  border-radius: var(--radius); border: 1px solid var(--panel-line);
  background: var(--panel); color: var(--text); cursor: pointer; transition: 0.22s;
}
.az-season:hover { transform: translateY(-2px); border-color: rgba(255,212,121,.4); }
.az-season.on { border-color: var(--gold); background: rgba(255,212,121,.08); }
.az-season-no { display: block; font-size: 10px; letter-spacing: 3px; color: var(--gold); opacity: .8; }
.az-season b { display: block; font-size: 17px; margin-top: 6px; letter-spacing: 2px; }
.az-season-year { display: block; font-size: 11px; color: var(--muted); margin-top: 5px; }

.az-detail { max-width: 1000px; margin: 0 auto; animation: rise 0.5s ease-out both; }
.az-hero { display: flex; gap: 24px; align-items: center; padding: 24px 28px; margin-bottom: 18px; }
.az-hero-glyph {
  display: grid; place-items: center; width: 96px; height: 96px; flex: 0 0 96px;
  border-radius: 18px; font-size: 46px; color: var(--gold);
  border: 1px solid rgba(255,212,121,.35);
  background: radial-gradient(circle, rgba(255,212,121,.15), transparent 70%);
}
.az-hero-eyebrow { font-size: 10px; letter-spacing: 4px; color: var(--gold); }
.az-hero h2 { font-size: 24px; letter-spacing: 3px; margin: 6px 0 10px; }
.az-hero p { font-size: 13px; color: var(--muted); line-height: 1.8; }
.az-hero-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 14px; }
.az-hero-meta span { font-size: 11px; color: var(--muted); }
.az-hero-meta b { color: var(--cyan); font-size: 13px; margin-left: 4px; }

.az-cols { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 16px; }
.az-timeline, .az-cast, .az-movies { padding: 18px 22px; }
.az-tl { position: relative; padding-left: 8px; }
.az-tl::before { content: ''; position: absolute; left: 13px; top: 6px; bottom: 6px; width: 1px; background: var(--panel-line); }
.az-tl-item { position: relative; padding-left: 26px; padding-bottom: 18px; }
.az-tl-item:last-child { padding-bottom: 0; }
.az-tl-dot {
  position: absolute; left: 0; top: 4px; width: 11px; height: 11px; border-radius: 50%;
  background: var(--bg); border: 2px solid var(--gold);
}
.az-tl-body b { font-size: 14px; }
.az-tl-body p { font-size: 12px; color: var(--muted); margin-top: 5px; line-height: 1.6; }
.az-cast-list { display: flex; flex-direction: column; gap: 12px; }
.az-cast-item { display: flex; align-items: center; gap: 12px; }
.az-cast-avatar {
  --pc: var(--cyan); display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px;
  border-radius: 50%; font-style: normal; font-size: 17px; color: var(--pc);
  border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
  background: color-mix(in srgb, var(--pc) 10%, transparent);
}
.az-cast-item b { display: block; font-size: 13px; }
.az-cast-item span { display: block; font-size: 11px; color: var(--muted); margin-top: 3px; }
.az-movie-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.az-movie { display: flex; align-items: center; gap: 12px; }
.az-movie-cover {
  --pc: var(--gold); display: grid; place-items: center; width: 54px; height: 72px; flex: 0 0 54px;
  border-radius: 8px; font-size: 24px; color: var(--pc);
  border: 1px solid color-mix(in srgb, var(--pc) 40%, transparent);
  background: linear-gradient(160deg, color-mix(in srgb, var(--pc) 16%, transparent), transparent);
}
.az-movie-info b { display: block; font-size: 13px; }
.az-movie-info span { display: block; font-size: 11px; color: var(--muted); margin-top: 4px; }
.az-footnote { max-width: 1000px; margin: 16px auto 0; font-size: 11px; color: var(--muted); text-align: center; }

@media (max-width: 720px) {
  .az-seasons { grid-template-columns: 1fr; }
  .az-cols { grid-template-columns: 1fr; }
  .az-hero { flex-direction: column; text-align: center; }
}
</style>

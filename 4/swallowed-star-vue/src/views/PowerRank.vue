<template>
  <div class="page-shell pr-page">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">POWER RANKING</div>
        <h1>战力排行榜</h1>
        <p>星海强者，以战力指数排序。你的排名由「意识修炼」的境界与念力折算而来——修炼一日，排名进一步。</p>
      </header>

      <!-- 我的排名概览 -->
      <section class="pr-me card">
        <div class="pr-me-badge">我</div>
        <div class="pr-me-main">
          <span class="pr-me-label">当前账号</span>
          <b class="pr-me-name">{{ me.name }}</b>
        </div>
        <div class="pr-me-stat">
          <span>境界</span><b>{{ realmName }}</b>
        </div>
        <div class="pr-me-stat">
          <span>念力</span><b>{{ fmtPower(myPower) }}</b>
        </div>
        <div class="pr-me-stat rank">
          <span>榜单排名</span><b>#{{ myRank }}</b>
        </div>
      </section>

      <!-- 榜单 -->
      <section class="pr-board card">
        <div class="card-head">
          <h3>星海强者榜</h3>
          <span>共 {{ list.length }} 位 · 战力指数由能力条折算</span>
        </div>

        <div class="pr-row pr-head-row">
          <span class="pr-col-rank">排名</span>
          <span class="pr-col-who">人物</span>
          <span class="pr-col-realm">境界</span>
          <span class="pr-col-bar">战力指数</span>
          <span class="pr-col-score">指数</span>
        </div>

        <div
          v-for="(row, i) in list"
          :key="row.id"
          class="pr-row"
          :class="{ mine: row.mine, top3: i < 3 }"
        >
          <span class="pr-col-rank">
            <i v-if="i === 0" class="pr-medal gold">1</i>
            <i v-else-if="i === 1" class="pr-medal silver">2</i>
            <i v-else-if="i === 2" class="pr-medal bronze">3</i>
            <b v-else>{{ i + 1 }}</b>
          </span>
          <span class="pr-col-who">
            <i class="pr-avatar" :style="{ '--pc': row.color }">{{ row.glyph }}</i>
            <span class="pr-who-text"><b>{{ row.name }}</b><em>{{ row.en }}</em></span>
          </span>
          <span class="pr-col-realm">{{ row.realm }}</span>
          <span class="pr-col-bar">
            <i class="pr-bar"><b :style="{ width: pct(row.score) + '%', '--pc': row.color }"></b></i>
          </span>
          <span class="pr-col-score">{{ row.score }}</span>
        </div>
      </section>

      <p class="pr-footnote">
        战力指数 = 人物能力条均值 × 修为系数。前三位来自人物档案，「我」由当前修炼进度实时折算。
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { CHARACTERS, REALMS } from '../data/lore.js'
import { getSession } from '../composables/useAuth.js'
import { STORE_REALM, STORE_POWER } from '../game/battle/roster.js'

const STORE_REALM_KEY = STORE_REALM
const STORE_POWER_KEY = STORE_POWER

const session = getSession()
const me = computed(() => ({
  name: (session && (session.nickname || session.username)) || '星际战士'
}))

function safeNum(v) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 1
}
const realmIdx = computed(() => {
  try {
    const n = Number(localStorage.getItem(STORE_REALM_KEY))
    return Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), 6) : 0
  } catch { return 0 }
})
const myPower = computed(() => {
  try { return safeNum(localStorage.getItem(STORE_POWER_KEY)) } catch { return 1 }
})
const realmName = computed(() => (REALMS[realmIdx.value] || REALMS[0]).name)

// 人物能力条均值 → 战力指数
function charScore(c) {
  const stats = c.stats || []
  if (!stats.length) return 800
  const avg = stats.reduce((s, x) => s + (Number(x.value) || 0), 0) / stats.length
  return Math.round(avg * 10)
}
// 我的指数：境界越高系数越大，念力对数微调
const myScore = computed(() => {
  const base = 400 + realmIdx.value * 70
  const bonus = Math.round(Math.log10(myPower.value) * 12)
  return base + bonus
})

const list = computed(() => {
  const others = CHARACTERS.map(c => ({
    id: c.id, name: c.name, en: c.en, glyph: c.glyph,
    color: c.color || '#ffd479', realm: c.realm, score: charScore(c), mine: false
  }))
  others.push({
    id: '__me__', name: me.value.name, en: 'YOU', glyph: '我',
    color: '#ffd479', realm: realmName.value, score: myScore.value, mine: true
  })
  return others.sort((a, b) => b.score - a.score)
})

const myRank = computed(() => {
  const i = list.value.findIndex(r => r.mine)
  return i < 0 ? '—' : i + 1
})
const maxScore = computed(() => Math.max(1, ...list.value.map(r => r.score)))
function pct(score) { return Math.round(score / maxScore.value * 100) }
function fmtPower(v) {
  const n = Number(v) || 0
  if (n >= 1e8) return (n / 1e8).toFixed(1) + ' 亿'
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1) + ' 万'
  return String(n)
}
</script>

<style scoped>
.pr-me {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  max-width: 1000px; margin: 0 auto 18px; padding: 18px 22px;
}
.pr-me-badge {
  width: 50px; height: 50px; flex: 0 0 50px;
  display: grid; place-items: center; border-radius: 50%;
  font-size: 20px; color: var(--bg); background: var(--gold); font-weight: 700;
}
.pr-me-main { min-width: 140px; }
.pr-me-label { display: block; font-size: 11px; color: var(--muted); letter-spacing: 2px; }
.pr-me-name { display: block; font-size: 18px; margin-top: 3px; }
.pr-me-stat { margin-left: auto; text-align: center; }
.pr-me-stat span { display: block; font-size: 11px; color: var(--muted); }
.pr-me-stat b { display: block; font-size: 16px; margin-top: 4px; color: var(--cyan); }
.pr-me-stat.rank b { color: var(--gold); font-size: 22px; }

.pr-board { max-width: 1000px; margin: 0 auto; padding: 8px 0 14px; overflow: hidden; }
.pr-row {
  display: grid;
  grid-template-columns: 70px 1.4fr 1.2fr 2fr 70px;
  align-items: center; gap: 12px;
  padding: 13px 24px;
  border-bottom: 1px solid var(--panel-line);
  font-size: 13px;
}
.pr-row:last-child { border-bottom: none; }
.pr-head-row { font-size: 11px; color: var(--muted); letter-spacing: 2px; padding-top: 16px; }
.pr-row.mine {
  background: linear-gradient(90deg, rgba(255, 212, 121, 0.12), transparent);
  border-left: 3px solid var(--gold);
}
.pr-col-rank { text-align: center; font-weight: 700; }
.pr-medal {
  display: inline-grid; place-items: center;
  width: 26px; height: 26px; border-radius: 50%;
  font-style: normal; font-size: 12px; font-weight: 700; color: #1a1206;
}
.pr-medal.gold { background: linear-gradient(135deg, #ffe08a, #d9a441); }
.pr-medal.silver { background: linear-gradient(135deg, #e8eef5, #9fb0c4); }
.pr-medal.bronze { background: linear-gradient(135deg, #f0b184, #b9743f); }
.pr-col-who { display: flex; align-items: center; gap: 12px; }
.pr-avatar {
  --pc: var(--gold);
  display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 36px;
  border-radius: 50%; font-style: normal; font-size: 16px; color: var(--pc);
  border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
  background: color-mix(in srgb, var(--pc) 10%, transparent);
}
.pr-who-text b { display: block; font-size: 14px; }
.pr-who-text em { display: block; font-style: normal; font-size: 9px; color: var(--muted); letter-spacing: 1px; }
.pr-col-realm { color: var(--muted); font-size: 12px; }
.pr-col-bar .pr-bar { display: block; height: 8px; border-radius: 4px; background: rgba(0,0,0,.4); overflow: hidden; }
.pr-col-bar .pr-bar b {
  --pc: var(--gold);
  display: block; height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--pc) 55%, transparent), var(--pc));
}
.pr-col-score { text-align: right; font-weight: 700; color: var(--gold); font-variant-numeric: tabular-nums; }
.pr-footnote { max-width: 1000px; margin: 14px auto 0; font-size: 11px; color: var(--muted); text-align: center; }

@media (max-width: 720px) {
  .pr-row { grid-template-columns: 44px 1.4fr 1fr 56px; padding: 12px 14px; gap: 8px; }
  .pr-col-realm { display: none; }
  .pr-me-stat { margin-left: 10px; }
}
</style>

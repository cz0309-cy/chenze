<template>
  <div class="page-shell" ref="shellEl">
    <SiteNav />

    <div class="page-inner rt-page">
      <header class="page-head">
        <div class="eyebrow">REALM ASCENSION LADDER</div>
        <h1>境界体系</h1>
        <p>从准武者、学徒级，一路攀到不朽、宇宙之主与神王。每一级都标注了战力指数与寿元，越往上，数字越接近天文——收藏下来，随时回来看看这条登天之路。</p>
      </header>

      <!-- 概览 -->
      <div class="rt-overview">
        <div class="ov-cell"><span>境界总数</span><b>{{ ladder.length }} <i>级</i></b></div>
        <div class="ov-cell"><span>战力跨度</span><b>10<sup>16</sup> <i>倍</i></b></div>
        <div class="ov-cell"><span>寿元跨度</span><b>100 → ∞ <i>年</i></b></div>
        <div class="ov-cell accent">
          <span>我的收藏</span>
          <button class="fav-all" :class="{ on: favs.size > 0 }" @click="toggleFavMode">
            {{ favMode ? '★ 只看收藏' : `☆ 已收藏 ${favs.size}` }}
          </button>
        </div>
      </div>

      <!-- 分组锚点 -->
      <div class="rt-tiers">
        <button
          v-for="t in tiers"
          :key="t.key"
          class="rt-tier"
          :class="{ on: activeTier === t.key }"
          :style="{ '--tc': t.color }"
          @click="scrollToTier(t.key)"
        >
          <i></i>
          <span>{{ t.label }}</span>
          <em>{{ t.en }}</em>
        </button>
      </div>

      <!-- 战力刻度尺 -->
      <section class="card rt-scale">
        <div class="card-head">
          <h3>战力刻度</h3>
          <span>对数刻度 · 以学徒级九阶为基准 ×1</span>
        </div>
        <div class="scale-body">
          <div class="scale-track">
            <i
              v-for="r in ladder"
              :key="'tick-' + r.id"
              class="scale-tick"
              :style="{ left: (powerLevel(r) * 100) + '%', background: tierColor(r.tier) }"
              :title="`${r.name} · 战力 ${r.powerText}`"
            />
            <div class="scale-fill" />
          </div>
          <div class="scale-labels">
            <span>学徒 ×1</span><span>行星</span><span>宇宙</span><span>不朽</span><span>宇宙之主</span><span>神王</span>
          </div>
        </div>
      </section>

      <!-- 纵向阶梯 -->
      <div class="rt-ladder">
        <template v-for="t in tiers" :key="'group-' + t.key">
          <div class="rt-group-head" :style="{ '--tc': t.color }" :data-tier="t.key">
            <span class="gh-line"></span>
            <b>{{ t.label }}</b>
            <em>{{ t.hint }}</em>
          </div>

          <article
            v-for="(r, idx) in groupLadder(t.key)"
            :key="r.id"
            class="rt-step"
            :class="{ 'is-fav': favs.has(r.id), hidden: favMode && !favs.has(r.id) }"
            :style="{ '--tc': tierColor(r.tier), '--step': idx }"
          >
            <div class="step-rail">
              <span class="step-node">{{ String(globalIndex(r.id) + 1).padStart(2, '0') }}</span>
              <span class="step-line"></span>
            </div>

            <div class="step-card card">
              <div class="sc-top">
                <div class="sc-title">
                  <h3>{{ r.name }}</h3>
                  <span class="sc-en">{{ r.en }}</span>
                </div>
                <button
                  class="fav-btn"
                  :class="{ on: favs.has(r.id) }"
                  :title="favs.has(r.id) ? '取消收藏' : '收藏此境界'"
                  @click="toggleFav(r.id)"
                >{{ favs.has(r.id) ? '★' : '☆' }}</button>
              </div>

              <div class="sc-stage">{{ r.stage }}</div>

              <div class="sc-metrics">
                <div class="metric power">
                  <span>战力指数</span>
                  <b>{{ r.powerText }}</b>
                  <div class="m-bar"><i :style="{ width: (powerLevel(r) * 100) + '%' }" /></div>
                </div>
                <div class="metric life">
                  <span>寿元</span>
                  <b :class="{ infinite: r.life === -1 }">{{ r.lifeText }}</b>
                  <div class="m-bar"><i :style="{ width: (lifeLevel(r) * 100) + '%' }" /></div>
                </div>
              </div>

              <p class="sc-desc">{{ r.desc }}</p>

              <div class="sc-foot">
                <div class="gate"><span>突破条件</span>{{ r.gate }}</div>
                <div class="abilities">
                  <em v-for="a in r.ability" :key="a">{{ a }}</em>
                </div>
              </div>
            </div>
          </article>
        </template>
      </div>

      <div class="rt-end">
        <span>✦</span>
        <p>修行无止境。这个阶梯的尽头，也许只是下一个宇宙的起点。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { REALM_LADDER, REALM_TIERS, powerLevel } from '../data/realmTree.js'

const ladder = REALM_LADDER
const tiers = REALM_TIERS
const shellEl = ref(null)
const activeTier = ref(tiers[0].key)

// 收藏（本地持久化）
const STORE_KEY = 'ss_realm_favs'
const favs = ref(loadFavs())
const favMode = ref(false)
function loadFavs() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function saveFavs() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...favs.value]))
}
function toggleFav(id) {
  if (favs.value.has(id)) favs.value.delete(id)
  else favs.value.add(id)
  favs.value = new Set(favs.value)
  saveFavs()
}
function toggleFavMode() {
  if (favs.value.size === 0) return
  favMode.value = !favMode.value
}

function tierColor(key) {
  const t = tiers.find((x) => x.key === key)
  return t ? t.color : '#ffd479'
}
function groupLadder(key) {
  return ladder.filter((r) => r.tier === key)
}
function globalIndex(id) {
  return ladder.findIndex((r) => r.id === id)
}
function lifeLevel(r) {
  if (r.life === -1) return 1
  return Math.min(1, Math.max(0.04, Math.log10(r.life) / 8))
}

function scrollToTier(key) {
  activeTier.value = key
  const shell = shellEl.value
  const target = shell && shell.querySelector(`[data-tier="${key}"]`)
  if (target && shell) {
    shell.scrollTo({ top: target.offsetTop - shell.offsetTop - 96, behavior: 'smooth' })
  }
}

// 滚动同步高亮当前分组
function onScroll() {
  const shell = shellEl.value
  if (!shell) return
  const heads = shell.querySelectorAll('[data-tier]')
  let cur = tiers[0].key
  heads.forEach((h) => {
    if (h.getBoundingClientRect().top - shell.getBoundingClientRect().top < 160) {
      cur = h.dataset.tier
    }
  })
  activeTier.value = cur
}

onMounted(() => {
  shellEl.value && shellEl.value.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  shellEl.value && shellEl.value.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.rt-page { animation: rise .5s ease-out both; }

/* 概览 */
.rt-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.ov-cell {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--panel-line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ov-cell span { font-size: 11px; letter-spacing: 2px; color: var(--muted); }
.ov-cell b { font-size: 22px; color: var(--gold); letter-spacing: 1px; }
.ov-cell b i { font-size: 12px; font-style: normal; color: var(--muted); }
.ov-cell sup { font-size: 12px; }
.ov-cell.accent { align-items: flex-start; }
.fav-all {
  background: rgba(255,212,121,.08);
  border: 1px solid rgba(255,212,121,.32);
  color: var(--gold);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 1px;
  transition: .2s;
}
.fav-all:hover, .fav-all.on { background: rgba(255,212,121,.2); }

/* 分组锚点 */
.rt-tiers {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}
.rt-tier {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(140,170,255,.16);
  color: var(--text);
  cursor: pointer;
  transition: .2s;
  min-width: 120px;
  text-align: left;
}
.rt-tier i {
  width: 22px; height: 3px; border-radius: 2px;
  background: var(--tc);
  box-shadow: 0 0 10px var(--tc);
  margin-bottom: 3px;
}
.rt-tier span { font-size: 13px; letter-spacing: 1.5px; }
.rt-tier em { font-size: 9px; font-style: normal; letter-spacing: 2px; color: var(--muted); }
.rt-tier:hover { border-color: var(--tc); transform: translateY(-2px); }
.rt-tier.on { border-color: var(--tc); background: color-mix(in srgb, var(--tc) 12%, transparent); }

/* 刻度尺 */
.rt-scale { margin-bottom: 26px; padding-bottom: 18px; }
.scale-body { padding: 26px 22px 12px; }
.scale-track {
  position: relative;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #8fa0c8, #66e0ff, #a97bff, #ffd479, #ff6b81);
  opacity: .85;
}
.scale-tick {
  position: absolute;
  top: 50%;
  width: 10px; height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px currentColor;
  cursor: help;
}
.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 1px;
}

/* 阶梯 */
.rt-ladder { position: relative; }
.rt-group-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0 16px;
  scroll-margin-top: 100px;
}
.rt-group-head .gh-line {
  width: 4px; height: 20px; border-radius: 2px;
  background: var(--tc);
  box-shadow: 0 0 12px var(--tc);
}
.rt-group-head b { font-size: 17px; letter-spacing: 4px; color: var(--tc); }
.rt-group-head em { font-size: 11px; font-style: normal; letter-spacing: 2px; color: var(--muted); }

.rt-step {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  margin-left: calc(var(--step) * 22px);
  margin-bottom: 16px;
  transition: margin-left .3s;
}
.rt-step.hidden { display: none; }
.step-rail { position: relative; display: flex; flex-direction: column; align-items: center; }
.step-node {
  width: 40px; height: 40px; flex: 0 0 40px;
  display: grid; place-items: center;
  border-radius: 50%;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
  color: var(--tc);
  background: color-mix(in srgb, var(--tc) 14%, rgba(10,15,36,.9));
  border: 1px solid var(--tc);
  box-shadow: 0 0 14px color-mix(in srgb, var(--tc) 40%, transparent);
  z-index: 1;
}
.step-line {
  flex: 1; width: 1px;
  background: linear-gradient(180deg, var(--tc), transparent);
  opacity: .5;
  margin-top: 4px;
}
.rt-step:last-child .step-line { background: none; }

.step-card { padding: 16px 20px 18px; border-color: color-mix(in srgb, var(--tc) 22%, var(--panel-line)); }
.sc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.sc-title h3 { font-size: 19px; letter-spacing: 3px; color: var(--text); }
.sc-en { font-size: 10px; letter-spacing: 3px; color: var(--tc); opacity: .85; }
.fav-btn {
  background: none; border: none; cursor: pointer;
  font-size: 22px; color: var(--muted);
  line-height: 1; transition: .2s;
}
.fav-btn:hover { color: var(--gold); transform: scale(1.15); }
.fav-btn.on { color: var(--gold); text-shadow: 0 0 12px rgba(255,212,121,.6); }
.sc-stage {
  display: inline-block;
  margin: 8px 0 12px;
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--muted);
  border: 1px solid var(--panel-line);
  border-radius: 20px;
  padding: 3px 12px;
}
.sc-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px; }
.metric span { font-size: 11px; color: var(--muted); letter-spacing: 1.5px; display: block; }
.metric b {
  display: block; margin: 4px 0 7px;
  font-size: 18px; letter-spacing: 1px;
  font-family: ui-monospace, Consolas, monospace;
  color: var(--tc);
}
.metric.life b { color: #fff; }
.metric.life b.infinite { color: var(--gold); text-shadow: 0 0 12px rgba(255,212,121,.4); }
.m-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,.08); overflow: hidden; }
.m-bar i { display: block; height: 100%; border-radius: 2px; background: var(--tc); box-shadow: 0 0 8px var(--tc); transition: width .6s ease; }
.metric.life .m-bar i { background: linear-gradient(90deg, #66e0ff, var(--gold)); }
.sc-desc { font-size: 13px; line-height: 1.85; color: #c8d2ee; margin-bottom: 14px; }
.sc-foot {
  display: flex; flex-wrap: wrap; gap: 10px 22px;
  padding-top: 12px;
  border-top: 1px dashed var(--panel-line);
}
.gate { font-size: 12px; color: var(--muted); flex: 1 1 260px; }
.gate span { color: var(--tc); margin-right: 8px; letter-spacing: 1px; }
.abilities { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
.abilities em {
  font-size: 10.5px; font-style: normal;
  color: #cdd6f5;
  background: color-mix(in srgb, var(--tc) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--tc) 24%, transparent);
  border-radius: 20px; padding: 3px 10px;
}

.rt-end { text-align: center; margin: 40px 0 10px; color: var(--muted); }
.rt-end span { color: var(--gold); font-size: 22px; }
.rt-end p { margin-top: 8px; font-size: 12.5px; letter-spacing: 2px; }

@media (max-width: 720px) {
  .rt-overview { grid-template-columns: repeat(2, 1fr); }
  .rt-step { margin-left: calc(var(--step) * 6px); grid-template-columns: 40px 1fr; gap: 8px; }
  .step-node { width: 32px; height: 32px; flex-basis: 32px; font-size: 10px; }
  .sc-metrics { gap: 12px; }
  .metric b { font-size: 15px; }
  .rt-tier { min-width: 100px; }
}
</style>

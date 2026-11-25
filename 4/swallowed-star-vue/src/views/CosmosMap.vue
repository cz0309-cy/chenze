<template>
  <div class="page-shell" ref="shellEl">
    <SiteNav />

    <div class="page-inner cm-page">
      <header class="page-head">
        <div class="eyebrow">COSMIC SCALE ATLAS</div>
        <h1>宇宙尺度地图</h1>
        <p>从脚下的地球，一路拉远到银河系、宇宙海、混沌城与幽暗宇宙。点击下方层级放大聚焦，滚轮自由缩放，再点一次或按「返回全景」缩小——感受尺度一层层铺开。</p>
      </header>

      <!-- 层级路径 -->
      <div class="cm-path">
        <button class="path-node" :class="{ on: active === -1 }" @click="focus(-1)">
          <span class="pn-dot">◎</span>全景
        </button>
        <template v-for="(l, i) in layers" :key="l.id">
          <span class="path-arrow">›</span>
          <button
            class="path-node"
            :class="{ on: active === i, passed: i < active }"
            @click="focus(i)"
          >
            <span class="pn-dot">{{ i + 1 }}</span>{{ l.name }}
          </button>
        </template>
      </div>

      <!-- 星图舞台 -->
      <div class="cm-stage card" @wheel.prevent="onWheel">
        <CosmosScene :layers="layers" :active="active" :zoom="zoom" />

        <div class="stage-hud">
          <span class="hud-tag">{{ active === -1 ? 'OVERVIEW' : current.en }}</span>
          <span class="hud-scale">{{ active === -1 ? '可观测宇宙' : current.scale }}</span>
        </div>

        <div class="stage-tools">
          <button title="放大" @click="zoomIn">＋</button>
          <span>{{ Math.round(zoom * 100) }}%</span>
          <button title="缩小" @click="zoomOut">－</button>
          <button class="reset" title="重置缩放" @click="zoom = 1">⟲</button>
        </div>

        <div class="stage-hint" v-if="active === -1">
          <span>↑</span> 点击下方层级开始探索
        </div>

        <button v-if="active >= 0" class="back-btn" @click="focus(-1)">‹ 返回全景</button>
      </div>

      <!-- 层级卡片 -->
      <div class="cm-layers">
        <article
          v-for="(l, i) in layers"
          :key="l.id"
          class="cm-layer card"
          :class="{ on: active === i, dim: active >= 0 && active !== i }"
          :style="{ '--lc': l.color }"
          @click="focus(i)"
        >
          <div class="cl-index">{{ String(i + 1).padStart(2, '0') }}</div>
          <img class="cl-photo" :src="l.photo" :alt="l.name" />
          <div class="cl-body">
            <div class="cl-head">
              <h3>{{ l.name }}</h3>
              <span>{{ l.en }}</span>
            </div>
            <p>{{ l.desc }}</p>
            <div class="cl-facts">
              <span><i>尺度</i><b>{{ l.scale }}</b></span>
              <span><i>环境</i><b>{{ l.env }}</b></span>
              <span><i>危险度</i><b class="danger-txt">{{ '★'.repeat(l.danger) }}</b></span>
            </div>
          </div>
          <div class="cl-go">{{ active === i ? '✦ 聚焦中' : '点击放大 →' }}</div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import CosmosScene from '../components/CosmosScene.vue'
import { photoSrc } from '../data/photoMap.js'

const layers = [
  {
    id: 'earth', name: '地球', en: 'EARTH', shape: 'earth',
    color: '#66e0ff', color2: '#8fd6a0', camZ: 82, spin: 0.0007, danger: 1,
    scale: '直径约 1.27 万 km', env: '生命星球 · 大气层内', photo: photoSrc('地球'),
    desc: '一切故事的起点。蓝色星球上的基地市与荒野，藏着人类重新扎根的全部希望。'
  },
  {
    id: 'solar', name: '地球星域', en: 'SOLAR SYSTEM', shape: 'solar',
    color: '#66e0ff', color2: '#ffd479', camZ: 120, spin: 0.0006, danger: 1,
    scale: '太阳系 · 数百亿 km', env: '恒星系 · 虫洞航道', photo: photoSrc('地球星域'),
    desc: '以一个恒星为中心，行星沿轨道运行。虫洞航道就藏在这片星域的边缘，连接着更远的地方。'
  },
  {
    id: 'galaxy', name: '银河系', en: 'MILKY WAY', shape: 'galaxy',
    color: '#a97bff', color2: '#66e0ff', camZ: 170, spin: 0.0004, danger: 2,
    scale: '直径约 10 万光年', env: '旋涡星系 · 千亿恒星', photo: photoSrc('云雾星域'),
    desc: '千亿颗恒星组成巨大旋臂。人类疆域只是其中一角，而云雾星域的训练星，就散落在这片旋臂之间。'
  },
  {
    id: 'empire', name: '黑龙山星域', en: 'BLACK DRAGON', shape: 'cluster',
    color: '#ffd479', color2: '#ff8a5c', camZ: 140, spin: 0.0005, danger: 3,
    scale: '跨星系帝国疆域', env: '帝国星域 · 舰队巡弋', photo: photoSrc('黑龙山星域'),
    desc: '黑龙山帝国的心脏地带，星港林立、舰队如织。通行证比武器更贵，一句话就能让星域戒严。'
  },
  {
    id: 'ocean', name: '宇宙海', en: 'COSMIC OCEAN', shape: 'ocean',
    color: '#66e0ff', color2: '#a97bff', camZ: 195, spin: 0.0003, danger: 5,
    scale: '宇宙边界 · 无垠之海', env: '本源潮汐 · 法则尽头', photo: photoSrc('宇宙海'),
    desc: '宇宙的尽头，也是一切法则的源头。这里没有航线，只有意志能决定你能游多远。'
  },
  {
    id: 'chaos', name: '混沌城', en: 'CHAOS CITY', shape: 'grid',
    color: '#ffd479', color2: '#fff2c8', camZ: 130, spin: 0.0004, danger: 4,
    scale: '悬浮圣城 · 九碑林立', env: '人类最高修行圣地', photo: photoSrc('混沌城'),
    desc: '悬浮在宇宙中的巨型城池。中心九座混沌碑，每一座都刻着一条通往法则顶点的路。'
  },
  {
    id: 'dark', name: '幽暗宇宙', en: 'DARK UNIVERSE', shape: 'dark',
    color: '#ff6b81', color2: '#a97bff', camZ: 210, spin: 0.0003, danger: 5,
    scale: '并行位面 · 法则残缺', env: '吞光之域 · 不建议进入', photo: photoSrc('幽暗宇宙'),
    desc: '与人类宇宙并存的黑暗位面。光会被吞掉，声音传不出去。进入名单很长，回来的名单很短。'
  }
]

const active = ref(-1)
const zoom = ref(1)
const shellEl = ref(null)
const current = computed(() => (active.value >= 0 ? layers[active.value] : layers[0]))

function focus(i) {
  if (active.value === i) {
    // 再点当前层 → 缩回全景
    active.value = -1
    zoom.value = 1
    return
  }
  active.value = i
  zoom.value = 1
}
function onWheel(e) {
  const next = zoom.value + (e.deltaY > 0 ? 0.1 : -0.1)
  zoom.value = Math.min(2.2, Math.max(0.45, Number(next.toFixed(2))))
}
function zoomIn() { zoom.value = Math.max(0.45, Number((zoom.value - 0.15).toFixed(2))) }
function zoomOut() { zoom.value = Math.min(2.2, Number((zoom.value + 0.15).toFixed(2))) }
</script>

<style scoped>
.cm-page { animation: rise .5s ease-out both; }

/* 层级路径 */
.cm-path {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
  margin-bottom: 16px;
}
.path-node {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 11px; border-radius: 20px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(140,170,255,.16);
  color: var(--muted); font-size: 12px; letter-spacing: 1px;
  cursor: pointer; transition: .2s;
}
.path-node .pn-dot {
  width: 18px; height: 18px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 10px; font-family: ui-monospace, Consolas, monospace;
  background: rgba(140,170,255,.12);
}
.path-node:hover { border-color: var(--cyan); color: var(--text); }
.path-node.on { border-color: var(--gold); color: var(--gold); background: rgba(255,212,121,.1); }
.path-node.on .pn-dot { background: rgba(255,212,121,.25); }
.path-node.passed { color: #b9c6ee; }
.path-arrow { color: var(--muted); font-size: 16px; padding: 0 2px; }

/* 舞台 */
.cm-stage {
  position: relative;
  height: 460px;
  overflow: hidden;
  margin-bottom: 24px;
  background: radial-gradient(circle at 50% 50%, rgba(30,42,90,.5), rgba(4,6,15,.9) 70%);
}
.stage-hud {
  position: absolute; top: 16px; left: 18px;
  display: flex; flex-direction: column; gap: 4px;
  pointer-events: none;
}
.hud-tag {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 11px; letter-spacing: 3px; color: var(--cyan);
}
.hud-scale { font-size: 12px; color: var(--muted); letter-spacing: 1px; }
.stage-tools {
  position: absolute; top: 16px; right: 18px;
  display: flex; align-items: center; gap: 6px;
  background: rgba(10,15,36,.6);
  border: 1px solid var(--panel-line);
  border-radius: 10px; padding: 5px 8px;
  backdrop-filter: blur(8px);
}
.stage-tools button {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid var(--panel-line);
  background: rgba(255,255,255,.04); color: var(--text);
  cursor: pointer; font-size: 16px; line-height: 1; transition: .2s;
}
.stage-tools button:hover { border-color: var(--gold); color: var(--gold); }
.stage-tools button.reset { font-size: 14px; }
.stage-tools span {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 11px; color: var(--muted); min-width: 42px; text-align: center;
}
.stage-hint {
  position: absolute; bottom: 20px; left: 0; right: 0;
  text-align: center; font-size: 12px; color: var(--muted); letter-spacing: 2px;
  pointer-events: none;
}
.stage-hint span { display: block; color: var(--gold); font-size: 18px; margin-bottom: 4px; animation: bob 1.8s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
.back-btn {
  position: absolute; bottom: 16px; left: 18px;
  padding: 7px 14px; border-radius: 8px;
  background: rgba(10,15,36,.7); border: 1px solid var(--panel-line);
  color: var(--text); font-size: 12px; letter-spacing: 1px; cursor: pointer; transition: .2s;
}
.back-btn:hover { border-color: var(--gold); color: var(--gold); }

/* 层级卡片 */
.cm-layers { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
.cm-layer {
  display: grid; grid-template-columns: 34px 90px 1fr;
  gap: 12px; padding: 14px;
  cursor: pointer; transition: .25s;
  position: relative;
}
.cm-layer:hover { transform: translateY(-3px); border-color: var(--lc); }
.cm-layer.on { border-color: var(--lc); box-shadow: 0 0 0 1px var(--lc), 0 12px 34px rgba(0,0,0,.4); }
.cm-layer.dim { opacity: .55; }
.cl-index {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 15px; color: var(--lc); opacity: .8; padding-top: 2px;
}
.cl-photo {
  width: 90px; height: 90px; object-fit: cover;
  border-radius: 10px; border: 1px solid color-mix(in srgb, var(--lc) 30%, transparent);
}
.cl-body { min-width: 0; }
.cl-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.cl-head h3 { font-size: 16px; letter-spacing: 2px; color: var(--text); }
.cl-head span { font-size: 9px; letter-spacing: 2px; color: var(--lc); opacity: .8; }
.cl-body p {
  font-size: 11.5px; line-height: 1.7; color: var(--muted);
  margin: 6px 0 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cl-facts { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.cl-facts span { font-size: 10.5px; color: #c8d2ee; }
.cl-facts i { font-style: normal; color: var(--muted); margin-right: 4px; }
.cl-go {
  position: absolute; right: 14px; bottom: 12px;
  font-size: 10px; letter-spacing: 1px; color: var(--lc); opacity: .75;
}

@media (max-width: 720px) {
  .cm-stage { height: 360px; }
  .cm-layer { grid-template-columns: 26px 64px 1fr; gap: 8px; }
  .cl-photo { width: 64px; height: 64px; }
  .path-node { padding: 5px 8px; font-size: 11px; }
}
</style>

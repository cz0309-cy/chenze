<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">CHARACTER ARCHIVE</div>
        <h1>人物档案</h1>
        <p>星海里的每一个人，都是一段被逼出来的历史。这里记录他们的来路、执念，以及代价。</p>
      </header>

      <div class="chr-tabs">
        <button
          v-for="c in CHARACTERS"
          :key="c.id"
          class="chr-tab"
          :class="{ on: c.id === currentId }"
          @click="currentId = c.id"
        >
          <span class="gt">{{ c.glyph }}</span>
          {{ c.name }}
        </button>
      </div>

      <div :key="current.id" class="chr-layout">
        <!-- 档案卡 -->
        <aside class="card chr-card">
          <div class="chr-photo">
            <span class="chr-glyph">{{ current.glyph }}</span>
            <span class="scan" />
            <i class="corner c1" /><i class="corner c2" /><i class="corner c3" /><i class="corner c4" />
          </div>
          <div class="chr-card-body">
            <div class="row"><span>NAME</span><b>{{ current.en }}</b></div>
            <div class="row"><span>REALM</span><b>{{ current.realm }}</b></div>
            <div class="row"><span>CAMP</span><b>{{ current.camp }}</b></div>
            <div class="row"><span>STATUS</span><b class="ok">在册</b></div>
          </div>
        </aside>

        <!-- 主信息 -->
        <section class="chr-main">
          <div class="chr-title">
            <h2>{{ current.name }}</h2>
            <span class="chr-sub">{{ current.title }}</span>
          </div>

          <div class="chip-row chr-tags">
            <em v-for="t in current.tags" :key="t">{{ t }}</em>
          </div>

          <blockquote class="chr-quote">{{ current.quote }}</blockquote>

          <div class="chr-intro">
            <p v-for="(p, i) in current.intro" :key="i">{{ p }}</p>
          </div>

          <div class="chr-stats">
            <div v-for="s in current.stats" :key="s.label" class="stat">
              <div class="st-top">
                <span>{{ s.label }}</span>
                <b>{{ s.value }}</b>
              </div>
              <div class="st-bar"><i :style="{ width: s.value + '%' }" /></div>
            </div>
          </div>

          <div class="chr-ability">
            <span class="bl">能力体系</span>
            <div class="chip-row">
              <em v-for="a in current.ability" :key="a">{{ a }}</em>
            </div>
          </div>
        </section>
      </div>

      <div class="chr-bottom">
        <section class="card">
          <div class="card-head">
            <h3>关键节点</h3>
            <span>TIMELINE</span>
          </div>
          <div class="chr-timeline">
            <div v-for="(t, i) in current.timeline" :key="i" class="tl">
              <span class="tl-year">{{ t.year }}</span>
              <div class="tl-body">
                <h5>{{ t.title }}</h5>
                <p>{{ t.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-head">
            <h3>关系网络</h3>
            <span>RELATIONS</span>
          </div>
          <ul class="relation-list">
            <li v-for="r in current.relations" :key="r">
              <span class="rl-dot" />{{ r }}
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { CHARACTERS } from '../data/lore.js'

const currentId = ref('luofeng')
const current = computed(() => CHARACTERS.find((c) => c.id === currentId.value) || CHARACTERS[0])
</script>

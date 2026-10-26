<template>
  <div class="page-shell">
    <SiteNav />

    <div class="page-inner">
      <header class="page-head">
        <div class="eyebrow">EXOTIC MERCHANDISE</div>
        <h1>奇物交易</h1>
        <p>从一柄战刀到一段传承，星海里的每样东西都有价——只是有些价格，不写在标签上。</p>
      </header>

      <div class="mk-toolbar">
        <div class="chips">
          <button
            v-for="c in cats"
            :key="c"
            class="chip"
            :class="{ on: cat === c }"
            @click="cat = c"
          >
            {{ c }}
          </button>
        </div>
        <div class="wallet">
          <span>账户余额</span>
          <b>{{ balance.toLocaleString() }}</b>
          <i>宇宙币</i>
        </div>
      </div>

      <div class="mk-layout">
        <div class="mk-grid">
          <article
            v-for="g in list"
            :key="keyOf(g)"
            class="good-card card"
            :class="{ inCart: cart.includes(keyOf(g)) }"
          >
            <div class="good-top">
              <span class="good-glyph" :style="rarityStyle(g.rarity)">{{ g.glyph }}</span>
              <span class="rarity" :style="rarityStyle(g.rarity)">{{ g.rarity }}</span>
            </div>
            <h4>{{ g.name }}</h4>
            <div class="good-cat">{{ g.cat }} · {{ g.seller }}</div>
            <p>{{ g.desc }}</p>
            <div class="good-foot">
              <div class="price">
                <b v-if="g.price !== null">{{ g.price.toLocaleString() }}</b>
                <b v-else class="ask">面议</b>
                <i>{{ g.unit }}</i>
              </div>
              <button
                v-if="g.price !== null"
                class="btn-mini"
                :class="{ added: cart.includes(keyOf(g)) }"
                @click="toggle(g)"
              >
                {{ cart.includes(keyOf(g)) ? '已加入' : '加入采购' }}
              </button>
              <button v-else class="btn-mini ghost" @click="ask(g)">询价</button>
            </div>
            <div class="stock">库存 {{ g.stock > 0 ? g.stock : '—' }}{{ g.hot ? ' · 热门' : '' }}</div>
          </article>
        </div>

        <aside class="card cart">
          <div class="card-head">
            <h3>采购清单</h3>
            <span>{{ cart.length }} 件</span>
          </div>

          <ul v-if="cartItems.length" class="cart-list">
            <li v-for="g in cartItems" :key="keyOf(g)">
              <span class="cg">{{ g.glyph }}</span>
              <div class="ci">
                <b>{{ g.name }}</b>
                <span>{{ g.cat }}</span>
              </div>
              <span class="cp">{{ g.price.toLocaleString() }}</span>
              <button class="rm" @click="toggle(g)">×</button>
            </li>
          </ul>
          <div v-else class="cart-empty">
            <span>◇</span>
            清单还是空的。星海很大，先挑一件称手的。
          </div>

          <div class="cart-total">
            <span>合计</span>
            <b>{{ total.toLocaleString() }} <i>宇宙币</i></b>
          </div>
          <button class="btn-gold" :disabled="!cart.length" @click="checkout">确认结算</button>
          <p class="cart-tip">演示交易：不产生真实扣款，余额仅存于当前页面。</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import { GOODS } from '../data/lore.js'
import { fetchLore } from '../api/lore.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

// 优先使用后台管理的数据；后端不可用时兜底本地 lore.js
const goods = ref([...GOODS])
const cats = ref(['全部', ...new Set(GOODS.map((g) => g.cat))])
// 后台新增的货品若未填图标/分类，给出兜底，避免前台显示空白
function normalize(list) {
  return list.map((g) => ({
    ...g,
    glyph: g.glyph || '◈',
    cat: g.cat || '未分类',
    seller: g.seller || '匿名卖家',
    unit: g.unit || '宇宙币',
    stock: Number(g.stock) || 0,
    price: g.price === null || g.price === undefined || g.price === '' ? null : Number(g.price)
  }))
}

onMounted(async () => {
  try {
    const res = await fetchLore('goods')
    const arr = res.data
    if (Array.isArray(arr) && arr.length) {
      goods.value = normalize(arr)
      cats.value = ['全部', ...new Set(goods.value.map((g) => g.cat))]
    }
  } catch {
    /* 静默降级为本地数据 */
  }
})

const cat = ref('全部')
const balance = ref(500000)
const cart = ref([])

const list = computed(() =>
  cat.value === '全部' ? goods.value : goods.value.filter((g) => g.cat === cat.value)
)
// 以货品编号作为唯一键（后台可能新增同名货品）
const keyOf = (g) => g.id || g.name

const cartItems = computed(() => goods.value.filter((g) => cart.value.includes(keyOf(g))))
const total = computed(() =>
  cartItems.value.reduce((sum, g) => sum + (g.price === null ? 0 : g.price), 0)
)

const RARITY = {
  传说: '#ffd479',
  史诗: '#a97bff',
  稀有: '#66e0ff',
  精良: '#7ee0b8'
}

function rarityStyle(r) {
  const c = RARITY[r] || '#8b98bf'
  return { color: c, borderColor: c + '66', background: c + '14' }
}

function toggle(g) {
  const k = keyOf(g)
  const i = cart.value.indexOf(k)
  if (i >= 0) {
    cart.value.splice(i, 1)
    show(`已从清单移除「${g.name}」`)
  } else {
    cart.value.push(k)
    show(`已加入「${g.name}」`, 'ok')
  }
}

function ask(g) {
  show(`已向「${g.seller}」发送询价：${g.name}`)
}

function checkout() {
  if (!cart.value.length) return
  if (total.value > balance.value) {
    show('余额不足，宇宙币可不会凭空长出来', 'err')
    return
  }
  balance.value -= total.value
  show(`结算成功，共 ${total.value.toLocaleString()} 宇宙币`, 'ok')
  cart.value = []
}
</script>

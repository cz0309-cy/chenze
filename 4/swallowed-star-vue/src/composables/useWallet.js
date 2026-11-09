// 统一的宇宙币钱包：奇物交易（购买）与意识修炼（修炼/突破）共用同一份余额
// 用途：避免两个页面各记一份账，导致「买东西扣的钱」和「修炼扣的钱」对不上
// 存储：localStorage（刷新不丢），后端暂无钱包接口，故为纯前端记账
import { ref, watch } from 'vue'

const STORE_KEY = 'ss_coins'
const DEFAULT_COINS = 500000

function loadCoins() {
  const raw = localStorage.getItem(STORE_KEY)
  if (raw === null) return DEFAULT_COINS
  const v = Number(raw)
  return Number.isFinite(v) && v >= 0 ? v : DEFAULT_COINS
}

// 模块级单例：同一页面里多处 useWallet() 拿到的是同一个 ref
const coins = ref(loadCoins())

watch(coins, (v) => {
  localStorage.setItem(STORE_KEY, String(v))
})

export function useWallet() {
  function canPay(amount) {
    return coins.value >= Number(amount)
  }

  // 扣款：余额不足返回 false 且不做任何修改
  function spend(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0))
    if (coins.value < n) return false
    coins.value -= n
    return true
  }

  function earn(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0))
    coins.value += n
  }

  return { coins, canPay, spend, earn }
}

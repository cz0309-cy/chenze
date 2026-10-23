// 前台星域设定数据只读接口（与 lore.js 数据结构一致）
import { request } from './http.js'

/**
 * 拉取某个模块的数据
 * @param {string} module regions|civs|goods|realms|arts|characters
 * @returns {Promise<Array>} 数据数组
 */
export function fetchLore(module) {
  return request('GET', '/lore/' + module)
}

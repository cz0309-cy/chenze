// 首页数据接口：聚合展示 / 检索 / 条目详情
import { request } from './http.js'

/** 首页聚合数据：统计、分类、热词、推荐条目 */
export function fetchOverview() {
  return request('GET', '/home/overview')
}

/**
 * 检索 / 分页列表
 * @param {{keyword?:string, category?:string, sort?:string, page?:number, size?:number}} params
 */
export function fetchEntries({ keyword = '', category = '全部', sort = '', page = 1, size = 12 } = {}) {
  const qs = new URLSearchParams()
  if (keyword) qs.set('keyword', keyword)
  if (category && category !== '全部') qs.set('category', category)
  if (sort) qs.set('sort', sort)
  qs.set('page', String(page))
  qs.set('size', String(size))
  return request('GET', '/home/entries?' + qs.toString())
}

/** 条目详情（后端会累加浏览次数） */
export function fetchEntry(id) {
  return request('GET', '/home/entries/' + id)
}

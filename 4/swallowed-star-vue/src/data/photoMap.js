/**
 * 写实照片映射：条目名称 → public/photos 下的照片文件
 * 人物 = 人物照片；星球 / 星域 / 秘境 = 地区照片；碑 / 舰队 / 势力 = 对应写实照片
 * 只提供映射，不改动任何数据字段；找不到时由调用方回退原 emoji
 */
const PHOTO_MAP = {
  // ===== 星域首页 17 条档案 =====
  罗峰: 'luofeng.jpg',          // 人物
  巴巴塔: 'babata.jpg',         // 人物（智能生命）
  徐欣: 'xuxin.jpg',            // 人物
  陨墨星主: 'yunmo.jpg',        // 人物
  雷神: 'leishen.jpg',          // 人物
  地球: 'earth.jpg',            // 地区
  云雾星: 'cloudplanet.jpg',    // 地区
  幽暗宇宙: 'darkuniverse.jpg', // 地区
  混沌城: 'chaoscity.jpg',      // 地区
  宇宙海: 'cosmicocean.jpg',    // 地区
  混沌碑: 'chaoste.jpg',        // 器物 / 碑
  时空法则: 'spacetime.jpg',    // 法则
  意识能量: 'consciousness.jpg',// 法则
  虚拟宇宙公司: 'virtualcorp.jpg',
  黑龙山帝国: 'blackdragon.jpg',
  虫族: 'zerg.jpg',
  机械族: 'machine.jpg',

  // ===== 星海探索 7 星域 =====
  地球星域: 'earth.jpg',
  虫洞航道: 'wormhole.jpg',
  云雾星域: 'cloudplanet.jpg',
  黑龙山星域: 'blackdragon.jpg',

  // ===== 文明图鉴 9 条 =====
  地球人类: 'earth.jpg',
  乾巫宇宙国: 'qianwu.jpg',
  星空巨兽联盟: 'starbeast.jpg',
  未名者: 'nameless.jpg',
  幽暗宇宙·未名者: 'nameless.jpg'
}

/** 根据名称取照片路径，未映射返回空串 */
export function photoSrc(name) {
  if (!name) return ''
  const file = PHOTO_MAP[name]
  return file ? `/photos/${file}` : ''
}

export default PHOTO_MAP

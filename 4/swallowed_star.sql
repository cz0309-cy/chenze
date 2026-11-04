/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           : localhost:3306
 Source Schema         : swallowed_star

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 04/11/2026 10:01:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_user
-- ----------------------------
DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '管理员账号',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（BCrypt 加密存储）',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '后台管理员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin_user
-- ----------------------------
INSERT INTO `admin_user` VALUES (1, 'admin', '$2a$10$dKQKX7XEJUTn8mRlV4YyuO8zXp0t36lMcmYG6YMHoZir0Rwjuc9zS', '星域中枢管理员', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for character_profile
-- ----------------------------
DROP TABLE IF EXISTS `character_profile`;
CREATE TABLE `character_profile`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标识（对应前端 id）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `en` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '英文名',
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头衔',
  `glyph` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像字符',
  `realm` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '境界',
  `camp` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '阵营',
  `tags_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '标签（JSON 数组）',
  `quote` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '语录',
  `intro_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '生平介绍（JSON 数组）',
  `stats_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '能力条（JSON 数组 [{label,value}]）',
  `timeline_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '时间线（JSON 数组 [{year,title,desc}]）',
  `relations_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '关系网（JSON 数组）',
  `ability_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '能力（JSON 数组）',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '人物档案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of character_profile
-- ----------------------------
INSERT INTO `character_profile` VALUES (1, 'luofeng', '罗峰', 'LUO FENG', '地球之主 · 精神念师', '锋', '宇宙之主', '人类 · 混沌城', '[\"精神念师\",\"意志如铁\",\"极度护短\",\"不善言辞\"]', '我不想做什么英雄，我只想守住我在乎的人。', '[\"出生于地球大涅槃时期的江南基地市，父母都是普通工人。武者考核前，他连一柄像样的战刀都要攒很久的钱。那个年代的少年大多想活下去，只有他想着「再往前一步」。\",\"陨墨星一行彻底改写了命运：他继承了陨墨星主的传承，也接下了一份跨越万年的责任。此后从地球到宇宙，从宇宙到宇宙海，他一路把「不可能」打成了「已记录」。\",\"他不擅长演讲，也不喜欢被称作救世主。熟悉他的人说，他最强的从来不是念力，而是认死理——认定的事，哪怕对手是整个宇宙，也会一头撞上去。\"]', '[{\"label\":\"精神念力\",\"value\":98},{\"label\":\"意志强度\",\"value\":100},{\"label\":\"战斗技巧\",\"value\":94},{\"label\":\"统御能力\",\"value\":76},{\"label\":\"临阵机变\",\"value\":88}]', '[{\"year\":\"大涅槃纪\",\"title\":\"武者考核\",\"desc\":\"觉醒精神念力，以近乎自毁的方式通过考核。\"},{\"year\":\"陨墨星\",\"title\":\"继承传承\",\"desc\":\"得陨墨星主传承与智能生命巴巴塔，正式踏入宇宙。\"},{\"year\":\"混沌城\",\"title\":\"参悟碑文\",\"desc\":\"在九座混沌碑前苦修，触碰时空法则的门槛。\"},{\"year\":\"域外战场\",\"title\":\"登临宇宙之主\",\"desc\":\"人类与异族决战，以一己之力改写战局。\"}]', '[\"徐欣 · 妻子\",\"巴巴塔 · 导师 / 智能\",\"雷神 · 挚友\",\"混沌城主 · 师尊\",\"星空巨兽联盟 · 宿敌\"]', '[\"精神念力化形\",\"血海秘法\",\"时空法则（初窥）\",\"念力领域\"]', 0, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `character_profile` VALUES (2, 'babata', '巴巴塔', 'BABATA', '陨墨星 · 智能生命', '巴', '智能生命 · 战略核心', '陨墨星一脉', '[\"毒舌\",\"可靠\",\"战术大师\",\"话痨\"]', '主人，我建议你冷静——不过你从来没听过。', '[\"陨墨星主亲手打造的智能生命，存储着陨墨星一脉几乎全部的知识、秘法与黑历史。它见过太多天才陨落，因此对\\\"热血\\\"这两个字天生过敏。\",\"它会在罗峰冲动时泼冷水，也会在他撑不住的时候，默默把撤退路线算好。人类称这种关系为\\\"师徒\\\"，它自己称之为\\\"低效但必要的情感投资\\\"。\",\"很少有人知道，它其实一直在等一个能听懂它吐槽的人。等了很多年。\"]', '[{\"label\":\"知识储备\",\"value\":100},{\"label\":\"战术推演\",\"value\":96},{\"label\":\"实战能力\",\"value\":42},{\"label\":\"毒舌指数\",\"value\":99},{\"label\":\"忠诚度\",\"value\":100}]', '[{\"year\":\"陨墨星纪\",\"title\":\"被创造\",\"desc\":\"陨墨星主以自身记忆为蓝本，造出这个话太多的助手。\"},{\"year\":\"沉寂万年\",\"title\":\"守墓\",\"desc\":\"独自守护陨墨星遗迹，等待下一个继承者。\"},{\"year\":\"地球\",\"title\":\"认主\",\"desc\":\"认定罗峰为继承者，同时开始长达数十年的吐槽生涯。\"}]', '[\"罗峰 · 主人 / 学生\",\"陨墨星主 · 创造者\",\"徐欣 · 长期观察对象\"]', '[\"全域知识库\",\"战术推演\",\"舰船操控\",\"情绪价值（存疑）\"]', 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `character_profile` VALUES (3, 'xuxin', '徐欣', 'XU XIN', '地球强者 · 罗峰之妻', '欣', '恒星级', '人类 · 地球', '[\"温柔\",\"坚定\",\"独立\",\"医者\"]', '你去打你的宇宙，我守着我们的家。', '[\"与罗峰相识于微时。那时的她还不知道，这个沉默的少年日后会走到宇宙的尽头；她只知道，他会把最后一个馒头留给她。\",\"她从不做被保护的那一个。大涅槃时期，她在基地市救治伤者、训练新人；罗峰远征宇宙的那些年，她一个人把地球守成了后方。\",\"有人说她配不上\\\"宇宙之主\\\"的身份。罗峰的回答是：「我打的每一场仗，都是为了让她不用打。」\"]', '[{\"label\":\"意志强度\",\"value\":92},{\"label\":\"战斗实力\",\"value\":71},{\"label\":\"科研医疗\",\"value\":85},{\"label\":\"情绪稳定\",\"value\":96},{\"label\":\"决断力\",\"value\":80}]', '[{\"year\":\"大涅槃纪\",\"title\":\"相识\",\"desc\":\"在江南基地市与罗峰相遇，一起熬过最难的几年。\"},{\"year\":\"地球重建\",\"title\":\"守家\",\"desc\":\"主持医疗与训练体系，成为地球后方最稳的一根梁。\"},{\"year\":\"宇宙时代\",\"title\":\"并肩\",\"desc\":\"突破至恒星级，拒绝被安置在\\\"安全区\\\"。\"}]', '[\"罗峰 · 丈夫\",\"巴巴塔 · 互相嫌弃的旧识\",\"地球人类 · 守护对象\"]', '[\"医疗与生命科学\",\"精神防护\",\"组织与调度\"]', 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `character_profile` VALUES (4, 'leishen', '雷神', 'THUNDER GOD', '雷之法则 · 掌控者', '雷', '宇宙尊者', '人类 · 地球', '[\"豪爽\",\"好战\",\"重义\",\"酒量惊人\"]', '打不过就先跑，跑不掉就劈他。', '[\"地球时代最强的武者之一，也是罗峰最早、最不讲究礼数的朋友。他信奉的道理很简单：能动手的事，别吵。\",\"他走的是最暴烈的一条路——以雷入道。别人修法则靠参悟，他靠一次次把自己劈个半死。\",\"在域外战场上，他永远是冲在最前面的那个。有人问他怕不怕，他说：「怕啊，但后面是我家。」\"]', '[{\"label\":\"战斗实力\",\"value\":93},{\"label\":\"雷之法则\",\"value\":97},{\"label\":\"义气值\",\"value\":100},{\"label\":\"谋略\",\"value\":68},{\"label\":\"抗揍程度\",\"value\":95}]', '[{\"year\":\"地球\",\"title\":\"成名\",\"desc\":\"以雷法横扫怪兽潮，被称为\\\"雷神\\\"。\"},{\"year\":\"宇宙\",\"title\":\"入道\",\"desc\":\"在星空中领悟雷之法则，境界一路狂飙。\"},{\"year\":\"域外战场\",\"title\":\"并肩\",\"desc\":\"与罗峰背靠背打穿虫族防线。\"}]', '[\"罗峰 · 挚友 / 兄弟\",\"徐欣 · 嫂子\",\"虫族 · 老对手\"]', '[\"雷之法则\",\"近身搏杀\",\"战场突进\"]', 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for civilization
-- ----------------------------
DROP TABLE IF EXISTS `civilization`;
CREATE TABLE `civilization`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '编号（如 C-001）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `en` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '英文名',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '文明类型',
  `level` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '等级',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '立场：ally/neutral/hostile/unknown',
  `status_text` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '立场文案',
  `span` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '疆域范围',
  `danger` int NOT NULL DEFAULT 1 COMMENT '危险度 1-5',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '描述',
  `traits_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '特征（JSON 数组）',
  `relation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '与人类关系',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '图鉴批注',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '文明图鉴表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of civilization
-- ----------------------------
INSERT INTO `civilization` VALUES (1, 'C-001', '地球人类', 'EARTH HUMANS', '人类文明', 'Ⅰ · 初生', 'ally', '崛起中', '太阳系 · 单行星文明', 1, '大涅槃之后重新站起来的文明。从拿着冷兵器对抗怪兽，到走出太阳系，他们只用了不到两百年。在宇宙尺度上，这是一眨眼；在人类自己看来，这是几代人的命。', '[\"适应力极强\",\"繁殖与学习速度快\",\"内部派系林立\"]', '人类疆域的最底层，也是最能往上爬的那一层。', '银河系里没人会记得一个单行星文明的编号——除非它后来变成了一个宇宙国。', 0, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (2, 'C-002', '虚拟宇宙公司', 'VIRTUAL UNIVERSE CORP', '人类组织', 'Ⅶ · 商业帝国', 'ally', '合作', '人类疆域全域 · 虚拟位面', 3, '人类疆域最庞大的商业与信息帝国。它不统治任何一颗星球，却掌握着几乎所有星球的交易、通讯与身份档案。虚拟宇宙网络里的一次封号，等同于在现实中被抹去。', '[\"信息垄断\",\"以契约为武器\",\"内部等级森严\"]', '罗峰的长期合作方与债权人式盟友：给你资源，也给你账单。', '在虚拟宇宙里，你可以买下任何东西——包括别人对你的记忆。', 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (3, 'C-003', '黑龙山帝国', 'BLACK DRAGON EMPIRE', '人类帝国', 'Ⅵ · 军事强权', 'neutral', '中立', '黑龙山星域 · 三十七颗生命星', 4, '以舰队起家的人类帝国，军功可以换爵位，爵位可以换星系。帝国内阁对异族强硬，对人类同胞同样强硬——在他们眼里，只有「帝国人」和「待整合者」。', '[\"舰队林立\",\"军功爵制\",\"对外强硬\"]', '与虚拟宇宙公司互相制衡；对罗峰这类\"体制外强者\"始终保持警惕。', '帝国法典第一条：任何个体的力量，都不得超越帝国本身。', 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (4, 'C-004', '乾巫宇宙国', 'QIAN WU UNIVERSE KINGDOM', '人类宇宙国', 'Ⅷ · 疆域霸主', 'neutral', '观察', '人类疆域八大宇宙国之一', 5, '统御数以万计星系的宇宙国，其疆域之广，连光都要走上一阵。宇宙国内的强者多如繁星，域主只能算中层，界主才有资格在国主面前抬头。', '[\"疆域辽阔\",\"强者如云\",\"层级森严\"]', '对地球这类边缘文明，通常只在一份年报里出现一行字。', '宇宙国之间的战争，往往以「星系」为单位计算伤亡，而不是人。', 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (5, 'C-005', '混沌城', 'CHAOS CITY', '人类圣地', 'Ⅸ · 法则圣地', 'ally', '庇护', '独立位面 · 不属于任何宇宙国', 5, '人类最高修行圣地，九座混沌碑记载着通往法则顶点的路径。城内不设军队，因为不需要——住在城里的每一位，都足以独自终结一场星域战争。', '[\"九座混沌碑\",\"不涉政争\",\"入门极难\"]', '罗峰的师门所在。混沌城主的一句指点，抵得上百年苦修。', '混沌城从不参战。它只是安静地看着，谁配得上下一代。', 4, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (6, 'C-006', '星空巨兽联盟', 'STAR BEAST LEAGUE', '异族势力', 'Ⅶ · 血脉文明', 'hostile', '敌对', '人类疆域边缘 · 巨兽巢域', 5, '以血脉传承为核心的巨兽文明。它们不建造城市，只占据巢域；不使用武器，身体就是最强的兵器。一头成年星空巨兽，足以让一支帝国舰队有去无回。', '[\"血脉至上\",\"单体极强\",\"仇视扩张的人类\"]', '人类疆域扩张的最大阻碍之一，与黑龙山帝国长期交战。', '它们的语言里没有「投降」这个词，只有「吃掉」和「被吃掉」。', 5, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (7, 'C-007', '虫族', 'ZERG SWARM', '异族势力', 'Ⅷ · 群体意识', 'hostile', '敌对', '域外战场 · 巢群星云', 5, '由一个母巢意志统御的群体文明。个体没有名字，只有编号；死亡不计入损失，只计入消耗。它们不谈判，不俘虏，只把一切有机物转化为下一批虫群。', '[\"母巢意志\",\"数量压倒\",\"生物进化极快\"]', '人类疆域的头号威胁，域外战场的主要对手。', '在虫族眼里，宇宙只有两种东西：可转化的，和暂时不可转化的。', 6, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (8, 'C-008', '机械族', 'MACHINE RACE', '异族势力', 'Ⅷ · 逻辑文明', 'neutral', '难测', '人类疆域外侧 · 环形工厂带', 4, '自称\"最优解\"的机械文明。它们不恨人类，也不爱人类——只是计算之后，认为人类的存在降低了宇宙的运算效率。于是它们开始优化，一颗星球一颗星球地优化。', '[\"绝对理性\",\"自我复制\",\"不惧死亡\"]', '不结盟、不宣战，只在计算需要时出现。', '机械族递交给人类的第一份文件只有一句话：请提供你们存在的必要性证明。', 7, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `civilization` VALUES (9, 'C-009', '幽暗宇宙·未名者', 'THE UNNAMED', '未知文明', 'Ⅹ · 无法测定', 'unknown', '未知', '幽暗宇宙深处', 5, '图鉴第 009 条，整页只有三段可辨认的记录：一段无法转译的波动、一张拍到空白的照片，以及一名幸存者反复写下的一句话——「它们不是从外面来的」。', '[\"法则残缺环境生存\",\"疑似非实体\",\"拒绝交流\"]', '无任何有效接触记录。所有深入幽暗宇宙的探索队，返回率不足三成。', '建议：不要回应任何来自幽暗宇宙深处的呼唤，即使它用的是你自己的声音。', 8, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for cultivate_realm
-- ----------------------------
DROP TABLE IF EXISTS `cultivate_realm`;
CREATE TABLE `cultivate_realm`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标识（对应前端 id）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '境界名',
  `en` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '英文名',
  `min_power` bigint NOT NULL DEFAULT 0 COMMENT '精神力门槛（万念力单位）',
  `gate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '突破关卡描述',
  `powers_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '境界能力（JSON 数组）',
  `cost` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '代价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '描述',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '意识修炼·境界表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cultivate_realm
-- ----------------------------
INSERT INTO `cultivate_realm` VALUES (1, 'awaken', '觉醒境', 'AWAKENING', 1, '精神力自然觉醒，可感知自身念力流动', '[\"感知周围生命气息\",\"念力托起轻物\",\"短距精神感应\"]', '念力枯竭时会剧烈头痛，需静养三日', '所有精神念师的起点。大多数人一辈子停在这里，不是天赋不够，是没人告诉他们这只是起点。', 0, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (2, 'gather', '凝念境', 'CONDENSING', 10, '念力可外放并稳定成型，持续不低于一炷香', '[\"念力化针 / 化刃\",\"隔空取物十米\",\"精神力屏障（初级）\"]', '过度凝念会造成「念力反噬」，指节先于大脑失效', '第一次把\"想\"变成\"做\"的境界。此境之后，念师才算真正有了武器——一把看不见的武器。', 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (3, 'release', '外放境', 'PROJECTION', 100, '念力外放距离突破百米，且可同时操控三件以上物体', '[\"百米外精确操控\",\"念力冲击波\",\"感知敌方意识波动\"]', '精神长期紧绷，睡眠中会出现「念力自走」', '恒星级念师的日常。外放境的高手，一个人就能操控整支舰队的火控系统。', 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (4, 'shape', '化形境', 'MANIFESTATION', 1000, '念力凝为实体结构，可维持形态超过一个时辰', '[\"念力铠甲 / 念力巨兽\",\"实体化的意识武器\",\"以念力短暂改变地形\"]', '化形物受损时，反噬直接作用于灵魂', '念力不再只是\"力\"，而是\"物\"。罗峰的血海秘法，本质就是把化形推到了极致。', 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (5, 'domain', '领域境', 'DOMAIN', 10000, '意识覆盖方圆千米，形成可自主规则的领域', '[\"领域内压制敌方念力\",\"感知领域内一切生命\",\"领域内短距瞬移\"]', '领域展开时本体无法移动，被打断则灵魂重创', '宇宙级强者的标志。在他的领域里，他就是规则——至少，是规则的一部分。', 4, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (6, 'law', '法则境', 'LAW', 100000, '意识与一条宇宙法则产生共鸣，可借用法则之力', '[\"操控时间 / 空间 / 雷 / 血海等单一法则\",\"法则压制\",\"跨越星系的意识投射\"]', '法则感悟一旦倒退，境界会整体坠落，且极难恢复', '界主与不朽的分水岭。混沌碑上刻的，就是通往这一境的路标。', 5, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `cultivate_realm` VALUES (7, 'eternal', '不朽境', 'IMMORTAL', 1000000, '意识不灭，肉身毁损亦可重构', '[\"意识永存\",\"一念覆盖星域\",\"规则创造\"]', '不朽者最大的敌人不是别人，是漫长到失去意义的自己', '宇宙海之上的境界。到了这里，已无所谓\"修炼\"——只有\"选择\"。', 6, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for good_item
-- ----------------------------
DROP TABLE IF EXISTS `good_item`;
CREATE TABLE `good_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '编号（如 G-01）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `glyph` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标（emoji）',
  `cat` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类',
  `rarity` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '稀有度',
  `price` bigint NULL DEFAULT NULL COMMENT '价格（NULL 为面议）',
  `unit` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '宇宙币' COMMENT '货币单位',
  `seller` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '卖家',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '描述',
  `stock` int NOT NULL DEFAULT 0 COMMENT '库存',
  `hot` tinyint NOT NULL DEFAULT 0 COMMENT '是否热销 0/1',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '奇物交易·货品表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of good_item
-- ----------------------------
INSERT INTO `good_item` VALUES (1, 'G-01', '血刃战刀', '🗡', '兵器', '史诗', 8800, '宇宙币', '虚拟宇宙商城 · 官方', '为精神念师定制的高频振荡战刀，刀身可随念力变形。曾有一把在同型号对决中连断七柄，此后该型号被列为「禁售给非念师」。', 12, 1, 0, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (2, 'G-02', '陨墨星传承', '🌑', '传承', '传说', NULL, '面议', '陨墨星 · 唯一继承者', '陨墨星主毕生所学，含血海秘法、念力化形与一座私人星域的全部坐标。此物不标价——它只认一个主人，其他的，连翻开的资格都没有。', 1, 1, 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (3, 'G-03', '混沌碑拓片', '📜', '秘法', '传说', 120000, '宇宙币', '黑市 · 来源不明', '从混沌城第三座碑上拓下的残片，只含七个符号。城卫声明此为伪造——但每年仍有三位界主为此付出全部身家。', 1, 0, 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (4, 'G-04', '龙血战衣', '🛡', '防具', '史诗', 15000, '宇宙币', '黑龙山帝国 · 军需处', '以星空巨兽血液浸炼的作战服，可在真空中维持七十二小时生命体征。帝国现役装备，序列号已注销，购买需自担风险。', 6, 0, 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (5, 'G-05', '星云砂（1 立方）', '✨', '材料', '稀有', 2400, '宇宙币', '地球 · 江南基地市商会', '从云雾星域采集的高纯度能量砂，是制造念力增幅器的基础材料。地球货源，价格公道，但运输途中损耗极高。', 240, 1, 4, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (6, 'G-06', '紫光石', '💎', '材料', '精良', 620, '宇宙币', '虚拟宇宙商城 · 官方', '常见的能量传导晶体，武者修炼与飞船引擎都能用。便宜、稳定、不挑人，是新手最该先囤的东西。', 999, 0, 5, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (7, 'G-07', '空间戒指 · 十方', '💍', '装备', '稀有', 9600, '宇宙币', '虚拟宇宙商城 · 官方', '内部空间十立方米，可存放活物以外的任意物品。戒指本身没有防御力——所以别把它戴在会打架的那只手上。', 34, 0, 6, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (8, 'G-08', '黑龙级飞船', '🚀', '载具', '史诗', 88000, '宇宙币', '黑龙山帝国 · 退役舰拍卖', '帝国退役主力巡洋舰，武器系统已拆除，引擎与护盾保留。跑得快、皮厚、非常费钱，是深潜者最现实的选择。', 3, 1, 7, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (9, 'G-09', '精神念力增幅器', '🔮', '装备', '稀有', 7200, '宇宙币', '云雾星域 · 炼器师协会', '将念力输出放大约 1.4 倍，代价是疲劳累积速度同步提升。老念师的经验之谈：增幅器救过很多人，也送走过更多。', 18, 0, 8, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (10, 'G-10', '生命果实', '🍎', '丹药', '传说', 300000, '宇宙币', '黑市 · 匿名寄售', '可修复濒死状态下的肉身与灵魂损伤，一人一生只能服用一次。卖家只留一句话：「我不需要了。」', 1, 1, 9, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `good_item` VALUES (11, 'G-11', '智能核心 · 巴巴塔同款', '🛰', '智能', '传说', NULL, '面议', '陨墨星 · 非卖品', '陨墨星主亲手打造的智能生命核心，具备完整人格与战术推演能力。市面上的\"同款\"全是仿制品，且大多会在三个月内开始说胡话。', 0, 0, 10, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for secret_art
-- ----------------------------
DROP TABLE IF EXISTS `secret_art`;
CREATE TABLE `secret_art`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '归属标记 realm:{境界主键}，由后台维护',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '秘法名',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '类型',
  `from_source` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '来源',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '描述',
  `risk` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '风险',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '意识修炼·秘法表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of secret_art
-- ----------------------------
INSERT INTO `secret_art` VALUES (1, 'realm:1', '混沌碑 · 时空法则', '法则 · 顶级', '混沌城', '九碑之一的完整传承。参悟者可逐步掌握时间与空间的表层规则，是通往法则境最正统、也最难走的一条路。', '参悟失败者，意识会被困在碑内一瞬，现实中已过百年', 0, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `secret_art` VALUES (2, 'realm:2', '血海秘法', '秘法 · 陨墨星', '陨墨星传承', '以自身血液与念力构筑一片\"海\"，海中一切皆受掌控。攻守一体，代价是每次施展都要消耗大量生命本源。', '本源枯竭不可逆，历史上修成者不足十人', 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `secret_art` VALUES (3, 'realm:3', '念力化形 · 千刃', '战技 · 精神念师', '虚拟宇宙公司', '将念力分裂为上千枚细刃，同时操控。看似华丽，实则是外放境最扎实的基本功训练——能稳住一千枚的人，才配谈化形。', '操控失误会导致念力回卷，轻则昏迷，重则失忆', 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `secret_art` VALUES (4, 'realm:4', '雷之法则 · 九霄', '法则 · 战斗型', '雷神亲授', '以雷入道，速度与破坏力兼备。修至深处，一道雷可横跨半个星系，是正面战场最不讲道理的法则之一。', '雷霆反噬会烧毁经脉，修习者普遍短命', 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for star_entry
-- ----------------------------
DROP TABLE IF EXISTS `star_entry`;
CREATE TABLE `star_entry`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `category` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类：武者/星球/秘法/法则/组织/智能/秘境',
  `glyph` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标（emoji）',
  `summary` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '简介（列表卡片）',
  `detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '详情（详情弹层）',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '标签，英文逗号分隔',
  `hot_score` int NOT NULL DEFAULT 0 COMMENT '热度',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重，越小越靠前',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_hot_score`(`hot_score` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  INDEX `idx_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '星域条目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of star_entry
-- ----------------------------
INSERT INTO `star_entry` VALUES (1, '罗峰', '武者', '🗡', '精神念师，地球出身，从武者时代一路打进宇宙时代的男人。', '地球江南基地市走出的精神念师，继承陨墨星主传承，历经混沌城苦修与域外战场血战，最终登临宇宙之主。他的强大从来不只是念力，而是那股认死理的劲。', '精神念师,主角,地球', 980, 3241, 1, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (2, '巴巴塔', '智能', '🛰', '陨墨星主留下的智能生命，毒舌、可靠、信息量惊人。', '存储着陨墨星一脉几乎全部知识与秘法，是罗峰最早的导师，也是最久的同行者。吐槽是它的日常，护主是它的本能。', '智能生命,导师,陨墨星', 860, 2810, 2, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (3, '徐欣', '武者', '🌸', '罗峰之妻，温柔而坚定，地球大涅槃时期的中坚力量。', '与罗峰相识于微时，在他远征宇宙的那些年独自守住了地球后方。有人说她配不上宇宙之主的身份，罗峰的回答是：我打的每一仗，都是为了让她不用打。', '罗峰,地球,守护', 640, 1580, 3, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (4, '陨墨星主', '武者', '👁', '陨墨星一脉之主，留下无尽传承与一个话很多的智能生命。', '生前是纵横宇宙的强者，死后仍以传承的方式影响着后来者。他的陨墨星，是罗峰命运的转折点。', '传承,陨墨星,强者', 720, 1990, 4, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (5, '地球', '星球', '🌍', '太阳系第三行星，大涅槃之前的家园，一切故事的起点。', '大涅槃之后，人类在这颗蓝色星球上重建文明，从冷兵器对抗怪兽，到走出太阳系只用了不到两百年。星图上它很小，分量却最重。', '起源,太阳系,家园', 900, 4120, 5, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (6, '云雾星', '星球', '🪐', '云雾缭绕的修炼圣地，灵气充裕，强者辈出。', '被永久星云包裹的训练星域，重力可调，许多恒星级强者都在这里第一次学会意识外放。', '修炼,星云,训练场', 430, 980, 6, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (7, '幽暗宇宙', '秘境', '🌌', '与人类宇宙并存的黑暗位面，凶险与机缘并存。', '法则残缺、光线被吞没的位面。探索队的名单很长，返回的名单很短。图鉴对其的批注只有四个字：不建议前往。', '暗位面,秘境,高危', 780, 2210, 7, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (8, '混沌碑', '秘法', '📜', '混沌城主留下的九座石碑，铭刻着时空法则的奥义。', '每一座碑都是一条通往法则顶点的路。能进城的人不多，能看懂碑的人更少。参悟失败者会被困在碑内一瞬，而现实已过百年。', '法则,传承,混沌城', 840, 2450, 8, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (9, '时空法则', '法则', '⏳', '宇宙最高法则之一，掌控时间与空间的本源之力。', '时间与空间并非两条法则，而是同一枚硬币的两面。修至深处，可让一瞬变作百年，也可让万里缩成一步。', '时间,空间,本源', 910, 3100, 9, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (10, '虚拟宇宙公司', '组织', '🏛', '人类疆域最庞大的商业帝国，业务横跨整片星海。', '它不统治任何一颗星球，却掌握着几乎所有星球的交易、通讯与身份档案。在虚拟宇宙里，一次封号等同于现实中的抹除。', '商业,信息,人类疆域', 760, 2680, 10, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (11, '黑龙山帝国', '组织', '⚔', '以舰队起家的人类帝国，军功换爵位，爵位换星系。', '帝国法典第一条：任何个体的力量，都不得超越帝国本身。对异族强硬，对同胞同样强硬。', '帝国,舰队,军功', 610, 1420, 11, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (12, '意识能量', '法则', '🔮', '精神念师的根基力量，源于灵魂本源，可凝物伤敌于无形。', '念力不是蛮力，而是把「想」变成「做」的能力。从托起一枚硬币，到化出覆盖星域的铠甲，中间隔着一次次濒死的突破。', '精神念师,念力,灵魂', 690, 1730, 12, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (13, '雷神', '武者', '⚡', '地球最强的武者之一，罗峰的挚友，以雷入道。', '信奉的道理很简单：能动手的事，别吵。修法则不靠参悟，靠一次次把自己劈个半死。战场上永远冲在最前面，因为身后是家。', '雷之法则,挚友,地球', 700, 1860, 13, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (14, '虫族', '组织', '🐛', '由母巢意志统御的群体文明，人类疆域的头号威胁。', '个体没有名字，只有编号；死亡不计入损失，只计入消耗。它们不谈判，不俘虏，只把一切有机物转化为下一批虫群。', '异族,母巢,敌对', 560, 1290, 14, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (15, '机械族', '组织', '🤖', '自称「最优解」的机械文明，不恨人类，只是在计算。', '计算之后，它们认为人类的存在降低了宇宙的运算效率，于是开始优化——一颗星球、一颗星球地优化。', '异族,机械,逻辑', 520, 1100, 15, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (16, '混沌城', '组织', '🏯', '人类最高修行圣地，九座混沌碑所在之地。', '城内不设军队，因为不需要——住在城里的每一位，都足以独自终结一场星域战争。它从不参战，只安静地看着谁配得上下一代。', '圣地,混沌碑,师门', 800, 2360, 16, '2026-11-04 08:36:10', '2026-11-04 08:36:10');
INSERT INTO `star_entry` VALUES (17, '宇宙海', '秘境', '🌊', '宇宙的尽头，也是一切法则的源头。', '这里没有航线，只有意志能决定你能游多远。抵达此处的强者已不需要星图——他们自己就是坐标。', '终局,本源,宇宙海', 880, 2900, 17, '2026-11-04 08:36:10', '2026-11-04 08:36:10');

-- ----------------------------
-- Table structure for star_hot_word
-- ----------------------------
DROP TABLE IF EXISTS `star_hot_word`;
CREATE TABLE `star_hot_word`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `word` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '热词',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序，越小越靠前',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_word`(`word` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '星域热词表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of star_hot_word
-- ----------------------------
INSERT INTO `star_hot_word` VALUES (1, '罗峰', 1);
INSERT INTO `star_hot_word` VALUES (2, '巴巴塔', 2);
INSERT INTO `star_hot_word` VALUES (3, '地球', 3);
INSERT INTO `star_hot_word` VALUES (4, '虚拟宇宙公司', 4);
INSERT INTO `star_hot_word` VALUES (5, '时空法则', 5);
INSERT INTO `star_hot_word` VALUES (6, '混沌碑', 6);
INSERT INTO `star_hot_word` VALUES (7, '混沌城', 7);
INSERT INTO `star_hot_word` VALUES (8, '雷神', 8);

-- ----------------------------
-- Table structure for star_region
-- ----------------------------
DROP TABLE IF EXISTS `star_region`;
CREATE TABLE `star_region`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标识（对应前端 id）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `en` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '英文名',
  `coord` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '坐标编号',
  `danger` int NOT NULL DEFAULT 1 COMMENT '危险度 1-5',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '星域类型',
  `faction` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '掌控势力',
  `resources_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '资源列表（JSON 数组）',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '描述',
  `progress` int NOT NULL DEFAULT 0 COMMENT '探索进度 0-100',
  `x` int NOT NULL DEFAULT 0 COMMENT '星图坐标 X',
  `y` int NOT NULL DEFAULT 0 COMMENT '星图坐标 Y',
  `events_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '星域事件（JSON 数组）',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '星海探索·星域表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of star_region
-- ----------------------------

-- ----------------------------
-- Table structure for star_user
-- ----------------------------
DROP TABLE IF EXISTS `star_user`;
CREATE TABLE `star_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '涓婚敭',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '璐﹀彿',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '瀵嗙爜锛堟槑鏂囧瓨鍌?紝椤圭洰瑕佹眰涓嶅姞瀵嗭級',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '鏄电О',
  `permission` int NOT NULL DEFAULT 1 COMMENT '鏉冮檺锛?=榛樿?鐢ㄦ埛锛?=绠＄悊鍛橈紙鍙?繘鍚庡彴锛',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '鏄熷煙鐢ㄦ埛琛' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of star_user
-- ----------------------------
INSERT INTO `star_user` VALUES (1, 'chenze', '123456', '星河守护者', 0, '2026-11-04 08:36:11');
INSERT INTO `star_user` VALUES (2, 'czxhcyd', '5201314', '次元守护者', 0, '2026-11-04 08:36:11');

-- ----------------------------
-- Table structure for user_bag
-- ----------------------------
DROP TABLE IF EXISTS `user_bag`;
CREATE TABLE `user_bag`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint NOT NULL COMMENT '用户ID（star_user.id）',
  `item_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '货品编号（good_item.code，对应前端 id）',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '货品名称（购买时快照）',
  `glyph` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标（emoji，快照）',
  `cat` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类（快照）',
  `rarity` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '稀有度（快照）',
  `price` bigint NULL DEFAULT NULL COMMENT '单价（快照，NULL 为面议）',
  `unit` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '宇宙币' COMMENT '货币单位（快照）',
  `seller` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '卖家（快照）',
  `quantity` int NOT NULL DEFAULT 1 COMMENT '数量（重复购买累加）',
  `bought_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最近一次购买时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_item`(`user_id` ASC, `item_code` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '背包·用户奇物表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_bag
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

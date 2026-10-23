-- ============================================================
-- 吞噬星空 · 用户表 SQL
-- 数据库：swallowed_star
-- 说明：请在本机 MySQL（root / 123456）中执行本文件。
-- ============================================================

-- 1) 若数据库尚未创建，先执行下面两行（已加 IF NOT EXISTS，可重复执行）：
CREATE DATABASE IF NOT EXISTS swallowed_star
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2) 切换到目标库
USE swallowed_star;

-- 3) 创建星域用户表（幂等）
CREATE TABLE IF NOT EXISTS star_user (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(32)  NOT NULL                COMMENT '账号',
  password    VARCHAR(128) NOT NULL                COMMENT '密码（BCrypt 加密存储）',
  nickname    VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域用户表';

-- 4) 演示账号说明：
--    演示账号 admin / 123456 由后端在「首次启动」时自动创建（密码经 BCrypt 加密），
--    无需手动插入。如需手动插入，请使用 BCrypt 加密后的密文，例如：
--    INSERT INTO star_user (username, password, nickname)
--    VALUES ('admin', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '星河守护者');

-- 5) 首页数据表（星域条目 + 热词，幂等）
--    后端 schema.sql 启动时同样会自动建这两张表；条目数据由 HomeDataInitializer 首次启动写入。
CREATE TABLE IF NOT EXISTS star_entry (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  name        VARCHAR(64)  NOT NULL                COMMENT '名称',
  category    VARCHAR(32)  NOT NULL                COMMENT '分类',
  glyph       VARCHAR(16)  DEFAULT NULL            COMMENT '图标（emoji）',
  summary     VARCHAR(500) NOT NULL                COMMENT '简介',
  detail      TEXT                                 COMMENT '详情',
  tags        VARCHAR(255) DEFAULT NULL            COMMENT '标签，英文逗号分隔',
  hot_score   INT          NOT NULL DEFAULT 0      COMMENT '热度',
  view_count  INT          NOT NULL DEFAULT 0      COMMENT '浏览次数',
  sort_order  INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_category (category),
  KEY idx_hot_score (hot_score),
  KEY idx_sort_order (sort_order),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域条目表';

CREATE TABLE IF NOT EXISTS star_hot_word (
  id          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  word        VARCHAR(32) NOT NULL                COMMENT '热词',
  sort_order  INT         NOT NULL DEFAULT 0      COMMENT '排序',
  PRIMARY KEY (id),
  UNIQUE KEY uk_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域热词表';

-- ============================================================
-- 6) 后台管理系统相关表（2026-10-23 新增，幂等）
--    后端 schema.sql 启动时同样会自动建表；数据由 AdminDataInitializer 首次启动写入。
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_user (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(32)  NOT NULL                COMMENT '管理员账号',
  password    VARCHAR(128) NOT NULL                COMMENT '密码（BCrypt 加密存储）',
  nickname    VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='后台管理员表';

CREATE TABLE IF NOT EXISTS star_region (
  id            BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  code          VARCHAR(32) NOT NULL                COMMENT '标识（对应前端 id）',
  name          VARCHAR(64) NOT NULL                COMMENT '名称',
  en            VARCHAR(64) DEFAULT NULL            COMMENT '英文名',
  coord         VARCHAR(32) DEFAULT NULL            COMMENT '坐标编号',
  danger        INT         NOT NULL DEFAULT 1      COMMENT '危险度 1-5',
  type          VARCHAR(32) DEFAULT NULL            COMMENT '星域类型',
  faction       VARCHAR(64) DEFAULT NULL            COMMENT '掌控势力',
  resources_json TEXT                                COMMENT '资源列表（JSON 数组）',
  description   TEXT                                 COMMENT '描述',
  progress      INT         NOT NULL DEFAULT 0      COMMENT '探索进度 0-100',
  x             INT         NOT NULL DEFAULT 0      COMMENT '星图坐标 X',
  y             INT         NOT NULL DEFAULT 0      COMMENT '星图坐标 Y',
  events_json   TEXT                                 COMMENT '星域事件（JSON 数组）',
  sort_order    INT         NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at    DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星海探索·星域表';

CREATE TABLE IF NOT EXISTS civilization (
  id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  code         VARCHAR(32)  NOT NULL                COMMENT '编号（如 C-001）',
  name         VARCHAR(64)  NOT NULL                COMMENT '名称',
  en           VARCHAR(64)  DEFAULT NULL            COMMENT '英文名',
  type         VARCHAR(32)  DEFAULT NULL            COMMENT '文明类型',
  level        VARCHAR(32)  DEFAULT NULL            COMMENT '等级',
  status       VARCHAR(16)  DEFAULT NULL            COMMENT '立场',
  status_text  VARCHAR(32)  DEFAULT NULL            COMMENT '立场文案',
  span         VARCHAR(128) DEFAULT NULL            COMMENT '疆域范围',
  danger       INT          NOT NULL DEFAULT 1      COMMENT '危险度 1-5',
  description  TEXT                                 COMMENT '描述',
  traits_json  TEXT                                 COMMENT '特征（JSON 数组）',
  relation     TEXT                                 COMMENT '与人类关系',
  note         TEXT                                 COMMENT '图鉴批注',
  sort_order   INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='文明图鉴表';

CREATE TABLE IF NOT EXISTS good_item (
  id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  code         VARCHAR(32)  NOT NULL                COMMENT '编号（如 G-01）',
  name         VARCHAR(64)  NOT NULL                COMMENT '名称',
  glyph        VARCHAR(16)  DEFAULT NULL            COMMENT '图标（emoji）',
  cat          VARCHAR(32)  DEFAULT NULL            COMMENT '分类',
  rarity       VARCHAR(16)  DEFAULT NULL            COMMENT '稀有度',
  price        BIGINT       DEFAULT NULL            COMMENT '价格（NULL 为面议）',
  unit         VARCHAR(16)  DEFAULT '宇宙币'        COMMENT '货币单位',
  seller       VARCHAR(128) DEFAULT NULL            COMMENT '卖家',
  description  TEXT                                 COMMENT '描述',
  stock        INT          NOT NULL DEFAULT 0      COMMENT '库存',
  hot          TINYINT      NOT NULL DEFAULT 0      COMMENT '是否热销 0/1',
  sort_order   INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='奇物交易·货品表';

CREATE TABLE IF NOT EXISTS cultivate_realm (
  id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  code         VARCHAR(32)  NOT NULL                COMMENT '标识（对应前端 id）',
  name         VARCHAR(64)  NOT NULL                COMMENT '境界名',
  en           VARCHAR(64)  DEFAULT NULL            COMMENT '英文名',
  min_power    BIGINT       NOT NULL DEFAULT 0      COMMENT '精神力门槛（万念力单位）',
  gate         VARCHAR(255) DEFAULT NULL            COMMENT '突破关卡描述',
  powers_json  TEXT                                 COMMENT '境界能力（JSON 数组）',
  cost         TEXT                                 COMMENT '代价',
  description  TEXT                                 COMMENT '描述',
  sort_order   INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='意识修炼·境界表';

CREATE TABLE IF NOT EXISTS secret_art (
  id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  name         VARCHAR(64)  NOT NULL                COMMENT '秘法名',
  type         VARCHAR(32)  DEFAULT NULL            COMMENT '类型',
  from_source  VARCHAR(128) DEFAULT NULL            COMMENT '来源',
  description  TEXT                                 COMMENT '描述',
  risk         TEXT                                 COMMENT '风险',
  sort_order   INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='意识修炼·秘法表';

CREATE TABLE IF NOT EXISTS character_profile (
  id             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  code           VARCHAR(32)  NOT NULL                COMMENT '标识（对应前端 id）',
  name           VARCHAR(64)  NOT NULL                COMMENT '姓名',
  en             VARCHAR(64)  DEFAULT NULL            COMMENT '英文名',
  title          VARCHAR(128) DEFAULT NULL            COMMENT '头衔',
  glyph          VARCHAR(16)  DEFAULT NULL            COMMENT '头像字符',
  realm          VARCHAR(64)  DEFAULT NULL            COMMENT '境界',
  camp           VARCHAR(64)  DEFAULT NULL            COMMENT '阵营',
  tags_json      TEXT                                 COMMENT '标签（JSON 数组）',
  quote          VARCHAR(255) DEFAULT NULL            COMMENT '语录',
  intro_json     TEXT                                 COMMENT '生平介绍（JSON 数组）',
  stats_json     TEXT                                 COMMENT '能力条（JSON 数组）',
  timeline_json  TEXT                                 COMMENT '时间线（JSON 数组）',
  relations_json TEXT                                 COMMENT '关系网（JSON 数组）',
  ability_json   TEXT                                 COMMENT '能力（JSON 数组）',
  sort_order     INT          NOT NULL DEFAULT 0      COMMENT '排序权重',
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='人物档案表';


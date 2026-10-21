-- 自动建表（启动幂等，表已存在则跳过）
CREATE TABLE IF NOT EXISTS star_user (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(32)  NOT NULL                COMMENT '账号',
  password    VARCHAR(128) NOT NULL                COMMENT '密码（BCrypt 加密存储）',
  nickname    VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域用户表';

-- 星域条目表：首页展示、检索、详情的数据来源
CREATE TABLE IF NOT EXISTS star_entry (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  name        VARCHAR(64)  NOT NULL                COMMENT '名称',
  category    VARCHAR(32)  NOT NULL                COMMENT '分类：武者/星球/秘法/法则/组织/智能/秘境',
  glyph       VARCHAR(16)  DEFAULT NULL            COMMENT '图标（emoji）',
  summary     VARCHAR(500) NOT NULL                COMMENT '简介（列表卡片）',
  detail      TEXT                                 COMMENT '详情（详情弹层）',
  tags        VARCHAR(255) DEFAULT NULL            COMMENT '标签，英文逗号分隔',
  hot_score   INT          NOT NULL DEFAULT 0      COMMENT '热度',
  view_count  INT          NOT NULL DEFAULT 0      COMMENT '浏览次数',
  sort_order  INT          NOT NULL DEFAULT 0      COMMENT '排序权重，越小越靠前',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_category (category),
  KEY idx_hot_score (hot_score),
  KEY idx_sort_order (sort_order),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域条目表';

-- 首页星域热词
CREATE TABLE IF NOT EXISTS star_hot_word (
  id          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  word        VARCHAR(32) NOT NULL                COMMENT '热词',
  sort_order  INT         NOT NULL DEFAULT 0      COMMENT '排序，越小越靠前',
  PRIMARY KEY (id),
  UNIQUE KEY uk_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='星域热词表';

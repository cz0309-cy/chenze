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


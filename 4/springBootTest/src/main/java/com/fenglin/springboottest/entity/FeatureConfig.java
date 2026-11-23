package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 功能中心配置：后台可编辑的数值参数 / 内容数据 / 功能开关。
 * 单个 key 对应一份 JSON 配置，前端功能页启动时读取并覆盖默认值。
 */
@Data
@TableName("feature_config")
public class FeatureConfig {

    /** 配置键（业务主键，如 features） */
    @TableId(type = IdType.INPUT)
    private String cfgKey;

    /** 配置内容（JSON 字符串） */
    private String cfgValue;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

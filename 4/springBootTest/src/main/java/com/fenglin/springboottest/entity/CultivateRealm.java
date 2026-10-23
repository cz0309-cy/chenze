package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 意识修炼 · 境界 */
@Data
@TableName("cultivate_realm")
public class CultivateRealm {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标识（对应前端 id） */
    private String code;

    private String name;

    private String en;

    /** 精神力门槛（万念力单位） */
    @TableField("min_power")
    private Long minPower;

    /** 突破关卡描述 */
    private String gate;

    /** 境界能力（JSON 数组字符串） */
    @TableField("powers_json")
    private String powers;

    /** 代价 */
    private String cost;

    /** 描述（desc 是 SQL 保留字，列名用 description） */
    private String description;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

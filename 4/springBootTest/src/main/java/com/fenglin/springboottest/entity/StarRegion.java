package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 星海探索 · 星域 */
@Data
@TableName("star_region")
public class StarRegion {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标识（对应前端 id） */
    private String code;

    private String name;

    private String en;

    /** 坐标编号 */
    private String coord;

    /** 危险度 1-5 */
    private Integer danger;

    /** 星域类型 */
    private String type;

    /** 掌控势力 */
    private String faction;

    /** 资源列表（JSON 数组字符串） */
    @TableField("resources_json")
    private String resources;

    /** 描述（desc 是 SQL 保留字，列名用 description） */
    private String description;

    /** 探索进度 0-100 */
    private Integer progress;

    /** 星图坐标 X */
    private Integer x;

    /** 星图坐标 Y */
    private Integer y;

    /** 星域事件（JSON 数组字符串） */
    @TableField("events_json")
    private String events;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

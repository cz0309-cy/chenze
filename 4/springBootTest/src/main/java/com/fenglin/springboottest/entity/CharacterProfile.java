package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 人物档案 */
@Data
@TableName("character_profile")
public class CharacterProfile {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标识（对应前端 id） */
    private String code;

    private String name;

    private String en;

    /** 头衔 */
    private String title;

    /** 头像字符 */
    private String glyph;

    /** 境界 */
    private String realm;

    /** 阵营 */
    private String camp;

    /** 标签（JSON 数组字符串） */
    @TableField("tags_json")
    private String tags;

    /** 语录 */
    private String quote;

    /** 生平介绍（JSON 数组字符串） */
    @TableField("intro_json")
    private String intro;

    /** 能力条（JSON 数组字符串 [{label,value}]） */
    @TableField("stats_json")
    private String stats;

    /** 时间线（JSON 数组字符串 [{year,title,desc}]） */
    @TableField("timeline_json")
    private String timeline;

    /** 关系网（JSON 数组字符串） */
    @TableField("relations_json")
    private String relations;

    /** 能力（JSON 数组字符串） */
    @TableField("ability_json")
    private String ability;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

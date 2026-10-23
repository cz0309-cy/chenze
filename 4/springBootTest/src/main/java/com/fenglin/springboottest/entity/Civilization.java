package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 文明图鉴 */
@Data
@TableName("civilization")
public class Civilization {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 编号（如 C-001，对应前端 id） */
    private String code;

    private String name;

    private String en;

    /** 文明类型 */
    private String type;

    /** 等级 */
    private String level;

    /** 立场：ally / neutral / hostile / unknown */
    private String status;

    /** 立场文案 */
    @TableField("status_text")
    private String statusText;

    /** 疆域范围 */
    private String span;

    /** 危险度 1-5 */
    private Integer danger;

    /** 描述（desc 是 SQL 保留字，列名用 description） */
    private String description;

    /** 特征（JSON 数组字符串） */
    @TableField("traits_json")
    private String traits;

    /** 与人类关系 */
    private String relation;

    /** 图鉴批注 */
    private String note;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

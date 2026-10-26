package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 意识修炼 · 秘法（from 是 SQL 保留字，列名用 from_source） */
@Data
@TableName("secret_art")
public class SecretArt {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 归属标记：后台编辑时存 realm:{境界主键}，前台只读接口不返回该字段 */
    private String code;

    private String name;

    /** 类型 */
    private String type;

    /** 来源 */
    @TableField("from_source")
    private String fromSource;

    /** 描述（desc 是 SQL 保留字，列名用 description） */
    private String description;

    /** 风险 */
    private String risk;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

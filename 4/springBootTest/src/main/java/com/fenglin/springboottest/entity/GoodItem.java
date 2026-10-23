package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 奇物交易 · 货品 */
@Data
@TableName("good_item")
public class GoodItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 编号（如 G-01，对应前端 id） */
    private String code;

    private String name;

    /** 图标（emoji） */
    private String glyph;

    /** 分类 */
    private String cat;

    /** 稀有度 */
    private String rarity;

    /** 价格（NULL 表示面议） */
    private Long price;

    /** 货币单位 */
    private String unit;

    /** 卖家 */
    private String seller;

    /** 描述（desc 是 SQL 保留字，列名用 description） */
    private String description;

    /** 库存 */
    private Integer stock;

    /** 是否热销 0/1 */
    private Integer hot;

    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 星域条目：首页展示与检索的数据来源。
 */
@Data
@TableName("star_entry")
public class StarEntry {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 名称，如「罗峰」「地球」 */
    private String name;

    /** 分类：武者 / 星球 / 秘法 / 法则 / 组织 / 智能 / 秘境 */
    private String category;

    /** 图标（emoji） */
    private String glyph;

    /** 简介，列表卡片展示 */
    private String summary;

    /** 详情，详情弹层展示 */
    private String detail;

    /** 标签，英文逗号分隔 */
    private String tags;

    /** 热度，越大越靠前 */
    private Integer hotScore;

    /** 浏览次数 */
    private Integer viewCount;

    /** 排序权重，越小越靠前 */
    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

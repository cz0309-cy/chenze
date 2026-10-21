package com.fenglin.springboottest.controller.dto;

import lombok.Data;

import java.util.List;

/**
 * 星域条目返回结构（首页卡片 / 检索结果 / 详情共用）。
 */
@Data
public class EntryVO {

    private Long id;
    private String name;
    private String category;
    private String glyph;
    private String summary;
    private String detail;
    private List<String> tags;
    private Integer hotScore;
    private Integer viewCount;
}

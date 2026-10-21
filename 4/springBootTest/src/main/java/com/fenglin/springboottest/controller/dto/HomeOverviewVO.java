package com.fenglin.springboottest.controller.dto;

import lombok.Data;

import java.util.List;

/**
 * 首页聚合数据：统计 + 分类 + 热词 + 推荐条目。
 */
@Data
public class HomeOverviewVO {

    /** 条目总数 */
    private long totalEntries;

    /** 分类总数 */
    private int categoryCount;

    /** 分类及各分类条目数 */
    private List<CategoryCount> categories;

    /** 星域热词 */
    private List<String> hotWords;

    /** 推荐（热门）条目 */
    private List<EntryVO> featured;

    @Data
    public static class CategoryCount {
        private String name;
        private int count;

        public CategoryCount() {
        }

        public CategoryCount(String name, int count) {
            this.name = name;
            this.count = count;
        }
    }
}

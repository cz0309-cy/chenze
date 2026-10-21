package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.common.PageResult;
import com.fenglin.springboottest.controller.dto.EntryVO;
import com.fenglin.springboottest.controller.dto.HomeOverviewVO;
import com.fenglin.springboottest.entity.StarEntry;

public interface StarEntryService extends IService<StarEntry> {

    /** 首页聚合数据：统计、分类、热词、推荐条目 */
    HomeOverviewVO overview();

    /**
     * 检索星域条目
     *
     * @param keyword  关键词，可空（匹配名称 / 简介 / 标签 / 分类）
     * @param category 分类，可空或「全部」
     * @param sort     排序：hot 热度 / new 最新 / 默认综合
     * @param page     页码，从 1 开始
     * @param size     每页条数
     */
    PageResult<EntryVO> search(String keyword, String category, String sort, int page, int size);

    /** 条目详情，同时累加浏览次数；不存在返回 null */
    EntryVO detail(Long id);
}

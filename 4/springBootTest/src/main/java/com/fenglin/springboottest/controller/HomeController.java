package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.PageResult;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.controller.dto.EntryVO;
import com.fenglin.springboottest.controller.dto.HomeOverviewVO;
import com.fenglin.springboottest.service.StarEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 星域首页：聚合展示、检索、条目详情。
 */
@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private StarEntryService entryService;

    /** 首页聚合数据：条目统计、分类、热词、推荐条目 */
    @GetMapping("/overview")
    public Result<HomeOverviewVO> overview() {
        return Result.ok(entryService.overview());
    }

    /**
     * 检索 / 分页列表
     *
     * @param keyword  关键词，可空；命中名称、简介、标签、分类
     * @param category 分类，可空或「全部」
     * @param sort     hot 热度 / new 最新 / 默认综合
     */
    @GetMapping("/entries")
    public Result<PageResult<EntryVO>> entries(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sort", required = false, defaultValue = "") String sort,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size) {
        if (keyword != null && keyword.length() > 40) {
            return Result.fail("关键词过长，最多 40 个字符");
        }
        return Result.ok(entryService.search(keyword, category, sort, page, size));
    }

    /** 条目详情（同时累加浏览次数） */
    @GetMapping("/entries/{id}")
    public Result<EntryVO> detail(@PathVariable("id") Long id) {
        EntryVO vo = entryService.detail(id);
        if (vo == null) {
            return Result.fail(404, "该星域条目不存在或已删除");
        }
        return Result.ok(vo);
    }
}

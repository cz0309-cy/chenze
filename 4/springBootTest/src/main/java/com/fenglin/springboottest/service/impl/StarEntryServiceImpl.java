package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.common.PageResult;
import com.fenglin.springboottest.controller.dto.EntryVO;
import com.fenglin.springboottest.controller.dto.HomeOverviewVO;
import com.fenglin.springboottest.entity.HotWord;
import com.fenglin.springboottest.entity.StarEntry;
import com.fenglin.springboottest.mapper.HotWordMapper;
import com.fenglin.springboottest.mapper.StarEntryMapper;
import com.fenglin.springboottest.service.StarEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StarEntryServiceImpl extends ServiceImpl<StarEntryMapper, StarEntry> implements StarEntryService {

    @Autowired
    private HotWordMapper hotWordMapper;

    @Override
    public HomeOverviewVO overview() {
        List<StarEntry> all = list();

        HomeOverviewVO vo = new HomeOverviewVO();
        vo.setTotalEntries(all.size());

        // 分类统计（按条目数倒序）
        Map<String, Long> grouped = all.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(StarEntry::getCategory, LinkedHashMap::new, Collectors.counting()));
        List<HomeOverviewVO.CategoryCount> categories = grouped.entrySet().stream()
                .map(entry -> new HomeOverviewVO.CategoryCount(entry.getKey(), entry.getValue().intValue()))
                .sorted(Comparator.comparingInt(HomeOverviewVO.CategoryCount::getCount).reversed()
                        .thenComparing(HomeOverviewVO.CategoryCount::getName))
                .collect(Collectors.toList());
        vo.setCategories(categories);
        vo.setCategoryCount(categories.size());

        // 热词
        List<HotWord> words = hotWordMapper.selectList(
                new LambdaQueryWrapper<HotWord>().orderByAsc(HotWord::getSortOrder).last("LIMIT 8"));
        vo.setHotWords(words.stream().map(HotWord::getWord).collect(Collectors.toList()));

        // 推荐条目
        vo.setFeatured(lambdaQuery()
                .orderByDesc(StarEntry::getHotScore)
                .orderByDesc(StarEntry::getViewCount)
                .last("LIMIT 6")
                .list()
                .stream()
                .map(this::toVO)
                .collect(Collectors.toList()));

        return vo;
    }

    @Override
    public PageResult<EntryVO> search(String keyword, String category, String sort, int page, int size) {
        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), 50);
        long offset = (current - 1) * pageSize;

        long total = count(buildWrapper(keyword, category));
        if (total == 0 || offset >= total) {
            return PageResult.of(total, current, pageSize, new ArrayList<>());
        }

        LambdaQueryWrapper<StarEntry> qw = buildWrapper(keyword, category);
        String s = sort == null ? "" : sort.trim();
        if ("hot".equals(s)) {
            qw.orderByDesc(StarEntry::getHotScore).orderByDesc(StarEntry::getViewCount);
        } else if ("new".equals(s)) {
            qw.orderByDesc(StarEntry::getCreatedAt).orderByDesc(StarEntry::getId);
        } else {
            qw.orderByAsc(StarEntry::getSortOrder).orderByDesc(StarEntry::getHotScore);
        }
        // 直接拼接 LIMIT：项目未引入分页插件（mybatis-plus-jsqlparser），避免额外依赖
        qw.last("LIMIT " + offset + "," + pageSize);

        List<EntryVO> list = list(qw).stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(total, current, pageSize, list);
    }

    /** 组装检索条件（关键词 + 分类），复用给 count 与 list */
    private LambdaQueryWrapper<StarEntry> buildWrapper(String keyword, String category) {
        LambdaQueryWrapper<StarEntry> qw = new LambdaQueryWrapper<>();
        String kw = keyword == null ? "" : keyword.trim();
        if (!kw.isEmpty()) {
            qw.and(w -> w.like(StarEntry::getName, kw)
                    .or().like(StarEntry::getSummary, kw)
                    .or().like(StarEntry::getTags, kw)
                    .or().like(StarEntry::getCategory, kw));
        }
        if (category != null && !category.isBlank() && !"全部".equals(category)) {
            qw.eq(StarEntry::getCategory, category.trim());
        }
        return qw;
    }

    @Override
    public EntryVO detail(Long id) {
        if (id == null) {
            return null;
        }
        StarEntry entry = getById(id);
        if (entry == null) {
            return null;
        }
        int views = entry.getViewCount() == null ? 0 : entry.getViewCount();

        StarEntry update = new StarEntry();
        update.setId(id);
        update.setViewCount(views + 1);
        updateById(update);

        entry.setViewCount(views + 1);
        return toVO(entry);
    }

    /** 实体转返回结构，标签字符串按逗号拆成数组 */
    private EntryVO toVO(StarEntry entry) {
        EntryVO vo = new EntryVO();
        vo.setId(entry.getId());
        vo.setName(entry.getName());
        vo.setCategory(entry.getCategory());
        vo.setGlyph(entry.getGlyph());
        vo.setSummary(entry.getSummary());
        vo.setDetail(entry.getDetail());
        vo.setHotScore(entry.getHotScore() == null ? 0 : entry.getHotScore());
        vo.setViewCount(entry.getViewCount() == null ? 0 : entry.getViewCount());

        List<String> tags = new ArrayList<>();
        if (entry.getTags() != null && !entry.getTags().isBlank()) {
            tags = Arrays.stream(entry.getTags().split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList());
        }
        vo.setTags(tags);
        return vo;
    }
}

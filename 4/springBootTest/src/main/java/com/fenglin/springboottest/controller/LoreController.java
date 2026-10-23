package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.CharacterProfile;
import com.fenglin.springboottest.entity.Civilization;
import com.fenglin.springboottest.entity.CultivateRealm;
import com.fenglin.springboottest.entity.GoodItem;
import com.fenglin.springboottest.entity.SecretArt;
import com.fenglin.springboottest.entity.StarRegion;
import com.fenglin.springboottest.mapper.CharacterProfileMapper;
import com.fenglin.springboottest.mapper.CivilizationMapper;
import com.fenglin.springboottest.mapper.CultivateRealmMapper;
import com.fenglin.springboottest.mapper.GoodItemMapper;
import com.fenglin.springboottest.mapper.SecretArtMapper;
import com.fenglin.springboottest.mapper.StarRegionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 前台星域设定数据只读接口：星海探索 / 文明图鉴 / 奇物交易 / 意识修炼 / 人物档案。
 * 返回结构与前端 lore.js 保持一致（code → id，JSON 字符串字段 → 数组/对象）。
 */
@RestController
@RequestMapping("/api/lore")
public class LoreController {

    @Autowired
    private StarRegionMapper regionMapper;
    @Autowired
    private CivilizationMapper civMapper;
    @Autowired
    private GoodItemMapper goodMapper;
    @Autowired
    private CultivateRealmMapper realmMapper;
    @Autowired
    private SecretArtMapper artMapper;
    @Autowired
    private CharacterProfileMapper characterMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{module}")
    public Result<List<Map<String, Object>>> list(@PathVariable String module) {
        try {
            switch (module) {
                case "regions":
                    return Result.ok(toList(regionMapper.selectList(orderBy(new QueryWrapper<>(), "code")), StarRegion.class,
                            "resources", "events"));
                case "civs":
                    return Result.ok(toList(civMapper.selectList(orderBy(new QueryWrapper<>(), "code")), Civilization.class,
                            "traits"));
                case "goods":
                    return Result.ok(toList(goodMapper.selectList(orderBy(new QueryWrapper<>(), "code")), GoodItem.class));
                case "realms":
                    return Result.ok(toList(realmMapper.selectList(orderBy(new QueryWrapper<>())), CultivateRealm.class,
                            "powers"));
                case "arts":
                    return Result.ok(toList(artMapper.selectList(orderBy(new QueryWrapper<>())), SecretArt.class));
                case "characters":
                    return Result.ok(toList(characterMapper.selectList(orderBy(new QueryWrapper<>())), CharacterProfile.class,
                            "tags", "intro", "stats", "timeline", "relations", "ability"));
                default:
                    return Result.fail("未知模块：" + module);
            }
        } catch (Exception e) {
            return Result.fail("数据读取失败：" + e.getMessage());
        }
    }

    private <T> QueryWrapper<T> orderBy(QueryWrapper<T> qw, String... extraCols) {
        qw.orderByAsc("sort_order");
        for (String c : extraCols) {
            qw.orderByAsc(c);
        }
        qw.orderByAsc("id");
        return qw;
    }

    /** 实体 → 前端结构：JSON 字符串字段解析为数组/对象，code→id 等键名对齐 lore.js */
    private <T> List<Map<String, Object>> toList(List<T> rows, Class<T> type, String... jsonFields) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (T row : rows) {
            Map<String, Object> m = objectMapper.convertValue(row, new TypeReference<Map<String, Object>>() {
            });
            // 去掉内部字段
            m.remove("createdAt");
            m.remove("updatedAt");
            m.remove("sortOrder");
            m.remove("id");
            // JSON 字符串字段 → 真实数组/对象
            for (String f : jsonFields) {
                Object v = m.get(f);
                if (v instanceof String s && !s.isBlank()) {
                    try {
                        m.put(f, objectMapper.readValue(s, Object.class));
                    } catch (Exception e) {
                        m.put(f, new ArrayList<>());
                    }
                } else {
                    m.put(f, new ArrayList<>());
                }
            }
            // 键名对齐 lore.js
            if (m.containsKey("code")) {
                m.put("id", m.remove("code"));
            }
            if (m.containsKey("minPower")) {
                m.put("min", m.remove("minPower"));
            }
            if (m.containsKey("fromSource")) {
                m.put("from", m.remove("fromSource"));
            }
            if (m.containsKey("hot")) {
                m.put("hot", Integer.valueOf(1).equals(m.get("hot")));
            }
            if (m.containsKey("description")) {
                m.put("desc", m.remove("description"));
            }
            out.add(new HashMap<>(m));
        }
        return out;
    }
}

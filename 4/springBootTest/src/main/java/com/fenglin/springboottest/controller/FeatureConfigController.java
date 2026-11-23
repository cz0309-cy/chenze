package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.FeatureConfig;
import com.fenglin.springboottest.mapper.FeatureConfigMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 功能中心配置只读接口（公开，无需登录）：前台 5 个功能页启动时读取配置并覆盖默认值。
 * GET /api/config/{key}  → { code:0, data: <配置JSON对象> }
 * 未配置时返回 data:null，前端据此使用内置默认值。
 */
@RestController
@RequestMapping("/api/config")
public class FeatureConfigController {

    @Autowired
    private FeatureConfigMapper configMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/{key}")
    public Result<Object> get(@PathVariable String key) {
        FeatureConfig row = configMapper.selectById(key);
        if (row == null || row.getCfgValue() == null || row.getCfgValue().isBlank()) {
            return Result.ok(null);
        }
        try {
            Object cfg = objectMapper.readValue(row.getCfgValue(), Object.class);
            return Result.ok(cfg);
        } catch (Exception e) {
            return Result.fail("配置格式错误：" + e.getMessage());
        }
    }
}

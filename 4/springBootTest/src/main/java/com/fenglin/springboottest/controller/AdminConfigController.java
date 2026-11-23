package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.FeatureConfig;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.FeatureConfigMapper;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.AdminTokenStore;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台「功能配置」管理接口（需管理员 token）：读取 / 保存功能中心的数值参数、内容数据、功能开关。
 * 配置以 key-value 存 feature_config 表，value 为任意 JSON 对象。
 */
@RestController
@RequestMapping("/api/admin/config")
public class AdminConfigController {

    @Autowired
    private FeatureConfigMapper configMapper;
    @Autowired
    private AdminTokenStore adminTokenStore;
    @Autowired
    private UserMapper userMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 列出所有配置键及其内容 */
    @GetMapping("")
    public Result<Map<String, Object>> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        Map<String, Object> all = new LinkedHashMap<>();
        for (FeatureConfig row : configMapper.selectList(new QueryWrapper<>())) {
            if (row.getCfgValue() == null || row.getCfgValue().isBlank()) {
                all.put(row.getCfgKey(), null);
                continue;
            }
            try {
                all.put(row.getCfgKey(), objectMapper.readValue(row.getCfgValue(), Object.class));
            } catch (Exception e) {
                all.put(row.getCfgKey(), row.getCfgValue());
            }
        }
        return Result.ok(all);
    }

    /** 读取单个配置 */
    @GetMapping("/{key}")
    public Result<Object> get(@PathVariable String key,
                             @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        FeatureConfig row = configMapper.selectById(key);
        if (row == null || row.getCfgValue() == null) {
            return Result.ok(null);
        }
        try {
            return Result.ok(objectMapper.readValue(row.getCfgValue(), Object.class));
        } catch (Exception e) {
            return Result.ok(row.getCfgValue());
        }
    }

    /** 保存配置（存在则更新，不存在则插入） */
    @PutMapping("/{key}")
    public Result<Object> save(@PathVariable String key,
                               @RequestBody Object body,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        if (key == null || key.isBlank()) {
            return Result.fail("配置键不能为空");
        }
        try {
            String json = objectMapper.writeValueAsString(body);
            FeatureConfig row = new FeatureConfig();
            row.setCfgKey(key);
            row.setCfgValue(json);
            configMapper.insertOrUpdate(row);
            return Result.ok(json);
        } catch (Exception e) {
            return Result.fail("保存失败：" + e.getMessage());
        }
    }

    /** 删除配置（恢复为前端默认值） */
    @org.springframework.web.bind.annotation.DeleteMapping("/{key}")
    public Result<Void> remove(@PathVariable String key,
                              @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        configMapper.deleteById(key);
        return Result.ok();
    }

    private boolean checkAdmin(String auth) {
        User admin = AdminAuthController.currentAdmin(adminTokenStore, userMapper, auth);
        return admin != null && admin.getPermission() != null && admin.getPermission() == 0;
    }
}

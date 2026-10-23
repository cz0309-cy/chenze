package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.common.PageResult;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.AdminUser;
import com.fenglin.springboottest.entity.CharacterProfile;
import com.fenglin.springboottest.entity.Civilization;
import com.fenglin.springboottest.entity.CultivateRealm;
import com.fenglin.springboottest.entity.GoodItem;
import com.fenglin.springboottest.entity.SecretArt;
import com.fenglin.springboottest.entity.StarRegion;
import com.fenglin.springboottest.mapper.AdminUserMapper;
import com.fenglin.springboottest.mapper.CharacterProfileMapper;
import com.fenglin.springboottest.mapper.CivilizationMapper;
import com.fenglin.springboottest.mapper.CultivateRealmMapper;
import com.fenglin.springboottest.mapper.GoodItemMapper;
import com.fenglin.springboottest.mapper.SecretArtMapper;
import com.fenglin.springboottest.mapper.StarRegionMapper;
import com.fenglin.springboottest.service.AdminTokenStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * 后台星域设定数据管理：6 大模块统一 CRUD（列表分页 + 关键词搜索 + 增 + 改 + 删）。
 * 需要携带管理员 token（Authorization: Bearer adm-xxx）。
 */
@RestController
@RequestMapping("/api/admin/lore")
public class AdminLoreController {

    @Autowired
    private AdminTokenStore adminTokenStore;
    @Autowired
    private AdminUserMapper adminUserMapper;

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

    /** 各模块的模糊搜索列 */
    private static final Map<String, List<String>> SEARCH_COLS = Map.of(
            "regions", List.of("name", "coord", "type", "faction", "code"),
            "civs", List.of("name", "type", "level", "code"),
            "goods", List.of("name", "cat", "seller", "code"),
            "realms", List.of("name", "code"),
            "arts", List.of("name", "type", "from_source"),
            "characters", List.of("name", "title", "camp", "code")
    );

    @GetMapping("/{module}")
    public Result<PageResult<Object>> list(@PathVariable String module,
                                           @RequestParam(defaultValue = "") String keyword,
                                           @RequestParam(defaultValue = "1") long page,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        List<String> cols = SEARCH_COLS.get(module);
        if (cols == null) {
            return Result.fail("未知模块：" + module);
        }
        String kw = keyword == null ? "" : keyword.trim();
        PageResult<Object> pr = withMapper(module, mapper -> {
            long total = countBy(mapper, cols, kw);
            long offset = Math.max(0, (Math.max(1, page) - 1) * size);
            QueryWrapper<?> qw = buildWrapper(cols, kw);
            qw.last("LIMIT " + offset + "," + Math.max(1, Math.min(size, 100)));
            List<?> rows = mapper.selectList(qw);
            return PageResult.of(total, page, size, new ArrayList<>(rows));
        });
        if (pr == null) {
            return Result.fail("未知模块：" + module);
        }
        return Result.ok(pr);
    }

    @PostMapping("/{module}")
    public Result<Void> create(@PathVariable String module,
                               @RequestBody Map<String, Object> body,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        try {
            Object saved = withMapper(module, mapper -> {
                mapper.insert(toEntity(module, body));
                return Boolean.TRUE;
            });
            return saved == null ? Result.fail("未知模块：" + module) : Result.ok();
        } catch (Exception e) {
            return Result.fail("保存失败：" + e.getMessage());
        }
    }

    @PutMapping("/{module}/{id}")
    public Result<Void> update(@PathVariable String module,
                               @PathVariable Long id,
                               @RequestBody Map<String, Object> body,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        try {
            body.put("id", id);
            Object saved = withMapper(module, mapper -> {
                mapper.updateById(toEntity(module, body));
                return Boolean.TRUE;
            });
            return saved == null ? Result.fail("未知模块：" + module) : Result.ok();
        } catch (Exception e) {
            return Result.fail("更新失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/{module}/{id}")
    public Result<Void> delete(@PathVariable String module,
                               @PathVariable Long id,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        Integer n = withMapper(module, mapper -> mapper.deleteById(id));
        if (n == null) {
            return Result.fail("未知模块：" + module);
        }
        return n > 0 ? Result.ok() : Result.fail("记录不存在");
    }

    // ------------------------------------------------------------
    // 内部工具
    // ------------------------------------------------------------

    private boolean checkAdmin(String auth) {
        AdminUser admin = AdminAuthController.currentAdmin(adminTokenStore, adminUserMapper, auth);
        return admin != null;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private <R> R withMapper(String module, Function<BaseMapper, R> fn) {
        BaseMapper mapper = switch (module) {
            case "regions" -> regionMapper;
            case "civs" -> civMapper;
            case "goods" -> goodMapper;
            case "realms" -> realmMapper;
            case "arts" -> artMapper;
            case "characters" -> characterMapper;
            default -> null;
        };
        return mapper == null ? null : fn.apply(mapper);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private long countBy(BaseMapper mapper, List<String> cols, String kw) {
        return mapper.selectCount(buildWrapper(cols, kw));
    }

    private QueryWrapper<?> buildWrapper(List<String> cols, String kw) {
        QueryWrapper<?> qw = new QueryWrapper<>();
        if (!kw.isEmpty()) {
            qw.and(w -> {
                for (String c : cols) {
                    w.or().like(c, kw);
                }
            });
        }
        qw.orderByAsc("sort_order").orderByAsc("id");
        return qw;
    }

    /** 前端提交的字段名与 lore.js 一致，这里转成对应实体 */
    @SuppressWarnings("unchecked")
    private Object toEntity(String module, Map<String, Object> body) {
        Map<String, Object> b = body == null ? Map.of() : body;
        return switch (module) {
            case "regions" -> fill(new StarRegion(), b, "resources", "events");
            case "civs" -> fill(new Civilization(), b, "traits");
            case "goods" -> fill(new GoodItem(), b);
            case "realms" -> fill(new CultivateRealm(), b, "powers");
            case "arts" -> fill(new SecretArt(), b);
            case "characters" -> fill(new CharacterProfile(), b, "tags", "intro", "stats", "timeline", "relations", "ability");
            default -> null;
        };
    }

    @SuppressWarnings("unchecked")
    private <T> T fill(T entity, Map<String, Object> body, String... jsonFields) {
        Map<String, Object> src = new java.util.HashMap<>(body);
        Object idVal = src.get("id"); // 更新时需要保留实体主键
        // 前端键名 → 实体字段名
        rename(src, "id", "code");
        rename(src, "min", "minPower");
        rename(src, "from", "fromSource");
        rename(src, "desc", "description");
        for (Map.Entry<String, Object> e : src.entrySet()) {
            String key = e.getKey();
            Object v = e.getValue();
            boolean isJsonField = false;
            for (String f : jsonFields) {
                if (f.equals(key)) {
                    isJsonField = true;
                    break;
                }
            }
            if (isJsonField) {
                // 前端提交的数组/对象 → JSON 字符串存储
                setField(entity, key, toJson(v));
            } else {
                setField(entity, key, v);
            }
        }
        if (idVal instanceof Number n) {
            setField(entity, "id", n.longValue());
        }
        return entity;
    }

    private void rename(Map<String, Object> src, String from, String to) {
        if (src.containsKey(from)) {
            Object v = src.remove(from);
            if (to != null && !src.containsKey(to)) {
                src.put(to, v);
            }
        }
    }

    private String toJson(Object v) {
        if (v == null) {
            return null;
        }
        if (v instanceof String s) {
            return s; // 前端也可以直接提交 JSON 字符串
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(v);
        } catch (Exception e) {
            return null;
        }
    }

    /** 宽松属性赋值：数字字符串转数字、布尔转 0/1 等 */
    private void setField(Object entity, String name, Object value) {
        if (value == null) {
            return;
        }
        try {
            java.lang.reflect.Field f = entity.getClass().getDeclaredField(name);
            f.setAccessible(true);
            Object v = value;
            Class<?> ft = f.getType();
            if (ft == Integer.class || ft == int.class) {
                v = v instanceof Number n ? n.intValue() : Integer.parseInt(String.valueOf(value));
            } else if (ft == Long.class || ft == long.class) {
                v = v instanceof Number n ? n.longValue() : Long.parseLong(String.valueOf(value));
            } else if (ft == String.class) {
                v = String.valueOf(value);
            }
            f.set(entity, v);
        } catch (NoSuchFieldException ignored) {
            // 前端多传的字段直接忽略（如 createdAt/updatedAt）
        } catch (Exception e) {
            throw new RuntimeException("字段 " + name + " 赋值失败: " + e.getMessage(), e);
        }
    }
}

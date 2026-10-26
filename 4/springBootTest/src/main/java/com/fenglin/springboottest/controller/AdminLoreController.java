package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.PageResult;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.AdminUser;
import com.fenglin.springboottest.entity.CharacterProfile;
import com.fenglin.springboottest.entity.Civilization;
import com.fenglin.springboottest.entity.CultivateRealm;
import com.fenglin.springboottest.entity.GoodItem;
import com.fenglin.springboottest.entity.SecretArt;
import com.fenglin.springboottest.mapper.AdminUserMapper;
import com.fenglin.springboottest.mapper.CharacterProfileMapper;
import com.fenglin.springboottest.mapper.CivilizationMapper;
import com.fenglin.springboottest.mapper.CultivateRealmMapper;
import com.fenglin.springboottest.mapper.GoodItemMapper;
import com.fenglin.springboottest.mapper.SecretArtMapper;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * 后台数据管理：前台四大展示模块统一 CRUD（分页列表 + 关键词搜索 + 新增 + 修改 + 删除）。
 * <ul>
 *   <li>civs       文明图鉴</li>
 *   <li>goods      奇物交易</li>
 *   <li>realms     意识修炼（境界，秘法存于 arts 表并随境界一起返回/保存）</li>
 *   <li>characters 人物档案</li>
 * </ul>
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
    private CivilizationMapper civMapper;
    @Autowired
    private GoodItemMapper goodMapper;
    @Autowired
    private CultivateRealmMapper realmMapper;
    @Autowired
    private SecretArtMapper artMapper;
    @Autowired
    private CharacterProfileMapper characterMapper;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    /** 各模块的模糊搜索列 */
    private static final Map<String, List<String>> SEARCH_COLS = Map.of(
            "civs", List.of("name", "type", "level", "code", "status_text"),
            "goods", List.of("name", "cat", "seller", "rarity", "code"),
            "realms", List.of("name", "code", "gate"),
            "characters", List.of("name", "title", "camp", "realm", "code")
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
        long limit = Math.max(1, Math.min(size, 100));
        PageResult<Object> pr = withMapper(module, mapper -> {
            QueryWrapper<?> qw = buildWrapper(cols, kw);
            long total = mapper.selectCount(qw);
            QueryWrapper<?> pageQw = buildWrapper(cols, kw);
            pageQw.last("LIMIT " + Math.max(0, (Math.max(1, page) - 1) * limit) + "," + limit);
            List<Object> rows = new ArrayList<>();
            for (Object row : (List<?>) mapper.selectList(pageQw)) {
                rows.add(toView(module, row));
            }
            return PageResult.of(total, page, limit, rows);
        });
        if (pr == null) {
            return Result.fail("未知模块：" + module);
        }
        return Result.ok(pr);
    }

    @PostMapping("/{module}")
    public Result<Object> create(@PathVariable String module,
                                 @RequestBody Map<String, Object> body,
                                 @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        if (!SEARCH_COLS.containsKey(module)) {
            return Result.fail("未知模块：" + module);
        }
        try {
            Map<String, Object> data = body == null ? new HashMap<>() : new HashMap<>(body);
            Object entity = toEntity(module, data);
            if (entity == null) {
                return Result.fail("数据格式不正确");
            }
            withMapper(module, mapper -> {
                mapper.insert(entity);
                return Boolean.TRUE;
            });
            Long newId = idOf(entity);
            fillBlankCode(module, entity, newId);
            syncArts(module, newId, data.get("arts"));
            return Result.ok();
        } catch (Exception e) {
            return Result.fail("保存失败：" + rootMessage(e));
        }
    }

    @PutMapping("/{module}/{id}")
    public Result<Object> update(@PathVariable String module,
                                 @PathVariable Long id,
                                 @RequestBody Map<String, Object> body,
                                 @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        if (!SEARCH_COLS.containsKey(module)) {
            return Result.fail("未知模块：" + module);
        }
        try {
            Map<String, Object> data = body == null ? new HashMap<>() : new HashMap<>(body);
            data.put("id", id);
            Object entity = toEntity(module, data);
            if (entity == null) {
                return Result.fail("数据格式不正确");
            }
            withMapper(module, mapper -> {
                mapper.updateById(entity);
                return Boolean.TRUE;
            });
            syncArts(module, id, data.get("arts"));
            return Result.ok();
        } catch (Exception e) {
            return Result.fail("更新失败：" + rootMessage(e));
        }
    }

    @DeleteMapping("/{module}/{id}")
    public Result<Void> delete(@PathVariable String module,
                               @PathVariable Long id,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!checkAdmin(auth)) {
            return Result.fail(401, "未登录或登录已失效");
        }
        if (!SEARCH_COLS.containsKey(module)) {
            return Result.fail("未知模块：" + module);
        }
        Integer n = withMapper(module, mapper -> mapper.deleteById(id));
        if (n == null) {
            return Result.fail("未知模块：" + module);
        }
        if ("realms".equals(module)) {
            // 删除境界时一并清理其下的秘法，避免前台出现孤立数据
            artMapper.delete(new QueryWrapper<SecretArt>().eq("code", "realm:" + id));
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
            case "civs" -> civMapper;
            case "goods" -> goodMapper;
            case "realms" -> realmMapper;
            case "characters" -> characterMapper;
            default -> null;
        };
        return mapper == null ? null : fn.apply(mapper);
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

    /**
     * 实体 → 后台列表行：id 为数据库主键，code 为业务编号；
     * 同时把描述字段还原成实体名 description（与后台表单字段保持一致）。
     */
    private Object toView(String module, Object row) {
        if ("realms".equals(module)) {
            Map<String, Object> m = objectMapper.convertValue(row, new TypeReference<Map<String, Object>>() {
            });
            Long id = m.get("id") instanceof Number n ? n.longValue() : null;
            List<Map<String, Object>> arts = new ArrayList<>();
            for (SecretArt art : artMapper.selectList(
                    new QueryWrapper<SecretArt>().eq("code", "realm:" + id).orderByAsc("sort_order").orderByAsc("id"))) {
                Map<String, Object> a = new HashMap<>();
                a.put("name", art.getName());
                a.put("type", art.getType());
                a.put("from", art.getFromSource());
                a.put("desc", art.getDescription());
                a.put("risk", art.getRisk());
                arts.add(a);
            }
            m.put("arts", arts);
            m.remove("createdAt");
            m.remove("updatedAt");
            return m;
        }
        // 其他模块去掉审计字段（保留 id / code / sortOrder），避免前端回传时无法赋值
        Map<String, Object> m = objectMapper.convertValue(row, new TypeReference<Map<String, Object>>() {
        });
        m.remove("createdAt");
        m.remove("updatedAt");
        return m;
    }

    /** 前端提交的字段名与 lore.js 一致，这里转成对应实体 */
    private Object toEntity(String module, Map<String, Object> b) {
        return switch (module) {
            case "civs" -> fill(new Civilization(), b, "traits");
            case "goods" -> fill(new GoodItem(), b);
            case "realms" -> fill(new CultivateRealm(), b, "powers");
            case "characters" -> fill(new CharacterProfile(), b,
                    "tags", "intro", "stats", "timeline", "relations", "ability");
            default -> null;
        };
    }

    private Long idOf(Object entity) {
        if (entity instanceof Civilization e) {
            return e.getId();
        }
        if (entity instanceof GoodItem e) {
            return e.getId();
        }
        if (entity instanceof CultivateRealm e) {
            return e.getId();
        }
        if (entity instanceof CharacterProfile e) {
            return e.getId();
        }
        return null;
    }

    /** 新增时若业务编号留空，用记录主键兜底（code 有唯一索引，不能为空） */
    private void fillBlankCode(String module, Object entity, Long id) {
        if (id == null) {
            return;
        }
        String code = null;
        Object target = null;
        if (entity instanceof Civilization e) {
            code = e.getCode();
            target = e;
        } else if (entity instanceof GoodItem e) {
            code = e.getCode();
            target = e;
        } else if (entity instanceof CultivateRealm e) {
            code = e.getCode();
            target = e;
        } else if (entity instanceof CharacterProfile e) {
            code = e.getCode();
            target = e;
        }
        if (code != null && !code.isBlank()) {
            return;
        }
        String auto = id.toString();
        if (target instanceof Civilization e) {
            e.setCode(auto);
            civMapper.updateById(e);
        } else if (target instanceof GoodItem e) {
            e.setCode(auto);
            goodMapper.updateById(e);
        } else if (target instanceof CultivateRealm e) {
            e.setCode(auto);
            realmMapper.updateById(e);
        } else if (target instanceof CharacterProfile e) {
            e.setCode(auto);
            characterMapper.updateById(e);
        }
    }

    /**
     * 意识修炼的秘法列表：保存时整体替换该境界名下的秘法。
     * 秘法表通过 code = realm:{境界主键} 归属到境界，不污染前台展示字段。
     */
    private void syncArts(String module, Long realmId, Object arts) {
        if (!"realms".equals(module) || realmId == null) {
            return;
        }
        if (!(arts instanceof List<?> list)) {
            return; // 未提交 arts 字段时不改动已有秘法
        }
        artMapper.delete(new QueryWrapper<SecretArt>().eq("code", "realm:" + realmId));
        int i = 0;
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }
            String name = raw.get("name") == null ? "" : String.valueOf(raw.get("name")).trim();
            if (name.isEmpty()) {
                continue;
            }
            SecretArt art = new SecretArt();
            art.setCode("realm:" + realmId);
            art.setName(name);
            art.setType(str(raw.get("type")));
            art.setFromSource(str(raw.get("from")));
            art.setDescription(str(raw.get("desc")));
            art.setRisk(str(raw.get("risk")));
            art.setSortOrder(i++);
            artMapper.insert(art);
        }
    }

    private String str(Object v) {
        return v == null ? null : String.valueOf(v);
    }

    @SuppressWarnings("unchecked")
    private <T> T fill(T entity, Map<String, Object> body, String... jsonFields) {
        Map<String, Object> src = new HashMap<>(body);
        Object idVal = src.get("id");
        // 前台键名 → 实体字段名（code 是业务编号，与主键 id 严格区分）
        rename(src, "min", "minPower");
        rename(src, "from", "fromSource");
        rename(src, "desc", "description");
        for (Map.Entry<String, Object> e : src.entrySet()) {
            String key = e.getKey();
            if ("arts".equals(key)) {
                continue; // 秘法单独处理
            }
            Object v = e.getValue();
            boolean isJsonField = false;
            for (String f : jsonFields) {
                if (f.equals(key)) {
                    isJsonField = true;
                    break;
                }
            }
            if (isJsonField) {
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
            return objectMapper.writeValueAsString(v);
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
                v = v instanceof Number n ? n.intValue() : Integer.parseInt(String.valueOf(value).trim());
            } else if (ft == Long.class || ft == long.class) {
                v = v instanceof Number n ? n.longValue() : Long.parseLong(String.valueOf(value).trim());
            } else if (ft == String.class) {
                v = String.valueOf(value);
            }
            f.set(entity, v);
        } catch (NoSuchFieldException ignored) {
            // 前端多传的字段直接忽略（如 createdAt / updatedAt / arts）
        } catch (Exception e) {
            throw new RuntimeException("字段 " + name + " 赋值失败: " + e.getMessage(), e);
        }
    }

    private String rootMessage(Exception e) {
        Throwable t = e;
        while (t.getCause() != null && t.getCause() != t) {
            t = t.getCause();
        }
        String msg = t.getMessage();
        if (msg == null) {
            return e.getClass().getSimpleName();
        }
        if (msg.contains("Duplicate entry")) {
            return "编号已存在，请换一个编号";
        }
        return msg.length() > 160 ? msg.substring(0, 160) : msg;
    }
}

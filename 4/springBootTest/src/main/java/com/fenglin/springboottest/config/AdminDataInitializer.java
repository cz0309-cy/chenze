package com.fenglin.springboottest.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 后台系统初始化：
 * 1. admin_user 为空时创建管理员账号 admin / 123456（BCrypt）。
 * 2. 后台管理的 4 大模块（文明图鉴 / 奇物交易 / 意识修炼 / 人物档案）表为空时，
 *    从 classpath:lore-seed.json 写入与前端 lore.js 一致的演示数据。
 * 幂等：重复启动不会重复插入。
 */
@Component
public class AdminDataInitializer implements CommandLineRunner {

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

    private final ObjectMapper om = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        initAdmin();
        initLore();
    }

    private void initAdmin() {
        if (adminUserMapper.selectCount(null) > 0) {
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        admin.setPassword(new BCryptPasswordEncoder().encode("123456"));
        admin.setNickname("星域中枢管理员");
        adminUserMapper.insert(admin);
    }

    private void initLore() throws Exception {
        JsonNode root;
        try (var in = new ClassPathResource("lore-seed.json").getInputStream()) {
            root = om.readTree(in.readAllBytes());
        }
        if (civMapper.selectCount(null) == 0) {
            forEach(root.get("civs"), (node, i) -> {
                Civilization e = new Civilization();
                e.setCode(txt(node, "code"));
                e.setName(txt(node, "name"));
                e.setEn(txt(node, "en"));
                e.setType(txt(node, "type"));
                e.setLevel(txt(node, "level"));
                e.setStatus(txt(node, "status"));
                e.setStatusText(txt(node, "statusText"));
                e.setSpan(txt(node, "span"));
                e.setDanger(intv(node, "danger", 1));
                e.setDescription(txt(node, "desc"));
                e.setTraits(json(node, "traits"));
                e.setRelation(txt(node, "relation"));
                e.setNote(txt(node, "note"));
                e.setSortOrder(i);
                civMapper.insert(e);
            });
        }
        if (goodMapper.selectCount(null) == 0) {
            forEach(root.get("goods"), (node, i) -> {
                GoodItem e = new GoodItem();
                e.setCode(txt(node, "code"));
                e.setName(txt(node, "name"));
                e.setGlyph(txt(node, "glyph"));
                e.setCat(txt(node, "cat"));
                e.setRarity(txt(node, "rarity"));
                e.setPrice(node.hasNonNull("price") ? node.get("price").asLong() : null);
                e.setUnit(txt(node, "unit"));
                e.setSeller(txt(node, "seller"));
                e.setDescription(txt(node, "desc"));
                e.setStock(intv(node, "stock", 0));
                e.setHot(node.path("hot").asBoolean(false) ? 1 : 0);
                e.setSortOrder(i);
                goodMapper.insert(e);
            });
        }
        if (realmMapper.selectCount(null) == 0) {
            forEach(root.get("realms"), (node, i) -> {
                CultivateRealm e = new CultivateRealm();
                e.setCode(txt(node, "code"));
                e.setName(txt(node, "name"));
                e.setEn(txt(node, "en"));
                e.setMinPower(node.path("min").asLong(0));
                e.setGate(txt(node, "gate"));
                e.setPowers(json(node, "powers"));
                e.setCost(txt(node, "cost"));
                e.setDescription(txt(node, "desc"));
                e.setSortOrder(i);
                realmMapper.insert(e);
            });
        }
        if (artMapper.selectCount(null) == 0) {
            forEach(root.get("arts"), (node, i) -> {
                SecretArt e = new SecretArt();
                e.setCode("realm:" + realmId(i));
                e.setName(txt(node, "name"));
                e.setType(txt(node, "type"));
                e.setFromSource(txt(node, "from"));
                e.setDescription(txt(node, "desc"));
                e.setRisk(txt(node, "risk"));
                e.setSortOrder(i);
                artMapper.insert(e);
            });
        }
        if (characterMapper.selectCount(null) == 0) {
            forEach(root.get("characters"), (node, i) -> {
                CharacterProfile e = new CharacterProfile();
                e.setCode(txt(node, "code"));
                e.setName(txt(node, "name"));
                e.setEn(txt(node, "en"));
                e.setTitle(txt(node, "title"));
                e.setGlyph(txt(node, "glyph"));
                e.setRealm(txt(node, "realm"));
                e.setCamp(txt(node, "camp"));
                e.setTags(json(node, "tags"));
                e.setQuote(txt(node, "quote"));
                e.setIntro(json(node, "intro"));
                e.setStats(json(node, "stats"));
                e.setTimeline(json(node, "timeline"));
                e.setRelations(json(node, "relations"));
                e.setAbility(json(node, "ability"));
                e.setSortOrder(i);
                characterMapper.insert(e);
            });
        }
    }

    /** 秘法按索引归到第 i 个境界（lore-seed.json 中秘法数量与境界数量对齐） */
    private Long realmId(int index) {
        var realms = realmMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CultivateRealm>()
                        .orderByAsc("sort_order").orderByAsc("id"));
        if (realms.isEmpty()) {
            return null;
        }
        return realms.get(Math.min(index, realms.size() - 1)).getId();
    }

    private interface NodeConsumer {
        void accept(JsonNode node, int index);
    }

    private void forEach(JsonNode arr, NodeConsumer fn) {
        if (arr == null || !arr.isArray()) {
            return;
        }
        for (int i = 0; i < arr.size(); i++) {
            fn.accept(arr.get(i), i);
        }
    }

    private String txt(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return n == null || n.isNull() ? null : n.asText();
    }

    private int intv(JsonNode node, String field, int def) {
        JsonNode n = node.get(field);
        return n == null || n.isNull() ? def : n.asInt(def);
    }

    private String json(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return n == null || n.isNull() ? null : n.toString();
    }
}

package com.fenglin.springboottest.config;

import com.fenglin.springboottest.entity.HotWord;
import com.fenglin.springboottest.entity.StarEntry;
import com.fenglin.springboottest.mapper.HotWordMapper;
import com.fenglin.springboottest.service.StarEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 首页演示数据初始化：表为空时写入星域条目与热词，重复启动不会重复插入。
 */
@Component
public class HomeDataInitializer implements CommandLineRunner {

    @Autowired
    private StarEntryService entryService;

    @Autowired
    private HotWordMapper hotWordMapper;

    @Override
    public void run(String... args) {
        initEntries();
        initHotWords();
    }

    private void initEntries() {
        if (entryService.count() > 0) {
            return;
        }

        List<StarEntry> list = new ArrayList<>();
        list.add(entry("罗峰", "武者", "🗡",
                "精神念师，地球出身，从武者时代一路打进宇宙时代的男人。",
                "地球江南基地市走出的精神念师，继承陨墨星主传承，历经混沌城苦修与域外战场血战，最终登临宇宙之主。他的强大从来不只是念力，而是那股认死理的劲。",
                "精神念师,主角,地球", 980, 3241, 1));
        list.add(entry("巴巴塔", "智能", "🛰",
                "陨墨星主留下的智能生命，毒舌、可靠、信息量惊人。",
                "存储着陨墨星一脉几乎全部知识与秘法，是罗峰最早的导师，也是最久的同行者。吐槽是它的日常，护主是它的本能。",
                "智能生命,导师,陨墨星", 860, 2810, 2));
        list.add(entry("徐欣", "武者", "🌸",
                "罗峰之妻，温柔而坚定，地球大涅槃时期的中坚力量。",
                "与罗峰相识于微时，在他远征宇宙的那些年独自守住了地球后方。有人说她配不上宇宙之主的身份，罗峰的回答是：我打的每一仗，都是为了让她不用打。",
                "罗峰,地球,守护", 640, 1580, 3));
        list.add(entry("陨墨星主", "武者", "👁",
                "陨墨星一脉之主，留下无尽传承与一个话很多的智能生命。",
                "生前是纵横宇宙的强者，死后仍以传承的方式影响着后来者。他的陨墨星，是罗峰命运的转折点。",
                "传承,陨墨星,强者", 720, 1990, 4));
        list.add(entry("地球", "星球", "🌍",
                "太阳系第三行星，大涅槃之前的家园，一切故事的起点。",
                "大涅槃之后，人类在这颗蓝色星球上重建文明，从冷兵器对抗怪兽，到走出太阳系只用了不到两百年。星图上它很小，分量却最重。",
                "起源,太阳系,家园", 900, 4120, 5));
        list.add(entry("云雾星", "星球", "🪐",
                "云雾缭绕的修炼圣地，灵气充裕，强者辈出。",
                "被永久星云包裹的训练星域，重力可调，许多恒星级强者都在这里第一次学会意识外放。",
                "修炼,星云,训练场", 430, 980, 6));
        list.add(entry("幽暗宇宙", "秘境", "🌌",
                "与人类宇宙并存的黑暗位面，凶险与机缘并存。",
                "法则残缺、光线被吞没的位面。探索队的名单很长，返回的名单很短。图鉴对其的批注只有四个字：不建议前往。",
                "暗位面,秘境,高危", 780, 2210, 7));
        list.add(entry("混沌碑", "秘法", "📜",
                "混沌城主留下的九座石碑，铭刻着时空法则的奥义。",
                "每一座碑都是一条通往法则顶点的路。能进城的人不多，能看懂碑的人更少。参悟失败者会被困在碑内一瞬，而现实已过百年。",
                "法则,传承,混沌城", 840, 2450, 8));
        list.add(entry("时空法则", "法则", "⏳",
                "宇宙最高法则之一，掌控时间与空间的本源之力。",
                "时间与空间并非两条法则，而是同一枚硬币的两面。修至深处，可让一瞬变作百年，也可让万里缩成一步。",
                "时间,空间,本源", 910, 3100, 9));
        list.add(entry("虚拟宇宙公司", "组织", "🏛",
                "人类疆域最庞大的商业帝国，业务横跨整片星海。",
                "它不统治任何一颗星球，却掌握着几乎所有星球的交易、通讯与身份档案。在虚拟宇宙里，一次封号等同于现实中的抹除。",
                "商业,信息,人类疆域", 760, 2680, 10));
        list.add(entry("黑龙山帝国", "组织", "⚔",
                "以舰队起家的人类帝国，军功换爵位，爵位换星系。",
                "帝国法典第一条：任何个体的力量，都不得超越帝国本身。对异族强硬，对同胞同样强硬。",
                "帝国,舰队,军功", 610, 1420, 11));
        list.add(entry("意识能量", "法则", "🔮",
                "精神念师的根基力量，源于灵魂本源，可凝物伤敌于无形。",
                "念力不是蛮力，而是把「想」变成「做」的能力。从托起一枚硬币，到化出覆盖星域的铠甲，中间隔着一次次濒死的突破。",
                "精神念师,念力,灵魂", 690, 1730, 12));
        list.add(entry("雷神", "武者", "⚡",
                "地球最强的武者之一，罗峰的挚友，以雷入道。",
                "信奉的道理很简单：能动手的事，别吵。修法则不靠参悟，靠一次次把自己劈个半死。战场上永远冲在最前面，因为身后是家。",
                "雷之法则,挚友,地球", 700, 1860, 13));
        list.add(entry("虫族", "组织", "🐛",
                "由母巢意志统御的群体文明，人类疆域的头号威胁。",
                "个体没有名字，只有编号；死亡不计入损失，只计入消耗。它们不谈判，不俘虏，只把一切有机物转化为下一批虫群。",
                "异族,母巢,敌对", 560, 1290, 14));
        list.add(entry("机械族", "组织", "🤖",
                "自称「最优解」的机械文明，不恨人类，只是在计算。",
                "计算之后，它们认为人类的存在降低了宇宙的运算效率，于是开始优化——一颗星球、一颗星球地优化。",
                "异族,机械,逻辑", 520, 1100, 15));
        list.add(entry("混沌城", "组织", "🏯",
                "人类最高修行圣地，九座混沌碑所在之地。",
                "城内不设军队，因为不需要——住在城里的每一位，都足以独自终结一场星域战争。它从不参战，只安静地看着谁配得上下一代。",
                "圣地,混沌碑,师门", 800, 2360, 16));
        list.add(entry("宇宙海", "秘境", "🌊",
                "宇宙的尽头，也是一切法则的源头。",
                "这里没有航线，只有意志能决定你能游多远。抵达此处的强者已不需要星图——他们自己就是坐标。",
                "终局,本源,宇宙海", 880, 2900, 17));

        entryService.saveBatch(list);
    }

    private void initHotWords() {
        if (hotWordMapper.selectCount(null) > 0) {
            return;
        }
        String[] words = {"罗峰", "巴巴塔", "地球", "虚拟宇宙公司", "时空法则", "混沌碑", "混沌城", "雷神"};
        for (int i = 0; i < words.length; i++) {
            HotWord w = new HotWord();
            w.setWord(words[i]);
            w.setSortOrder(i + 1);
            hotWordMapper.insert(w);
        }
    }

    private StarEntry entry(String name, String category, String glyph, String summary, String detail,
                            String tags, int hotScore, int viewCount, int sortOrder) {
        StarEntry e = new StarEntry();
        e.setName(name);
        e.setCategory(category);
        e.setGlyph(glyph);
        e.setSummary(summary);
        e.setDetail(detail);
        e.setTags(tags);
        e.setHotScore(hotScore);
        e.setViewCount(viewCount);
        e.setSortOrder(sortOrder);
        return e;
    }
}

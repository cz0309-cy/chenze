package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 首页「星域热词」快捷检索词。
 */
@Data
@TableName("star_hot_word")
public class HotWord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 热词文本 */
    private String word;

    /** 排序，越小越靠前 */
    private Integer sortOrder;
}

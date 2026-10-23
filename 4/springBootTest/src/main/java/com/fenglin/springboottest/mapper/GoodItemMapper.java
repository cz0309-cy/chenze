package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.GoodItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GoodItemMapper extends BaseMapper<GoodItem> {
}

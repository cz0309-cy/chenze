package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.HotWord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HotWordMapper extends BaseMapper<HotWord> {
}

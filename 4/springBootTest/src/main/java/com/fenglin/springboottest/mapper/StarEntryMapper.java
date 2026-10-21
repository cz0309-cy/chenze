package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.StarEntry;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StarEntryMapper extends BaseMapper<StarEntry> {
}

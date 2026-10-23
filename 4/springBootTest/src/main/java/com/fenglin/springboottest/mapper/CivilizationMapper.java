package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.Civilization;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CivilizationMapper extends BaseMapper<Civilization> {
}

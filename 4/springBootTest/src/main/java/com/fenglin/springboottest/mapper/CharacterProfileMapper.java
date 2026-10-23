package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.CharacterProfile;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CharacterProfileMapper extends BaseMapper<CharacterProfile> {
}

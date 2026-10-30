package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("star_user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 账号（唯一） */
    private String username;

    /** 密码（BCrypt 加密存储） */
    private String password;

    /** 昵称 */
    private String nickname;

    /**
     * 权限：1=默认用户（普通星域战士），0=管理员（可进入后台管理系统）。
     * 注册用户默认为 1。
     */
    private Integer permission;

    /** 创建时间 */
    private LocalDateTime createdAt;
}

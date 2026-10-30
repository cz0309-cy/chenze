package com.fenglin.springboottest.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String nickname;
    /** 权限：1=默认用户，0=管理员（可进后台管理系统） */
    private Integer permission;

    public LoginResponse(String token, String username, String nickname) {
        this.token = token;
        this.username = username;
        this.nickname = nickname;
        this.permission = null;
    }
}

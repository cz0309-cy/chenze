package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.controller.dto.LoginRequest;
import com.fenglin.springboottest.entity.AdminUser;
import com.fenglin.springboottest.mapper.AdminUserMapper;
import com.fenglin.springboottest.service.AdminTokenStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 后台管理员认证（仅登录 / 会话校验 / 注销，无注册功能）。
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminUserMapper adminUserMapper;

    @Autowired
    private AdminTokenStore adminTokenStore;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** 管理员登录（无注册功能） */
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody LoginRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return Result.fail("请输入管理员账号与密码");
        }
        AdminUser admin = adminUserMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AdminUser>()
                        .eq("username", req.getUsername().trim()));
        if (admin == null || !encoder.matches(req.getPassword(), admin.getPassword())) {
            return Result.fail("管理员账号或密码不正确");
        }
        String token = adminTokenStore.createToken(admin.getId());
        return Result.ok(Map.of(
                "token", token,
                "username", admin.getUsername(),
                "nickname", admin.getNickname() == null ? admin.getUsername() : admin.getNickname()
        ));
    }

    /** 校验当前管理员会话 */
    @GetMapping("/me")
    public Result<Map<String, String>> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        AdminUser admin = currentAdmin(auth);
        if (admin == null) {
            return Result.fail(401, "未登录或登录已失效");
        }
        return Result.ok(Map.of(
                "username", admin.getUsername(),
                "nickname", admin.getNickname() == null ? admin.getUsername() : admin.getNickname()
        ));
    }

    /** 注销 */
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization", required = false) String auth) {
        String token = parseToken(auth);
        if (token != null) {
            adminTokenStore.remove(token);
        }
        return Result.ok();
    }

    /** 供其他后台 Controller 校验管理员身份 */
    public static AdminUser currentAdmin(AdminTokenStore store, AdminUserMapper mapper, String auth) {
        String token = parseTokenStatic(auth);
        if (token == null) {
            return null;
        }
        Long id = store.getAdminId(token);
        if (id == null) {
            return null;
        }
        return mapper.selectById(id);
    }

    private AdminUser currentAdmin(String auth) {
        return currentAdmin(adminTokenStore, adminUserMapper, auth);
    }

    private String parseToken(String auth) {
        return parseTokenStatic(auth);
    }

    private static String parseTokenStatic(String auth) {
        if (auth == null) {
            return null;
        }
        String t = auth.trim();
        if (t.startsWith("Bearer ")) {
            return t.substring(7).trim();
        }
        if (t.startsWith("Bearer")) {
            return t.substring(6).trim();
        }
        return t;
    }
}

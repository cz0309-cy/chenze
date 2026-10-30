package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.controller.dto.LoginRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
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
 * <p>
 * 后台管理系统的管理员即「用户表 star_user 中权限=0 的用户」：
 * 只有 permission=0 的用户才能登录后台；permission=1 的默认用户无法登录后台。
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AdminTokenStore adminTokenStore;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** 管理员登录（无注册功能）：仅 star_user 中 permission=0 的用户可登录 */
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody LoginRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return Result.fail("请输入管理员账号与密码");
        }
        User user = userMapper.selectOne(
                new QueryWrapper<User>().eq("username", req.getUsername().trim()));
        if (user == null) {
            return Result.fail("管理员账号或密码不正确");
        }
        // 明文优先，兼容历史 BCrypt 密文
        String stored = user.getPassword();
        boolean pwOk = req.getPassword().equals(stored)
                || (stored != null && stored.startsWith("$2") && encoder.matches(req.getPassword(), stored));
        if (!pwOk) {
            return Result.fail("管理员账号或密码不正确");
        }
        // 权限校验：只有 permission=0（管理员）可进入后台
        if (user.getPermission() == null || user.getPermission() != 0) {
            return Result.fail("当前账号无后台管理权限");
        }
        String token = adminTokenStore.createToken(user.getId());
        return Result.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "nickname", user.getNickname() == null ? user.getUsername() : user.getNickname()
        ));
    }

    /** 校验当前管理员会话 */
    @GetMapping("/me")
    public Result<Map<String, String>> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        User user = currentAdmin(auth);
        if (user == null) {
            return Result.fail(401, "未登录或登录已失效");
        }
        return Result.ok(Map.of(
                "username", user.getUsername(),
                "nickname", user.getNickname() == null ? user.getUsername() : user.getNickname()
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

    /** 供其他后台 Controller 校验管理员身份（返回 star_user，权限必须为 0） */
    public static User currentAdmin(AdminTokenStore store, UserMapper mapper, String auth) {
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

    private User currentAdmin(String auth) {
        return currentAdmin(adminTokenStore, userMapper, auth);
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

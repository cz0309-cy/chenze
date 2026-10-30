package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public int register(String username, String password) {
        Long count = lambdaQuery().eq(User::getUsername, username).count();
        if (count != null && count > 0) {
            return -1;
        }
        User user = new User();
        user.setUsername(username);
        // 明文存储（需求要求不加密）
        user.setPassword(password);
        // 注册用户默认权限=1（普通用户），仅后台置 0 可进后台管理系统
        user.setPermission(1);
        user.setNickname(username);
        user.setCreatedAt(LocalDateTime.now());
        save(user);
        return 0;
    }

    @Override
    public User login(String username, String password) {
        User user = lambdaQuery().eq(User::getUsername, username).one();
        if (user == null) {
            return null;
        }
        String stored = user.getPassword();
        // 明文优先匹配（需求要求明文存储）
        if (password != null && password.equals(stored)) {
            return user;
        }
        // 兼容历史 BCrypt 密文（首次切换明文时旧账号仍可登录）
        if (stored != null && stored.startsWith("$2") && encoder.matches(password, stored)) {
            return user;
        }
        return null;
    }
}

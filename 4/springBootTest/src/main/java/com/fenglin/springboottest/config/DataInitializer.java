package com.fenglin.springboottest.config;

import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 首次启动时自动创建管理员演示账号（明文存储，权限=0 可进后台管理系统）：
 *   - chenze    / 123456
 *   - czxhcyd   / 5201314
 * 若账号已存在，则确保其密码为明文、权限为管理员（兼容历史数据）。
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) {
        ensureAdmin("chenze", "123456", "星河守护者");
        ensureAdmin("czxhcyd", "5201314", "次元守护者");
    }

    /** 确保指定账号存在且为管理员（明文密码 + permission=0）。 */
    private void ensureAdmin(String username, String password, String nickname) {
        User existing = userService.lambdaQuery().eq(User::getUsername, username).one();
        if (existing == null) {
            User admin = new User();
            admin.setUsername(username);
            admin.setPassword(password);   // 明文存储
            admin.setPermission(0);        // 管理员：可进入后台管理系统
            admin.setNickname(nickname);
            admin.setCreatedAt(LocalDateTime.now());
            userService.save(admin);
        } else {
            boolean needUpdate = false;
            if (existing.getPermission() == null || existing.getPermission() != 0) {
                existing.setPermission(0);
                needUpdate = true;
            }
            // 历史数据可能仍是 BCrypt 密文或其它密码，统一回退为指定明文
            if (existing.getPassword() == null || !existing.getPassword().equals(password)) {
                existing.setPassword(password);
                needUpdate = true;
            }
            if (needUpdate) {
                userService.updateById(existing);
            }
        }
    }
}

package com.fenglin.springboottest.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 后台管理员令牌存储（独立于前台 TokenStore，两套 token 互不通用）。
 */
@Service
public class AdminTokenStore {

    private final Map<String, Long> store = new ConcurrentHashMap<>();

    public String createToken(Long adminId) {
        String token = "adm-" + UUID.randomUUID().toString().replace("-", "")
                + Long.toHexString(System.currentTimeMillis());
        store.put(token, adminId);
        return token;
    }

    public Long getAdminId(String token) {
        return store.get(token);
    }

    public void remove(String token) {
        store.remove(token);
    }
}

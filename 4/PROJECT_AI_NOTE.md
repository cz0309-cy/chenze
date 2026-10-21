# 吞噬星空 项目 · AI 启动索引 (PROJECT_AI_NOTE.md)

> 本文件供 AI 助手快速理解项目，避免本机每次重置后重新探索。
> 重置约定：node_modules、target 会被清空；MySQL 服务保留，但库可能需重建。
> 下次启动本项目，请先读本文件，然后直接跑 `start.bat` / `pause.bat`。

## 0. 一句话结论
一套「星域登录/注册」全栈 Demo：Spring Boot 后端 + Vue3 前端，MySQL 存储。
启动顺序：MySQL → 建库 → 构建后端 → 起后端(8081) → 装前端依赖 → 起前端(5173)。
已提供 `start.bat` / `pause.bat` 一键启停（GBK 编码，路径基于脚本目录可移动）。

## 1. 项目结构
- `springBootTest/` —— 后端 (Spring Boot 3.4.5 / MyBatis-Plus 3.5.9 / MySQL8 / BCrypt)
  - 启动类：`src/main/java/com/fenglin/springboottest/SpringBootTestApplication.java`
  - 配置：`src/main/resources/application-dev.properties`（端口 8081，数据源 root/123456，库 swallowed_star）
  - 启动建表：`src/main/resources/schema.sql`（**只建表，不建库**）
  - 本地建库建表脚本：`star_user.sql`（根目录，幂等，必须先执行以保证库存在）
  - 构建产物：`target/springBootTest-0.0.1-SNAPSHOT.jar`
- `swallowed-star-vue/` —— 前端 (Vue3 + Vite5)
  - 代理：`vite.config.js` 把 `/api` 代理到 `http://localhost:8081`
  - 脚本：`npm run dev`(5173) / build / preview / lint / format
  - 依赖锁：`package-lock.json` 存在，可用 `npm ci`

## 2. 本机环境（已验证 2026-10-15）
- Java：OpenJDK 21 (Zulu) ✅ 满足 Spring Boot 3.4.5 需要 17+
- Node：v22.22.2 / npm 10.9.7 ✅
- Maven：不在 PATH；IDEA 装在 **D 盘**，用 IDEA 自带 →
  `D:\IntelliJ IDEA 2024.3.2.2\plugins\maven\lib\maven3\bin\mvn.cmd`
  - `start.bat` 已做多候选路径探测：先试 D 盘已知路径，再扫 `C:\Program Files\JetBrains\IntelliJ IDEA *`、`D:\IntelliJ IDEA *` 等，最后退回项目 `springBootTest/mvnw.cmd`（wrapper 会下载 Maven 3.9.9，README 提示个别环境会损坏，优先用 IDEA Maven）
  - `~/.m2/repository` 已缓存 763M，可离线构建
- MySQL：服务名 `MySQL80`（当前运行中）；客户端
  `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`；账号 root / 123456；
  库 `swallowed_star` 初始不存在（需初始化）

## 3. 启动步骤（下次直接跑 start.bat，无需逐步手动）
1. `net start MySQL80`（若已运行忽略）
2. `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 < springBootTest\star_user.sql`（建库+表，幂等）
3. 后端构建：`mvn -DskipTests package`（在 springBootTest 目录；target 被清空需重建）
4. 后端运行：`java -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081 --spring.profiles.active=dev`
5. 前端：`cd swallowed-star-vue && npm install && npm run dev`（node_modules 被清空需重装）
- 演示账号：`admin / 123456`（后端首次启动由 DataInitializer 自动创建）

## 4. 常见坑（已写进脚本，这里留给 AI 复盘）
- `schema.sql` 只建表不建库 → 必须先跑 `star_user.sql`，否则后端起不来。
- Maven 不在 PATH → 用 IDEA 自带 Maven 绝对路径（脚本已处理）。
- MySQL 客户端不在 PATH → 脚本用绝对路径。
- node_modules / target 每次重置被删 → 脚本每次重新 install / package。
- 若重置把 `~/.m2` 也清了，首次 `mvn package` 需联网下载依赖。

## 5. 启停脚本说明
- `start.bat`（GBK）：一键执行上面 1–5，后端/前端各开一个命令行窗口常驻。
- `pause.bat`（GBK）：按端口 8081/5173 杀进程并关闭窗口（保留 MySQL）。
- 路径全部基于 `%~dp0`（脚本所在目录）的相对引用，项目文件夹可整体移动。

## 6. 接口速查
- 基址：`http://127.0.0.1:8081/api`
- GET `/api/auth/me`（带 `Authorization: Bearer <token>`）
- POST `/api/auth/login` `{username,password}` → token
- POST `/api/auth/register` `{username,password}`
- POST `/api/auth/logout`
- GET `/api/home/overview` —— 首页聚合：条目总数、分类统计、热词、6 条推荐
- GET `/api/home/entries?keyword=&category=&sort=&page=1&size=12` —— 检索/分页，sort 取 `hot`/`new`/空
- GET `/api/home/entries/{id}` —— 条目详情，同时 `view_count + 1`（不存在返回 code=404）

## 7. 首页后端实现（2026-10-19）
**表**（`schema.sql` 启动自动建、`star_user.sql` 手动建，均幂等）
- `star_entry`：id / name / category / glyph / summary / detail / tags / hot_score / view_count / sort_order / created_at / updated_at
- `star_hot_word`：id / word（唯一）/ sort_order

**代码**
- `entity/StarEntry.java`、`entity/HotWord.java`
- `mapper/StarEntryMapper.java`、`mapper/HotWordMapper.java`
- `service/StarEntryService.java` + `impl/StarEntryServiceImpl.java`
  - 检索用 `like` 同时匹配 name / summary / tags / category；分类精确匹配；排序 hot / new / 综合
  - **未引入分页插件**（3.5.9 需额外 `mybatis-plus-jsqlparser`），改用 `count()` + `LIMIT offset,size`，避免离线环境拉不到依赖
- `controller/HomeController.java`（`/api/home`）
- `config/HomeDataInitializer.java`：表为空时写入 17 条星域条目 + 8 个热词（中文/emoji 走 Java 源码，避免 SQL 脚本编码问题）

**前端**
- `src/api/http.js`（统一 request）、`src/api/home.js`（overview / entries / entry）
- `Home.vue` 已改为全后端驱动：概览统计、热词、分类筛选、关键词检索、综合/最热/最新排序、分页、骨架屏、错误重试、详情弹层（Teleport）

## 8. 前端页面与模块（2026-10-19 扩充）
所有页面统一使用 `components/SiteNav.vue`（原 Home 内联导航已抽出，六项菜单 + 时钟 + 退出）。
路由均在 `meta.auth` 保护下，无 `ss_token` 跳登录页。

| 路由 | 文件 | 内容 |
| --- | --- | --- |
| `/home` | `views/Home.vue` | 星域首页：后端聚合数据 + 检索/分类/排序/分页 + 详情弹层 |
| `/explore` | `views/Explore.vue` | 星海探索：SVG 星图（7 星域）、星域详情、推进探索、航行日志 |
| `/codex` | `views/Codex.vue` | 文明图鉴：9 条文明，类型筛选 + 关键词检索 + 右侧详情 |
| `/market` | `views/Market.vue` | 奇物交易：11 件货品、稀有度、采购清单与余额结算 |
| `/cultivate` | `views/Cultivate.vue` | 意识修炼：七境阶梯、境界详情、念力推演滑杆、四大秘法 |
| `/character` | `views/Character.vue` | 人物档案：罗峰 / 巴巴塔 / 徐欣 / 雷神，含能力条、时间线、关系网 |

- 数据层：`src/data/lore.js`（STAR_REGIONS / CIVS / GOODS / REALMS / ARTS / CHARACTERS），全部为前端演示数据，接后端时按同名结构替换即可。
- 样式：`src/styles/pages.css`（模块页专属，已在 `main.js` 引入），沿用 `style.css` 的 CSS 变量与金色科幻风格。
- 备份：`src_backup_20261019/`（本次改动前的 src 快照，确认无误后可删）。


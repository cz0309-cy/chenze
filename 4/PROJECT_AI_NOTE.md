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
  - 本地建库建表脚本：**`swallowed_star.sql`**（项目根目录；Navicat 导出，**只含 CREATE TABLE 不含建库**，
    且带 `DROP TABLE IF EXISTS`，属破坏性全量导入，仅在首次重建时手动跑一次）
  - ✅ 2026-11-06 更正：旧文档写的 `star_user.sql` **已不存在**（已改名为 `swallowed_star.sql`），
    `start.bat` 第 2 步原先引用它导致建库静默失败 → 后端报 `Unknown database 'swallowed_star'`。
    已改为 `CREATE DATABASE IF NOT EXISTS`（幂等、不破坏数据），表仍由启动时 `schema.sql` 自动创建。
  - 构建产物：`target/springBootTest-0.0.1-SNAPSHOT.jar`
- `swallowed-star-vue/` —— 前端 (Vue3 + Vite5)
  - 代理：`vite.config.js` 把 `/api` 代理到 `http://192.168.68.17:8081`（局域网 IP，见第 11 节）
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
2. 建库：`mysql -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS swallowed_star DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"`
   （表由后端启动时 `schema.sql` 自动建；需要完整种子数据时再手动导入根目录 `swallowed_star.sql`，注意它会先 DROP TABLE）
3. 后端构建：`mvn -DskipTests package`（在 springBootTest 目录；target 被清空需重建）
4. 后端运行：`java -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081 --spring.profiles.active=dev`
5. 前端：`cd swallowed-star-vue && npm install && npm run dev`（node_modules 被清空需重装）
- 演示账号：`chenze / 123456`（star_user 表，明文存储，permission=0 可登前台+后台）；
  ⚠️ 旧账号 `admin / 123456` 已不存在（star_user 无 admin 行，DataInitializer 仅在表为空时创建）

## 4. 常见坑（已写进脚本，这里留给 AI 复盘）
- `schema.sql` 只建表不建库 → **库不存在时后端直接 `Unknown database 'swallowed_star'` 启动失败**
  （2026-11-06 实际踩到：重置后库被删，`start.bat` 又引用了已改名的 `star_user.sql`，建库步骤静默失败）。
  排查口令：日志 `springBootTest/log/xx.log` 末尾搜 `Unknown database`。
- Maven 不在 PATH → 用 IDEA 自带 Maven 绝对路径（脚本已处理）。
- MySQL 客户端不在 PATH → 脚本用绝对路径。
- node_modules / target 每次重置被删 → 脚本每次重新 install / package。
- 若重置把 `~/.m2` 也清了，首次 `mvn package` 需联网下载依赖。
- ⚠️ 2026-11-04：路由曾引入未创建的 `Mahjong.vue`（星兽狩猎）/`ArtHall.vue`（功法阁），
  Vite 报 `Failed to resolve import` 导致全站白屏。已暂时注释掉这两条路由和导航/首页入口
  （router/index.js 中有 TODO），补做页面后恢复即可。
  **教训：新增路由前必须先确认组件文件存在，否则整站打不开。**

## 5. 启停脚本说明
- `start.bat`（GBK）：一键执行上面 1–5，后端/前端各开一个命令行窗口常驻。
- `pause.bat`（GBK）：按端口 8081/5173 杀进程并关闭窗口（保留 MySQL）。
- 路径全部基于 `%~dp0`（脚本所在目录）的相对引用，项目文件夹可整体移动。

## 6. 接口速查
- 本机基址：`http://127.0.0.1:8081/api`
- 局域网基址：`http://192.168.68.17:8081/api`
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

## 9. 后台管理系统（2026-10-26 收敛为四模块）
前台导航栏新增「后台管理系统」按钮 → `/admin/login`（仅登录无注册）→ `/admin` 数据管理台。
**管理范围严格限定为前台四个功能模块：文明图鉴 / 奇物交易 / 意识修炼 / 人物档案。**
`regions`（星海探索）、`arts`（秘法独立模块）已从后台移除，前台 `/explore` 页面本身保留但不再由后台管理。

**表**（`schema.sql` / `star_user.sql` 均已加，启动幂等）
- ⚠️ 2026-11-04 更正：`admin_user` 表已废弃。当前 `AdminAuthController` 改为查 `star_user` 中
  `permission=0` 的用户作为管理员，密码「明文优先、兼容 BCrypt」；后台登录用 `chenze / 123456`
- `admin_user`（历史遗留，代码已不再使用）：初始账号 `admin / 123456`（BCrypt，AdminDataInitializer 创建）
- `civilization`（文明图鉴）/ `good_item`（奇物交易）/
  `cultivate_realm` + `secret_art`（意识修炼：境界+秘法）/ `character_profile`（人物档案）
- 嵌套结构（资源/事件/特征/能力条/时间线/关系网等）以 `*_json` TEXT 列存 JSON 数组
- 种子数据：`src/main/resources/lore-seed.json`（由前端 lore.js 转换，code 字段对应前端 id），
  表为空时由 `AdminDataInitializer` 自动写入
- **主键与业务编号分离**：`id` BIGINT 自增（物理主键），`code` VARCHAR 唯一（业务编号，前台 `id` 取自它）。
  新增时 code 留空则用主键兜底（`fillBlankCode`）。

**秘法归属方案**
- `secret_art` 新增 `code VARCHAR(32)` 列，格式 `realm:{境界主键}`，用于标记该秘法属于哪个境界
- 保存境界时 `syncArts()` 按该归属**整体替换**（先删后插），即秘法随境界一起保存
- 历史库升级：`star_user.sql` 末尾带幂等 `ALTER TABLE secret_art ADD COLUMN code ...`

**后端接口**
- `POST /api/admin/auth/login|logout`、`GET /api/admin/auth/me` —— 管理员认证，token 前缀 `adm-`，
  与前台 token（TokenStore）完全独立
- `GET/POST /api/admin/lore/{module}`、`PUT/DELETE /api/admin/lore/{module}/{id}` —— 统一 CRUD，
  **module 仅四值：civs|goods|realms|characters**；list 支持 keyword（按模块搜索列模糊匹配）+ page/size 分页；
  全部需要 `Authorization: Bearer <admin token>`，未登录返回 code=401
  - `AdminLoreController.toView()` 会剔除 `createdAt/updatedAt`，否则前端回传时反射赋值 String→LocalDateTime 报错
  - `ObjectMapper` 必须注册 `JavaTimeModule`，否则 realms 列表序列化 LocalDateTime 直接 500
  - 编号重复时 `Duplicate entry` 转成中文提示「编号已存在，请换一个编号」
- `GET /api/lore/{module}` —— 前台只读接口，返回结构与 lore.js 一致（code→id、minPower→min、
  fromSource→from、hot→bool、description→desc、JSON 字符串→数组/对象）
  - `realms` 会为**每个**境界显式输出 `arts` 数组（无秘法则空数组），未归属秘法并入首个境界；
    实现靠 `realmIdOfCode()` 用前端编号反查主键，避免直接拿 code 当主键查
- 注意：`desc` 是 MySQL 保留字，实体统一用 `description` 字段映射 description 列

**前端**
- `api/admin.js`（ss_admin_token 独立存储 + admin CRUD 封装）、`api/lore.js`（前台数据拉取）
- `admin/modules.js` —— **4 大模块**的列表列 / 表单字段配置（驱动通用 CRUD 页）：
  | key | 标题 | 说明 |
  | --- | --- | --- |
  | `civs` | 文明图鉴 | 前台 /codex |
  | `goods` | 奇物交易 | 前台 /market |
  | `realms` | 意识修炼 | 前台 /cultivate，秘法作为 `list` 字段随境界一起编辑 |
  | `characters` | 人物档案 | 前台 /character |
- 字段类型系统：`text / textarea / number / lines（数组每行一条）/ json / select / switch / list（对象数组）`
- `views/admin/AdminLogin.vue`（登录页，无注册入口）、`AdminLayout.vue`（侧边栏布局+会话校验）、
  `AdminCrud.vue`（通用增删改查：分页/搜索/弹窗表单；`onMounted(() => reload())` 必须保留，否则列表恒空）
- 路由：`/admin/login`、`/admin/:module`，`/admin` 默认 redirect 到 `/admin/civs`；
  守卫按 `to.path.startsWith('/admin')` 判断（父路由下 `route.params.module` 拿不到值，不能用）
- 前台 Codex/Market/Cultivate/Character 均为 onMounted 拉取 `/api/lore/*`，失败兜底本地 lore.js；
  Market 用 `keyOf = g => g.id || g.name` 作键（后台无 code 的货品不会导致价格 NaN）
- 已端到端验证（Playwright）：按钮跳转、登录页无注册、四模块侧栏、四模块增/改/删与前台同步、控制台 0 错误

## 10. 秘境寻宝小游戏（2026-11-06）

路由 `/treasure`（`views/StarGame.vue`），替代原「星骸远航」3D 沙盒（旧引擎已归档到 `src/game/_legacy_starfare/`，勿直接引用）。

**玩法**：6 关顺序闯，1–4 人组队。每关 2 次机会 —— 第 1 次失败原地重试，第 2 次失败退回上一关（第 1 关则回到起点），退回后该关机会重新给满。

**文件分工**
| 文件 | 职责 |
| --- | --- |
| `game/treasure/levels.js` | 只放规则参数（秒数/节拍/需要记住几件）与关卡元信息，**不含固定题目** |
| `game/treasure/questionBank.js` | 全部随机题库 + `drawL1/3/4/5/6` 抽题函数 |
| `game/treasure/engine.js` | 状态机（phase: intro/level/verdict/treasure），重试与退回逻辑 |
| `components/treasure/L1..L6` | 6 个关卡交互组件，`emit('pass'/'fail', reason)` |
| `styles/treasure.css` | `.tg-*` 全部样式，`main.js` 中引入 |

**随机题库（每次挑战内容都不同）**
- L1 眼力：50 件物品池抽 5 正选 + 4 干扰（`L1_POOL`），组合数极大
- L3 推理：`L3_BANK` 10 道题，选项每次乱序
- L4 手脑：`L4_COMBOS` 6 组左右手动作，玩法仍是「左手先、右手后」，故 `levels.js` 里第 4 关规则写成通用描述
- L5 短句：`L5_BANK` 10 句，`segments` 直接 `join('')` 得原句、去标点得词块，保证「展示的句子」与「正确拼法」永不脱节
- L6 谜题：`L6_BANK` 10 道谜语，各带 2 条提示，选项乱序
- `pickFrom()` 记住每类题上次抽到的下标，撞到就顺移一格 → **连续两次必定不同**（重试/退回再进也算）
- 抽题发生在组件 `setup` 顶层，而 `StarGame.vue` 用 `:key="levelKey"`（含 `runId`）重建组件，所以重试自动换题
- L2 反应关本来就是随机口令序列（绿 55% / 红 45%），无固定题面

**改动注意**
- `questionBank.js` 导出了 `L1_POOL / L3_BANK / L4_COMBOS / L5_BANK / L6_BANK`，方便加题和写自动化测试；加题只需往数组里追加
- L5 新增句子时，`decoys` 不能与 `tokens` 重复，且词块之间不能互为前缀（否则切分/拼句会有歧义）
- 验证脚本在会话工作区 `.tmp/e2e-random.mjs`（CDP 直连本机 Chrome，无需装 Playwright），会读题库反查答案并断言「重试换题」「换局换题」

## 11. 局域网访问（2026-11-09）

本机局域网 IP：**192.168.68.17**（网卡「以太网」，掩码 255.255.248.0/21，网关 192.168.70.1）。

| 入口 | 地址 |
| --- | --- |
| 前端（其他设备） | `http://192.168.68.17:5173` |
| 后端（其他设备） | `http://192.168.68.17:8081/api` |
| 本机自测 | `http://localhost:5173`、`http://127.0.0.1:8081/api` |

**改了什么**
- `swallowed-star-vue/vite.config.js`：`host: '0.0.0.0'`（原 `host: true` 再显式化）、`strictPort: true`、
  `allowedHosts: true`、`preview.host: '0.0.0.0'`；代理 target 改为 `http://192.168.68.17:8081`。
  顶部集中定义 `LAN_HOST / FRONTEND_PORT / BACKEND_PORT / API_TARGET`，支持环境变量
  `VITE_LAN_HOST`、`VITE_FRONTEND_PORT`、`VITE_BACKEND_PORT`、`VITE_API_TARGET` 覆盖。
- `springBootTest/src/main/resources/application-dev.properties`：新增 `server.address=0.0.0.0`
  （显式监听所有网卡；若写 127.0.0.1 则只有本机可访问）。
- `start.bat`：新增 `LAN_IP` 变量，启动/完成提示里改打印局域网地址（仍为 GBK 编码）。
- CORS 无需改动：`config/CorsConfig.java` 已是 `allowedOriginPatterns("**")` + `allowCredentials(true)`。
- 前端 API 仍是相对路径 `/api`（`src/api/http.js`、`src/api/admin.js`），由 Vite 代理转发，
  所以在局域网设备上打开也不会出现跨域/硬编码地址问题。

**换网络/换机器要改的地方**（只有两处）
1. `vite.config.js` 的 `LAN_HOST`
2. `start.bat` 的 `SET "LAN_IP=..."`
（或直接用环境变量 `VITE_LAN_HOST` 覆盖前端，后端 properties 无需改，`0.0.0.0` 与具体 IP 无关）

## 12. 闭关修炼消耗宇宙币（2026-11-09）

按用户要求把 `/cultivate` 的「实修冥想」改为**花钱修炼、逐级突破**（原版点「入定」会自动涨念力并自动连续突破）。

**规则**
- 每次修炼扣 `200 × (当前境界序号+1)` 宇宙币，念力 +当前境界跨度的 5%（约 20 次攒满一境）
- 念力 100% 后必须点「突破」另付 `10000 × (序号+1)`，一次只升一境；不满足条件会被拒绝
- 境界序号存 `ss_cultivate_realm`，念力存 `ss_cultivate_power`（旧存档按阈值反推一次）
- 至最高境界（不朽境）后按钮禁用；「归零重练」清空进度但**不退币**

**共享钱包**
- 新增 `src/composables/useWallet.js`：模块级单例 ref，key `ss_coins`，默认 500000
- `Market.vue` 的 `balance` 改为从钱包读取（购买走 `spend()`，余额不足原子拒绝）
- ⚠️ 坑：`Number(localStorage.getItem(k))` 在 key 不存在时返回 **0**（Number(null)=0），初始余额必须判 `raw === null`

**验证**：CDP 无头 Chrome 跑通 23 项断言（扣费/拒绝跳级/封顶/持久化/商城余额共享），脚本在会话工作区 `.tmp/verify-cultivate.mjs`。






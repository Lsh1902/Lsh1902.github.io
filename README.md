# Lsh1902.github.io

Lsh1902 的个人主页（GitHub Pages 静态站点），"磁带放映厅"风格的深色个人名片页。

## 在线地址

<https://Lsh1902.github.io>

## 技术栈

- 纯 HTML / CSS / Vanilla JS，无构建依赖
- GitHub Pages 托管页面，jsDelivr 加速背景与音乐等静态资源

## 目录结构

```
index.html        主页（单文件：结构 + 样式 + 脚本）
assets/
  bg/             背景轮播图（webp，已由原图压缩）
  music/          背景音乐（m4a，页面内置 4 首播放列表）
```

## 静态资源托管

页面背景图与音乐均通过 jsDelivr 从本仓库分发，引用格式：

```
https://cdn.jsdelivr.net/gh/Lsh1902/Lsh1902.github.io@main/<路径>
```

- jsDelivr 单文件上限 20MB
- 推送新资源后，jsDelivr 缓存约 12 小时自动刷新（紧急更新可拼版本号绕过）
- 更换背景 / 音乐：替换 `assets/` 下同名文件后推送到 `main` 分支即可

## 背景与音乐说明

- 6 张背景图已用 ffmpeg 压缩为最长边 1920px 的 webp（合计约 1.2MB，原图合计约 11MB）
- 4 首音乐（m4a）：
  1. King Gnu《AIZO》（TV动画『咒术回战：死灭回游 前篇』OP）
  2. King Gnu《飞行艇》
  3. 尼古喵喵《一无所有》
  4. 揽佬SKAI《中国人会飞》（feat. Chalky Wong）

## 更新日志

> 规则：仅保留最近一周（7 天）内的记录，超期条目自动删除。

- 2026-09-11：主卡透明度再提高（--panel 0.40→0.30、backdrop blur 8→6px，并同步 Dark Reader 变量）；5 个主按钮统一改为「液态玻璃」主题色样式——B站 #fb7299 / Pixiv #0096fa / 番单 #ff7a45（沿用暖橙）/ GitHub #6e5494 / 工具箱 #ffb454（沿用琥珀橙），含半透明 tint 底 + backdrop blur/saturate + 1px 高光描边 + inset 顶部高光 + 柔和外阴影 + hover 上浮与光泽扫过（::before 不拦截点击）；≤480px 媒体查询与 Dark Reader 豁免声明同步更新
- 2026-09-11：背景集扩充第 7-9 组（bg7~bg9.bin 桌面横版 / bg7m~bg9m.bin 手机竖版），桌面与手机端轮播均增至 9 张；新图沿用 ffmpeg→webp（最长边≤1920、q≈82）+ XOR 加密流程
- 2026-09-08：主卡面板再调高透明度（--panel 0.62→0.40、backdrop blur 14→8px）并同步 Dark Reader 变量、整体压暗遮罩再减淡约 1/3，轮播背景人物清晰可见；标题/签名/按钮文字补轻阴影保证可读性
- 2026-09-07：主卡面板调高透明度（--panel 0.82→0.62、backdrop blur 20→14px）并同步 Dark Reader 变量、整体压暗遮罩减淡，更好透出轮播背景；新增「Pixiv主页」品牌蓝按钮（#0096fa，位于 B站按钮下方，idx 01-05 顺延）
- 2026-09-07：新增手机端专用背景集（bg1m~bg6m.bin，竖屏 webp XOR 加密）；主页按视口 ≤768px 自动切换竖屏背景、桌面保持横屏原集，视口跨断点即时切换
- 2026-09-07：公告管理 Worker（lsh-admin-api）启用 workers.dev 并绑定自定义域名 admin-api.lsh1902.de5.net（admin.html 发布通道指向该域名）
- 2026-09-07：公告栏移至主页卡片最顶部；新增 Cloudflare Worker 公告发布后端（admin-api/），admin.html 无需再填 GitHub Token，经 Worker 校验 Admin Key 后代为更新 announcements.md
- 2026-09-07：全站静态资源 CDN 镜像由 fastly 统一切换至 gcore.jsdelivr.net（fastly 对 gh 路径 301 到 raw 且被 DNS 屏蔽不可达）
- 2026-09-07：新增 Markdown 公告栏与管理后台（index.html 公告区 + announcements.md + admin.html，后台可在线编辑并直提交 GitHub）
- 2026-09-07：主页新增"工具箱"入口；背景与音乐 XOR 加密为 .bin 防直链下载（详见 ENCRYPTION.md）
- 2026-09-05：encoder-toolbox 工具整合进仓库 tools/ 工具箱，原 Cloudflare Workers 移除
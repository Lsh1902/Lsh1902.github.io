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

- 2026-09-07：全站静态资源 CDN 镜像由 fastly 统一切换至 gcore.jsdelivr.net（fastly 对 gh 路径 301 到 raw 且被 DNS 屏蔽不可达）
- 2026-09-07：新增 Markdown 公告栏与管理后台（index.html 公告区 + announcements.md + admin.html，后台可在线编辑并直提交 GitHub）
- 2026-09-07：主页新增"工具箱"入口；背景与音乐 XOR 加密为 .bin 防直链下载（详见 ENCRYPTION.md）
- 2026-09-05：encoder-toolbox 工具整合进仓库 tools/ 工具箱，原 Cloudflare Workers 移除
- 2026-09-01：jsDelivr 主域名 502 不可用，背景图与音乐资源切换至 fastly 备用节点
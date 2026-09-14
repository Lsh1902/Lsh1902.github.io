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

- 2026-09-15：主卡透明度继续提高（--panel 0.20→0.12、backdrop-filter blur 4→2px 含 -webkit- 前缀，并同步 .card 内 --darkreader-inline-bgcolor 至 0.12），body::before 压暗遮罩再减淡一档（radial 0.07→0.05；linear 顶部 0.22→0.16、中部 0.12→0.09、底部 0.30→0.22）；主卡接近全透后，对卡内主要文字进一步强化可读性——.name 升级为 4 层阴影并加入 1px 近描边层，.card-top / .sign / .tag / .btn 与播放器区（NOW PLAYING、曲名与副标题、进度时间、歌曲列表）、公告栏标题/条目/正文统一加深阴影，另补 .fav-group-title；仅调整 text-shadow，未改动任何排版与结构

- 2026-09-11：主卡透明度再提高（--panel 0.30→0.20、backdrop-filter blur 6→4px 含 -webkit- 前缀，并同步 .card 内 --darkreader-inline-bgcolor），body::before 压暗遮罩整体再减淡一档（radial 0.10→0.07；linear 顶部 0.28→0.22、中部 0.16→0.12、底部 0.38→0.30）；因卡片更透，对卡内主要文字统一加深阴影保证可读性——.name / .sign / .tag / .card-top / .btn 与播放器区（NOW PLAYING、曲名与副标题、进度时间、歌曲列表）及公告栏标题/条目/正文；液态玻璃按钮与自发光效果经确认仍清晰（按钮自带 tint 底与 blur(10px)，不受主卡透明度影响）
- 2026-09-11：5 个主按钮新增「自发光」——按各自主题色（B站 #fb7299 / Pixiv #0096fa / 番单 #ff7a45 / GitHub #6e5494 提亮档 / 工具箱 #ffb454）叠加两层主题色外光晕（0 0 10px + 0 0 26px，低位 alpha）+ inset 内发光微光，并配 3.6s ease-in-out 无限交替的呼吸动画（仅动画 box-shadow）；hover/active 发光增强（0 0 22px + 0 0 48px）且保留既有的上浮与光泽扫过；prefers-reduced-motion 下保留静态发光、关闭动画；≤480px 呼吸放缓至 4s 降低重绘开销；各按钮 Dark Reader 豁免同步补 --darkreader-inline-boxshadow 防止光晕被覆盖
- 2026-09-11：主卡透明度再提高（--panel 0.40→0.30、backdrop blur 8→6px，并同步 Dark Reader 变量）；5 个主按钮统一改为「液态玻璃」主题色样式——B站 #fb7299 / Pixiv #0096fa / 番单 #ff7a45（沿用暖橙）/ GitHub #6e5494 / 工具箱 #ffb454（沿用琥珀橙），含半透明 tint 底 + backdrop blur/saturate + 1px 高光描边 + inset 顶部高光 + 柔和外阴影 + hover 上浮与光泽扫过（::before 不拦截点击）；≤480px 媒体查询与 Dark Reader 豁免声明同步更新
- 2026-09-11：背景集扩充第 7-9 组（bg7~bg9.bin 桌面横版 / bg7m~bg9m.bin 手机竖版），桌面与手机端轮播均增至 9 张；新图沿用 ffmpeg→webp（最长边≤1920、q≈82）+ XOR 加密流程
- 2026-09-08：主卡面板再调高透明度（--panel 0.62→0.40、backdrop blur 14→8px）并同步 Dark Reader 变量、整体压暗遮罩再减淡约 1/3，轮播背景人物清晰可见；标题/签名/按钮文字补轻阴影保证可读性
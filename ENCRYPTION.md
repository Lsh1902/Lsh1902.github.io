# 媒体资源加密说明（Anti-DMCA / 防直链抓取）

主页背景图与背景音乐存储于公开 GitHub 仓库并通过 jsDelivr CDN 分发。
为防止他人**直接下载原文件**（`.webp` / `.m4a`）用作侵权证据或素材，对资源做了
**固定密钥 XOR 逐字节加密**，加密后扩展名改为 `.bin`，由前端 JS 在运行时
`fetch → XOR 解码 → Blob → URL.createObjectURL` 还原后交给 `<img>` / `<audio>` 使用。
仓库中**不保存任何明文媒体文件**。

## 一、密钥

同一密钥同时用于加密（脚本）与解密（前端 JS），**两处必须保持一致**。

```
XOR_KEY = "Lsh1902-Tape-XOR-Key!@#2026"
```

- 脚本位置：`scripts/xor_crypto.py` 顶部常量 `XOR_KEY`
- 前端位置：`index.html` 内 JS 常量 `XOR_KEY`（位于“1.5 资源加解密”段）

> XOR 为自反运算：`密文 ^ key == 明文`，`明文 ^ key == 密文`。加密与还原是同一个操作。

## 二、资源清单

| 类别 | 原始文件 | 加密后文件（仓库内实际存储） |
|---|---|---|
| 背景图 | `assets/bg/bg1.webp` ~ `bg6.webp` | `assets/bg/bg1.bin` ~ `bg6.bin` |
| 背景音乐 | `assets/music/song1.m4a` ~ `song4.m4a` | `assets/music/song1.bin` ~ `song4.bin` |

前端引用地址均已改为 `.bin`：
- 轮播：`<div class="bg-slide" data-bg=".../assets/bg/bg1.bin" data-mime="image/webp">`
- 播放器：`playlist[].src = MUSIC_BASE + 'song1.bin'`（mime 固定为 `audio/mp4`）

## 三、加解密脚本用法

脚本位于 `scripts/xor_crypto.py`，单文件、无第三方依赖，Python 3 直跑。

```bash
# 加密（透明文件 -> .bin 密文）
python scripts/xor_crypto.py encrypt assets/bg/bg1.webp assets/bg/bg1.bin

# 还原（.bin 密文 -> 透明文件，供维护 / 换源排期）
python scripts/xor_crypto.py decrypt assets/bg/bg1.bin assets/bg/bg1.webp

# 目录批量模式：encrypt 把目录内 *.webp / *.m4a 等批量转成 .bin
python scripts/xor_crypto.py encrypt assets/bg/  assets/bg_enc/
```

> 注意：脚本只负责“生成密文 / 还原明文”，**不会自动删除原文件**。
> 加密流程中删除仓库内的明文文件请使用回收站方式（如系统删除），避免不可恢复丢失。

## 四、新增 / 更新资源的操作流程

1. 把新素材（如 `assets/bg/bg7.webp`）交给脚本加密：`python scripts/xor_crypto.py encrypt assets/bg/bg7.webp assets/bg/bg7.bin`
2. 删除仓库内的明文素材（保留加密 `.bin`）。
3. 需要换背景时更新 `index.html` 轮播区的 `data-bg` 指向；换音乐时更新 `playlist` 的 `src`。
4. 若更换密钥，必须同步更新 `xor_crypto.py` 与 `index.html` 两处的 `XOR_KEY`，并重新加密全部资源。

## 五、已知限制（重要）

- 本方案为**轻量混淆**，前端密钥必然存在于公开 JS 中，熟悉前端的人仍可提取密钥还原。
  目标是**提高直接下载成本、阻断“点开 URL 即得原图/原音频”的举证与抓取路径**，并非强加密。
- 建议同时配合：jsDelivr 仅作分发不提供目录列表、仓库不开 issue 附件等常规手段。

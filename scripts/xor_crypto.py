#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
xor_crypto.py — 主页媒体资源 XOR 加解密工具（防直接下载 / 防 DMCA 素材抓取）

原理：
  使用固定 ASCII 密钥对文件逐字节异或（密钥循环使用）。XOR 是自反运算，
  encrypt 与 decrypt 是同一操作：data ^ key 一次得到密文，再 ^ key 一次还原原文。

用途：
  1. 加密：把仓库内的 .webp / .m4a 原文转成 .bin 密文（替换原文件并删除原文）。
  2. 还原：把 .bin 密文还原成 .webp / .m4a 原文（供维护、给素材源重新排期时使用）。

用法：
  python xor_crypto.py encrypt <input> <output>   # 生成密文（也可用于解密）
  python xor_crypto.py decrypt <input> <output>   # 生成明文（与 encrypt 等价）

示例：
  python xor_crypto.py encrypt assets/bg/bg1.webp assets/bg/bg1.bin
  python xor_crypto.py decrypt assets/bg/bg1.bin  assets/bg/bg1.webp

注意：
  - 密钥必须与 index.html 内前端解码常量 XOR_KEY 保持一致。
  - 批量处理可直接传目录（自动递归所有 *.{webp,m4a} 为 .bin，或 .bin 为 .webp/.m4a）。
"""

import sys
from pathlib import Path

# ⚠️ 密钥：index.html 前端 JS 中 XOR_KEY 必须与这里完全一致
XOR_KEY = "Lsh1902-Tape-XOR-Key!@#2026"


def xor_transform(data: bytes, key: str) -> bytes:
    kb = key.encode("utf-8")
    klen = len(kb)
    return bytes(b ^ kb[i % klen] for i, b in enumerate(data))


def xor_file(src: Path, dst: Path) -> None:
    dst.write_bytes(xor_transform(src.read_bytes(), XOR_KEY))
    print(f"  {src.name} -> {dst.name}  ({src.stat().st_size} bytes)")


def main() -> int:
    args = sys.argv[1:]
    if len(args) < 3:
        print(__doc__)
        return 1

    op, src_path, dst_path = args[0], Path(args[1]), Path(args[2])

    if op not in ("encrypt", "decrypt"):
        print(__doc__)
        return 1

    if src_path.is_file():
        xor_file(src_path, dst_path)
        return 0

    # 目录模式：批量转换
    if op == "encrypt":
        # 默认把所有原始媒体转成 .bin
        pats = ("*.webp", "*.jpg", "*.jpeg", "*.png", "*.gif", "*.m4a", "*.mp3", "*.mp4", "*.ogg")
    else:
        pats = ("*.bin", "*.dat", "*.enc")
    if not dst_path.is_dir():
        dst_path.mkdir(parents=True, exist_ok=True)
    count = 0
    for p in sorted(src_path.iterdir()):
        if p.suffix.lower() not in {x[1:].lower() for x in pats} or not p.is_file():
            continue
        if op == "encrypt":
            out = dst_path / (p.stem + ".bin")
        else:
            out = dst_path / (p.stem + ".webp")
        xor_file(p, out)
        count += 1
    print(f"done: {count} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

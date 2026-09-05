/* ═══════════════════════════════════════════════════════
   DATA TRANSLATOR · 应用逻辑
   所有运算均在本地完成：Base64 / URL / Hash / 二维码
   ═══════════════════════════════════════════════════════ */
"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ────────── 工具导航 ────────── */
$$(".toolnav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".toolnav-item").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    const tool = btn.dataset.tool;
    $$(".panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tool));
  });
});

/* ────────── Toast ────────── */
let toastTimer = null;
function toast(msg, isErr = false) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("err", isErr);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ────────── 通用：复制 ────────── */
async function copyText(text) {
  if (!text) { toast("没有可复制的内容"); return; }
  try {
    await navigator.clipboard.writeText(text);
    toast("已复制到剪贴板");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("已复制到剪贴板"); }
    catch { toast("复制失败，请手动选择复制", true); }
    ta.remove();
  }
}

$$("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.copy;
    if (target === "hash-out") {
      const rows = $$(".hash-row .hash-value").map((el) => el.textContent.trim());
      copyText(rows.join("\n"));
    } else if (target === "ts-out" || target === "radix-out") {
      const rows = $$("#" + target + " .readout-value").map((el) => el.textContent.trim());
      copyText(rows.join("\n"));
    } else if (target === "qr-img") {
      const img = $("#qr-img");
      if (!img.hidden && img.src) {
        fetch(img.src).then((r) => r.blob()).then((blob) =>
          navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        ).then(() => toast("二维码图片已复制")).catch(() => toast("复制失败，可改用下载", true));
      } else {
        toast("还没有可复制的二维码");
      }
    } else {
      copyText($("#" + target).value);
    }
  });
});

$$("[data-clear]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.clear;
    const el = $("#" + id);
    el.value = "";
    el.dispatchEvent(new Event("input"));
    el.focus();
  });
});

/* ────────── 字符计数 ────────── */
$$("[data-count-for]").forEach((el) => {
  const src = $("#" + el.dataset.countFor);
  const update = () => {
    const n = src.value.length;
    el.textContent = n.toLocaleString() + " chars";
  };
  src.addEventListener("input", update);
  update();
});

/* ══════════════ 1 · BASE64 ══════════════ */
const b64 = {
  input: $("#b64-input"),
  output: $("#b64-output"),
  encode: true,
  urlSafe: false,
};

function utf8ToBinary(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return bin;
}
function binaryToUtf8(bin) {
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function b64Encode(str, urlSafe) {
  let b64 = btoa(utf8ToBinary(str));
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}
function b64Decode(str, urlSafe) {
  let s = str.replace(/\s+/g, "");
  if (urlSafe) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
  }
  return binaryToUtf8(atob(s));
}

function runBase64() {
  const src = b64.input.value;
  b64.output.value = "";
  if (!src) return;
  try {
    b64.output.value = b64.encode ? b64Encode(src, b64.urlSafe) : b64Decode(src, b64.urlSafe);
  } catch {
    b64.output.value = "";
    toast(b64.encode ? "编码失败：存在无法编码的字符" : "解码失败：不是有效的 Base64 内容", true);
  }
}
b64.input.addEventListener("input", runBase64);
$$('[data-panel="base64"] [data-direction]').forEach((btn) => {
  btn.addEventListener("click", () => {
    b64.encode = btn.dataset.direction === "encode";
    $$('[data-panel="base64"] [data-direction]').forEach((b) => b.classList.toggle("is-active", b === btn));
    runBase64();
  });
});
$("#b64-urlsafe").addEventListener("change", (e) => {
  b64.urlSafe = e.target.checked;
  runBase64();
});

/* ══════════════ 2 · URL ══════════════ */
const urlT = {
  input: $("#url-input"),
  output: $("#url-output"),
  encode: true,
  component: false,
};
function runUrl() {
  const src = urlT.input.value;
  urlT.output.value = "";
  if (!src) return;
  try {
    const fn = urlT.component ? (encodeURIComponent) : (encodeURI);
    const dfn = urlT.component ? (decodeURIComponent) : (decodeURI);
    urlT.output.value = urlT.encode ? fn(src) : dfn(src);
  } catch {
    urlT.output.value = "";
    toast("处理失败：内容含有不完整的百分号编码", true);
  }
}
urlT.input.addEventListener("input", runUrl);
$$('[data-panel="url"] [data-direction]').forEach((btn) => {
  btn.addEventListener("click", () => {
    urlT.encode = btn.dataset.direction === "encode";
    $$('[data-panel="url"] [data-direction]').forEach((b) => b.classList.toggle("is-active", b === btn));
    runUrl();
  });
});
$("#url-component").addEventListener("change", (e) => {
  urlT.component = e.target.checked;
  runUrl();
});

/* ══════════════ 3 · HASH ══════════════ */
const hashInput = $("#hash-input");
const hashOut = $("#hash-out");

/* —— 内置 MD5（公共领域标准实现） —— */
const MD5 = (function () {
  const rotl = (x, n) => (x << n) | (x >>> (32 - n));
  const K = new Int32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
             5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
             4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
             6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

  function str2bin(str) {
    const len = str.length;
    const n = (((len + 8) >> 6) + 1) * 16;
    const bytes = new Int32Array(n);
    for (let i = 0; i < len; i++) bytes[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    bytes[len >> 2] |= 0x80 << ((len % 4) * 8);
    bytes[n - 2] = (len * 8) & 0xffffffff;
    bytes[n - 1] = Math.floor((len * 8) / 0x100000000);
    return bytes;
  }
  function core(bytes) {
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    for (let i = 0; i < bytes.length; i += 16) {
      let A = a0, B = b0, C = c0, D = d0;
      const M = bytes.subarray(i, i + 16);
      for (let j = 0; j < 64; j++) {
        let F, g;
        if (j < 16) { F = (B & C) | (~B & D); g = j; }
        else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
        else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * j) % 16; }
        F = (F + A + K[j] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + rotl(F, S[j])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0];
  }
  function toHex(word) {
    let s = "";
    for (let i = 0; i < 4; i++) {
      const b = (word >>> (i * 8)) & 0xff;
      s += b.toString(16).padStart(2, "0");
    }
    return s;
  }
  return function md5(str) {
    const words = core(str2bin(unescape(encodeURIComponent(str))));
    return words.map(toHex).join("");
  };
})();

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function runHash() {
  const src = hashInput.value;
  hashOut.innerHTML = "";
  if (!src) {
    hashOut.innerHTML = '<div class="hash-empty">输入文本后，摘要将逐项显示在此处</div>';
    return;
  }
  const row = (name, value) => {
    const div = document.createElement("div");
    div.className = "hash-row";
    div.innerHTML = `<span class="hash-name">${name}</span><span class="hash-value"></span>`;
    div.querySelector(".hash-value").textContent = value;
    hashOut.appendChild(div);
  };
  const enc = new TextEncoder().encode(src);
  const digests = await Promise.all([
    crypto.subtle.digest("SHA-1", enc),
    crypto.subtle.digest("SHA-256", enc),
    crypto.subtle.digest("SHA-384", enc),
    crypto.subtle.digest("SHA-512", enc),
  ]);
  row("MD5", MD5(src));
  row("SHA-1", bytesToHex(digests[0]));
  row("SHA-256", bytesToHex(digests[1]));
  row("SHA-384", bytesToHex(digests[2]));
  row("SHA-512", bytesToHex(digests[3]));
}

let hashTimer = null;
hashInput.addEventListener("input", () => {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(runHash, 120);
});

/* ══════════════ 4 · 二维码 ══════════════ */
const qrInput = $("#qr-input");
const qrCanvas = $("#qr-canvas");
const qrImg = $("#qr-img");
const qrEmpty = document.querySelector(".qr-empty");

function drawQr() {
  const text = qrInput.value.trim();
  if (!text) {
    qrImg.hidden = true;
    qrCanvas.hidden = true;
    qrEmpty.style.display = "";
    return;
  }
  if (typeof qrcode === "undefined") {
    toast("二维码引擎未加载（可能离线），请联网后刷新", true);
    return;
  }
  const size = parseInt($("#qr-size").value, 10);
  const ecl = $("#qr-ecl").value;
  const qr = qrcode(0, ecl);
  qr.addData(text, "Byte");
  try { qr.make(); } catch {
    toast("内容过长，无法生成二维码", true);
    return;
  }
  const moduleCount = qr.getModuleCount();
  const cell = Math.floor(size / moduleCount);
  const px = moduleCount * cell;
  qrCanvas.width = px;
  qrCanvas.height = px;
  const ctx = qrCanvas.getContext("2d");
  ctx.fillStyle = "#0f0e0a";
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = "#efe6cf";
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  qrImg.src = qrCanvas.toDataURL("image/png");
  qrImg.hidden = false;
  qrCanvas.hidden = true;
  qrEmpty.style.display = "none";
}

let qrTimer = null;
qrInput.addEventListener("input", () => {
  clearTimeout(qrTimer);
  qrTimer = setTimeout(drawQr, 120);
});
$("#qr-size").addEventListener("change", drawQr);
$("#qr-ecl").addEventListener("change", drawQr);

$("#qr-download").addEventListener("click", () => {
  if (qrImg.hidden || !qrImg.src) { toast("还没有可下载的二维码"); return; }
  const a = document.createElement("a");
  a.href = qrImg.src;
  a.download = "qr-" + Date.now() + ".png";
  a.click();
  toast("二维码已开始下载");
});

/* ══════════════ 5 · 时间戳 ══════════════ */
const tsInput = $("#ts-input");
const tsOut = $("#ts-out");

function addReadout(container, name, value, hl = false) {
  const div = document.createElement("div");
  div.className = "readout-row";
  const n = document.createElement("span");
  n.className = "readout-name";
  n.textContent = name;
  const v = document.createElement("span");
  v.className = "readout-value" + (hl ? " hl" : "");
  v.textContent = value;
  div.append(n, v);
  container.appendChild(div);
}
function emptyReadout(container, msg) {
  container.innerHTML = '<div class="readout-empty">' + msg + "</div>";
}
function pad2(n) { return String(n).padStart(2, "0"); }
function fmtLocal(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
    " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}

function runTs() {
  const raw = tsInput.value.trim();
  tsOut.innerHTML = "";
  if (!raw) {
    emptyReadout(tsOut, "输入时间戳或日期时间后，换算结果将逐项显示在此处");
    return;
  }
  let d = null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = parseFloat(raw);
    d = new Date(n < 1e12 ? n * 1000 : n);
  } else {
    const t = Date.parse(raw);
    if (!isNaN(t)) d = new Date(t);
  }
  if (!d || isNaN(d.getTime())) {
    emptyReadout(tsOut, "无法解析输入内容，请检查格式");
    return;
  }
  const ms = d.getTime();
  addReadout(tsOut, "秒级时间戳", String(Math.floor(ms / 1000)), true);
  addReadout(tsOut, "毫秒级时间戳", String(ms));
  addReadout(tsOut, "ISO 8601", d.toISOString());
  addReadout(tsOut, "本地时间", fmtLocal(d) + " (UTC" + (d.getTimezoneOffset() <= 0 ? "+" : "-") + Math.abs(d.getTimezoneOffset() / 60) + ")");
  addReadout(tsOut, "UTC 时间", d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "") + " UTC");
}
tsInput.addEventListener("input", runTs);
$("#ts-now").addEventListener("click", () => {
  tsInput.value = Math.floor(Date.now() / 1000);
  runTs();
});

/* ══════════════ 6 · JSON ══════════════ */
const jsonInput = $("#json-input");
const jsonOutput = $("#json-output");
let jsonMode = "format";
function runJson() {
  const src = jsonInput.value;
  jsonOutput.value = "";
  if (!src) return;
  try {
    const data = JSON.parse(src);
    if (jsonMode === "validate") {
      const type = Array.isArray(data) ? "Array" : data === null ? "null" : typeof data;
      const keys = type === "object" ? Object.keys(data).length : type === "Array" ? data.length : "";
      jsonOutput.value = "✓ VALID JSON\n\n类型: " + type + (keys !== "" ? "    元素/字段数: " + keys : "");
    } else if (jsonMode === "minify") {
      jsonOutput.value = JSON.stringify(data);
    } else {
      const indentSel = $("#json-indent").value;
      const indent = indentSel === "tab" ? "\t" : parseInt(indentSel, 10);
      jsonOutput.value = JSON.stringify(data, null, indent);
    }
  } catch (err) {
    const m = /position (\d+)/.exec(err.message);
    if (m) {
      const idx = +m[1];
      const before = src.slice(0, idx);
      const line = before.split("\n").length;
      const col = idx - before.lastIndexOf("\n");
      jsonOutput.value = "✗ 解析错误\n\n信息: " + err.message +
        "\n位置: 第 " + line + " 行 · 第 " + col + " 列\n\n附近内容:\n" +
        src.slice(Math.max(0, idx - 40), idx + 40);
    } else {
      jsonOutput.value = "✗ 解析错误\n\n" + err.message;
    }
    toast("JSON 解析失败，详见输出区", true);
  }
}
jsonInput.addEventListener("input", runJson);
$$('[data-panel="json"] [data-json-mode]').forEach((btn) => {
  btn.addEventListener("click", () => {
    jsonMode = btn.dataset.jsonMode;
    $$('[data-panel="json"] [data-json-mode]').forEach((b) => b.classList.toggle("is-active", b === btn));
    runJson();
  });
});
$("#json-indent").addEventListener("change", () => { if (jsonMode === "format") runJson(); });

/* ══════════════ 7 · 大小写 ══════════════ */
const caseInput = $("#case-input");
const caseOutput = $("#case-output");
let caseMode = "upper";
function toWords(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-\/\.]+/)
    .map((w) => w.replace(/[^A-Za-z0-9]+/g, ""))
    .filter(Boolean);
}
function runCase() {
  const src = caseInput.value;
  const words = toWords(src);
  let out = src;
  if (words.length) {
    const lower = words.map((w) => w.toLowerCase());
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    switch (caseMode) {
      case "upper": out = src.toUpperCase(); break;
      case "lower": out = src.toLowerCase(); break;
      case "title": out = words.map(cap).join(" "); break;
      case "camel": out = lower.map((w, i) => (i ? cap(w) : w)).join(""); break;
      case "snake": out = lower.join("_"); break;
      case "kebab": out = lower.join("-"); break;
      case "constant": out = lower.map((w) => w.toUpperCase()).join("_"); break;
      case "sentence": out = cap(lower.join(" ")); break;
    }
  }
  caseOutput.value = out;
}
caseInput.addEventListener("input", runCase);
$$("[data-case]").forEach((btn) => {
  btn.addEventListener("click", () => {
    caseMode = btn.dataset.case;
    $$("[data-case]").forEach((b) => b.classList.toggle("is-active", b === btn));
    runCase();
  });
});

/* ══════════════ 8 · 进制 ══════════════ */
const radixInput = $("#radix-input");
const radixOut = $("#radix-out");
function parseRadix(str, base) {
  const s = str.trim().toLowerCase().replace(/_/g, "");
  const digits = "0123456789abcdef";
  let n = 0n;
  for (const ch of s) {
    const d = digits.indexOf(ch);
    if (d < 0 || d >= base) throw new Error("非法字符: " + ch);
    n = n * BigInt(base) + BigInt(d);
  }
  return n;
}
function runRadix() {
  const raw = radixInput.value.trim();
  radixOut.innerHTML = "";
  if (!raw) {
    emptyReadout(radixOut, "输入数字后，各进制结果将逐项显示在此处");
    return;
  }
  const base = parseInt($("#radix-in").value, 10);
  try {
    const n = parseRadix(raw, base);
    addReadout(radixOut, "二进制", n.toString(2));
    addReadout(radixOut, "八进制", n.toString(8));
    addReadout(radixOut, "十进制", n.toString(10), true);
    addReadout(radixOut, "十六进制", n.toString(16).toUpperCase());
  } catch {
    emptyReadout(radixOut, "无法解析：存在不属于所选进制的字符");
    toast("无法解析：存在不属于所选进制的字符", true);
  }
}
radixInput.addEventListener("input", runRadix);
$("#radix-in").addEventListener("change", runRadix);

/* ══════════════ 9 · Unicode ══════════════ */
const uniInput = $("#uni-input");
const uniOutput = $("#uni-output");
let uniMode = "escape";
function escapeUnicode(str) {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    const ch = str[i];
    if (c > 127 || ch === "\\" || ch === '"') {
      out += "\\u" + c.toString(16).padStart(4, "0");
    } else {
      out += ch;
    }
  }
  return out;
}
function unescapeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
function runUni() {
  const src = uniInput.value;
  uniOutput.value = "";
  if (!src) return;
  try {
    uniOutput.value = uniMode === "escape" ? escapeUnicode(src) : unescapeUnicode(src);
  } catch {
    uniOutput.value = "";
    toast("处理失败：内容无法解析", true);
  }
}
uniInput.addEventListener("input", runUni);
$$('[data-panel="unicode"] [data-direction]').forEach((btn) => {
  btn.addEventListener("click", () => {
    uniMode = btn.dataset.direction === "escape" ? "escape" : "unescape";
    $$('[data-panel="unicode"] [data-direction]').forEach((b) => b.classList.toggle("is-active", b === btn));
    runUni();
  });
});

/* ══════════════ 10 · 图片 ══════════════ */
const dropZone = $("#img-drop");
const fileInput = $("#img-file");
const imgPreview = $("#img-preview");
const imgPreviewWrap = $("#img-preview-wrap");
const imgB64 = $("#img-b64");

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
});
["dragover", "dragenter"].forEach((ev) => dropZone.addEventListener(ev, (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach((ev) => dropZone.addEventListener(ev, (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith("image/")) loadImageFile(f);
  else toast("请拖入图片文件", true);
});
fileInput.addEventListener("change", () => {
  const f = fileInput.files[0];
  if (f) loadImageFile(f);
});
function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    imgB64.value = dataUrl;
    imgPreview.src = dataUrl;
    imgPreviewWrap.hidden = false;
    toast("图片已编码为 Base64");
  };
  reader.readAsDataURL(file);
}
$("#img-clear").addEventListener("click", () => {
  imgB64.value = "";
  imgPreview.src = "";
  imgPreviewWrap.hidden = true;
  fileInput.value = "";
});

const b64ImgInput = $("#b64-img-input");
const b64Img = $("#b64-img");
const b64ImgWrap = $("#b64-img-wrap");
let b64ImgTimer = null;
function renderB64Img() {
  const raw = b64ImgInput.value.trim();
  const empty = b64ImgWrap.querySelector(".qr-empty");
  b64Img.hidden = true;
  if (!raw) {
    empty.style.display = "";
    empty.textContent = "粘贴 Base64 后在此预览";
    return;
  }
  let dataUrl = raw;
  if (!/^data:image\//i.test(raw)) {
    dataUrl = "data:image/png;base64," + raw.replace(/^data:image\/\w+;base64,?/i, "");
  }
  const img = new Image();
  img.onload = () => {
    b64Img.src = dataUrl;
    b64Img.hidden = false;
    empty.style.display = "none";
  };
  img.onerror = () => {
    empty.style.display = "";
    empty.textContent = "无法解析：不是有效的图片 Base64";
  };
  img.src = dataUrl;
}
b64ImgInput.addEventListener("input", () => {
  clearTimeout(b64ImgTimer);
  b64ImgTimer = setTimeout(renderB64Img, 200);
});
$("#b64-img-download").addEventListener("click", () => {
  if (b64Img.hidden || !b64Img.src) { toast("还没有可下载的还原图片"); return; }
  const a = document.createElement("a");
  a.href = b64Img.src;
  a.download = "restored-" + Date.now() + ".png";
  a.click();
  toast("图片已开始下载");
});

/* 初始化 */
runBase64();
runUrl();

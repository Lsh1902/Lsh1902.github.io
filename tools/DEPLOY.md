---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 8f5334e0ead4af502ae294458a90237a_caa9ab0aa39611f1bc17525400826444
    ReservedCode1: HqrZkp9PMwIqX3T6k5q7xHjQOIGsUS/lV0i8SqMO3S5ISNgoTtY27SdRYdJoov4YNTCs6TuGm5y3+1h53mrKMqsy6oq9FMOnrGV+hNdIbmXyZAh6+vIe9ZuDXQSVbAVrHipD2RGD+vQ3iLUSXGYcQq5SLNLzTK9nWgJzzihHXVm6vtqKOFcQdg8/AxY=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 8f5334e0ead4af502ae294458a90237a_caa9ab0aa39611f1bc17525400826444
    ReservedCode2: HqrZkp9PMwIqX3T6k5q7xHjQOIGsUS/lV0i8SqMO3S5ISNgoTtY27SdRYdJoov4YNTCs6TuGm5y3+1h53mrKMqsy6oq9FMOnrGV+hNdIbmXyZAh6+vIe9ZuDXQSVbAVrHipD2RGD+vQ3iLUSXGYcQq5SLNLzTK9nWgJzzihHXVm6vtqKOFcQdg8/AxY=
---



# DATA TRANSLATOR · 编码解码工具箱 部署指南

一个纯前端的编码解码工具箱：Base64、URL、Hash（MD5 / SHA 系列）、二维码生成。
所有运算均在浏览器本地完成，无任何服务器端依赖，数据不离开设备。

## 项目结构

```
encoder-toolbox/
├── index.html   # 页面结构
├── styles.css   # 样式（工程仪器面板风格）
└── app.js       # 全部工具逻辑（含内置 MD5 实现）
```

> 唯一的外部依赖是 Google Fonts 与 qrcode-generator 的 CDN。
> 若需完全离线自托管，可把两个 `<link>`/`<script>` 资源下载后放入本地并替换路径。

---

## 方式一：部署到 Cloudflare Pages（推荐，纯静态）

### 方案 A · 网页控制台上传（无需命令行，最简单）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧选择 **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. 将 `index.html`、`styles.css`、`app.js` 三个文件拖入上传区
4. 命名项目（如 `data-translator`），点击 **Deploy site**
5. 部署完成后即可通过 `https://<项目名>.pages.dev` 访问

之后每次更新代码，重复第 3 步的拖拽上传即可。

### 方案 B · wrangler 命令行部署

需要 Node.js 环境（≥ 18）：

```bash
# 1. 安装 Node.js（Windows：winget install OpenJS.NodeJS.LTS 或官网下载安装包）
# 2. 安装 wrangler
npm install -g wrangler

# 3. 登录（会在浏览器打开 OAuth 授权，一次性）
wrangler login

# 4. 进入项目目录并部署
cd encoder-toolbox
npx wrangler pages deploy . --project-name data-translator
```

首次部署会提示创建项目，按提示确认即可。后续更新同一条命令。

---

## 方式二：部署到 Cloudflare Workers

纯静态站点建议优先用 Pages；若您坚持要 Workers（如后续想加服务端逻辑），可走 Assets 方式：

1. 在项目根目录新建 `wrangler.toml`：

```toml
name = "data-translator"
main = "src/worker.js"
compatibility_date = "2025-01-01"
assets = { directory = "./" }
```

2. 新建 `src/worker.js`：

```js
export default {
  fetch() {
    return new Response("Hello from Worker", { status: 200 });
  },
};
```

3. 部署：

```bash
npx wrangler deploy
```

> Workers 免费额度足够个人工具使用；若完全无后端需求，走 Pages 更省事。

---

## 本地预览（部署前先看效果）

无需任何服务器，直接双击打开 `index.html` 即可使用全部功能。

若想以真实站点形式预览：

```bash
cd encoder-toolbox
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

---

## 功能清单

| 工具 | 说明 |
|------|------|
| Base64 | 编码 / 解码，支持 UTF-8 中文，可切换 URL-Safe 变体 |
| URL | 百分号编码 / 解码，可切换 COMPONENT 模式 |
| Hash | MD5、SHA-1、SHA-256、SHA-384、SHA-512，全离线计算 |
| 二维码 | 本地生成 PNG，可调尺寸与纠错等级，支持复制 / 下载 |
| 时间戳 | 时间戳（秒 / 毫秒）与日期时间双向互转，自动识别 |
| JSON | 格式化 / 压缩 / 校验，解析失败定位行列 |
| 大小写 | UPPER / lower / Title / camel / snake / kebab 命名格式互转 |
| 进制转换 | 2 / 8 / 10 / 16 进制互转，基于 BigInt 支持大整数 |
| Unicode | 文本与 \\uXXXX 转义互转，支持代理对（emoji） |
| 图片 | 图片 ↔ Base64 互转，支持拖放 / 预览 / 下载 |
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*

/**
 * lsh-admin-api — Lsh1902.github.io 公告管理 Worker
 *
 * 职责：接收管理端提交的 announcements.md 全文，校验 X-Admin-Key 后，
 *       通过 GitHub Contents API 直接更新仓库根 announcements.md，
 *       使 admin.html 无需在前端填写 GitHub Token。
 *
 * 环境变量（Secret）：
 *   ADMIN_KEY    管理密钥，需与请求头 X-Admin-Key 一致
 *   GITHUB_TOKEN 拥有 Lsh1902/Lsh1902.github.io contents:write 权限的 PAT
 */

const REPO_OWNER = 'Lsh1902';
const REPO_NAME = 'Lsh1902.github.io';
const FILE_PATH = 'announcements.md';
const COMMIT_MESSAGE = 'docs: 更新公告 announcements.md（Worker API）';
const GITHUB_API = 'https://api.github.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Max-Age': '86400',
};

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

/** UTF-8 安全 base64：btoa 无法直接处理非 Latin1 字符，先经 TextEncoder 转字节。 */
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS },
  });
}

/** 读取 GitHub 仓库文件当前 sha 与新内容，供 PUT 提交使用。 */
async function updateAnnouncements(content, githubToken) {
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'lsh-admin-api-worker',
  };

  // 1) GET 取当前文件 sha
  const getUrl = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const getRes = await fetch(getUrl, { method: 'GET', headers });
  if (!getRes.ok) {
    const detail = await getRes.text();
    return {
      ok: false,
      error: `GitHub GET ${FILE_PATH} 失败 (${getRes.status})`,
      detail: detail.slice(0, 500),
    };
  }
  const current = await getRes.json();
  const sha = current && current.sha;

  // 2) PUT 写入新内容
  const putRes = await fetch(getUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: COMMIT_MESSAGE,
      content: utf8ToBase64(content),
      sha,
    }),
  });
  const putBody = await putRes.json().catch(() => ({}));

  if (!putRes.ok) {
    return {
      ok: false,
      error: `GitHub PUT ${FILE_PATH} 失败 (${putRes.status})`,
      detail: (putBody.message || '').slice(0, 500),
    };
  }
  return {
    ok: true,
    commit: {
      sha: putBody.commit ? putBody.commit.sha : null,
      message: COMMIT_MESSAGE,
      html_url: putBody.commit ? putBody.commit.html_url : null,
    },
    file: { path: FILE_PATH, name: FILE_PATH },
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 连通性检查
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json({ ok: true, service: 'lsh-admin-api', repo: `${REPO_OWNER}/${REPO_NAME}` });
    }

    // 公告更新接口
    if (request.method === 'POST' && url.pathname === '/api/announce') {
      // 鉴权：X-Admin-Key 与环境变量 ADMIN_KEY 一致
      const adminKey = env.ADMIN_KEY || '';
      if (!adminKey) {
        return json({ ok: false, error: '服务端未配置 ADMIN_KEY' }, 500);
      }
      if (request.headers.get('X-Admin-Key') !== adminKey) {
        return json({ ok: false, error: 'Admin Key 无效或缺失' }, 401);
      }

      const githubToken = env.GITHUB_TOKEN || '';
      if (!githubToken) {
        return json({ ok: false, error: '服务端未配置 GITHUB_TOKEN' }, 500);
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return json({ ok: false, error: '请求体必须为合法 JSON' }, 400);
      }
      const content = (payload && payload.content) || '';
      if (typeof content !== 'string' || content.trim().length === 0) {
        return json({ ok: false, error: '缺少 announcements.md 全文（content 字段）' }, 400);
      }

      const result = await updateAnnouncements(content, githubToken);
      return json(result, result.ok ? 200 : 502);
    }

    return json({ ok: false, error: 'Not Found' }, 404);
  },
};

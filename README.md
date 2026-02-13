# eyetrack-aoi

将 `eyetrack` 项目里的 AOI 创建网页（AOI Labeler v3）独立发布到 Cloudflare。

支持两种方式：
1. **Cloudflare Pages**（推荐，纯静态托管）
2. **Cloudflare Workers + Assets**（同样可用，便于后续加 API）

---

## 目录结构

```text
.
├─ public/
│  └─ index.html        # AOI 标注网页（从 eyetrack/webapp/index.html 同步）
├─ worker.js            # Worker 入口（转发静态资源）
├─ wrangler.toml        # Worker 配置（含 assets）
├─ package.json
└─ docs/
   └─ DEPLOY_ZH.md      # 中文部署教程（详细）
```

---

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 登录 Cloudflare

```bash
npx wrangler login
```

### 3A) 部署到 Cloudflare Pages（推荐）

```bash
npm run deploy:pages
```

首次执行时，若项目不存在，先在 Cloudflare Dashboard 创建 Pages 项目（可空仓库），项目名建议 `eyetrack-aoi`，再执行上面的命令。

### 3B) 部署到 Cloudflare Workers

```bash
npm run deploy:worker
```

部署后会得到 `https://<worker-name>.<subdomain>.workers.dev` 地址。

---

## 本地预览

```bash
npm run dev
```

默认启动 wrangler 本地服务，可直接打开本地地址访问 AOI 页面。

---

## 与上游 eyetrack 同步

当前 `public/index.html` 来源：
- `https://github.com/wannaqueen66-create/eyetrack` 的 `webapp/index.html`

当上游 AOI 标注网页更新后，建议执行：
1. 覆盖 `public/index.html`
2. 本地测试
3. 重新部署（Pages 或 Worker）


# eyetrack-aoi

将 `eyetrack` 项目里的 AOI 创建网页（AOI Labeler v3）独立发布到 Cloudflare。

支持两种方式：
1. **Cloudflare Pages（推荐）**：浏览器里连接 GitHub 仓库，一键部署，后续 push 自动发布
2. **Cloudflare Workers**：浏览器里创建 Worker 并关联 GitHub，自动 CI/CD 发布

---

## 一键式（浏览器 + GitHub）部署

### A. Cloudflare Pages（最推荐）

1. 打开 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**
2. 选择 **Connect to Git**，授权 GitHub
3. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
4. 构建配置填写：
   - **Framework preset**: None
   - **Build command**: （留空）
   - **Build output directory**: `public`
5. 点击 **Save and Deploy**

完成后会得到 `*.pages.dev` 地址。
之后每次你往 `main` 分支推送，Pages 会自动重新部署。

### B. Cloudflare Workers（GitHub 驱动）

1. 打开 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers**
2. 选择 **Import a repository**（或 GitHub 集成入口）
3. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
4. 构建命令填写：
   - Install: `npm install`
   - Deploy command: `npx wrangler deploy`
5. 确认后部署

仓库已内置：
- `worker.js`
- `wrangler.toml`（已配置 `assets` 指向 `public`）

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
   └─ DEPLOY_ZH.md      # 中文部署教程（含 Dashboard 一键流程）
```

---

## 可选：CLI 部署（非必须）

```bash
npm install
npx wrangler login
npm run deploy:pages   # 或 npm run deploy:worker
```

---

## 与上游 eyetrack 同步

当前 `public/index.html` 来源：
- `https://github.com/wannaqueen66-create/eyetrack` 的 `webapp/index.html`

当上游 AOI 标注网页更新后，建议执行：
1. 覆盖 `public/index.html`
2. 提交并推送到本仓库
3. Cloudflare（Pages/Workers）自动触发重新部署


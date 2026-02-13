# Cloudflare 部署教程（浏览器一键 + GitHub 自动发布）

目标：不走命令行，直接通过 Cloudflare Dashboard 连接 GitHub 仓库完成一键部署。

仓库：`https://github.com/wannaqueen66-create/eyetrack-aoi`

---

## 方案 1：Cloudflare Pages（推荐）

最适合本项目（纯静态 AOI 网页）。

### 步骤

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 点击 **Create application** → **Pages**
4. 选择 **Connect to Git**，授权 GitHub
5. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
6. 构建参数填写：
   - **Production branch**: `main`
   - **Build command**: 留空
   - **Build output directory**: `public`
   - **Root directory**: 留空（仓库根目录）
7. 点击 **Save and Deploy**

### 结果

- 首次部署完成后，获得 `https://<project>.pages.dev`
- 后续每次 push 到 `main`，自动触发部署（真正一键、全自动）

---

## 方案 2：Cloudflare Workers（GitHub 驱动）

适合后续要在同域加 API 的情况。

仓库已准备好：
- `worker.js`
- `wrangler.toml`（`[assets] directory = "./public"`）

### 步骤

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 点击 **Create** → **Workers**
4. 选择 **Import a repository**（GitHub）
5. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
6. CI/CD 配置：
   - Install command: `npm install`
   - Deploy command: `npx wrangler deploy`
7. 点击部署

### 结果

- 得到 `https://<worker-name>.<subdomain>.workers.dev`
- 后续 push 到 `main` 自动触发发布

---

## 推荐选择

- 只托管 AOI 网页：**Pages**
- 计划后续加后端接口：**Workers**

---

## 常见坑位

1. **Pages 显示 404**
   - 通常是 Build output directory 没填 `public`

2. **Workers 没有静态资源**
   - 确认 `wrangler.toml` 存在且包含：
     - `[assets]`
     - `directory = "./public"`
     - `binding = "ASSETS"`

3. **GitHub 推送后没自动部署**
   - 检查 Cloudflare 项目绑定的分支是否是 `main`

---

## 验收清单

部署后打开网站，确认：
- 页面能打开
- 上传图片正常
- 可绘制 AOI polygon
- 可导出 `aoi.json`
- 缩放/平移/编辑功能正常


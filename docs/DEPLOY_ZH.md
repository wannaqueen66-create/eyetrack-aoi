# Cloudflare 部署教程（eyetrack-aoi）

本教程把 AOI 创建网页部署到 Cloudflare，提供 **Pages** 和 **Workers** 两条路径。

## 0. 前置条件

- 已安装 Node.js（建议 >= 18）
- 有 Cloudflare 账号
- 本地已拉取本仓库

安装依赖：

```bash
npm install
```

登录 Cloudflare：

```bash
npx wrangler login
```

---

## 1. 方案 A：Cloudflare Pages（推荐）

适用于纯前端静态页面，简单稳定。

### 方法 A1：CLI 直接部署

```bash
npx wrangler pages deploy public --project-name eyetrack-aoi
```

如果提示项目不存在：
1. 打开 Cloudflare Dashboard → Workers & Pages → Create application → Pages
2. 创建项目名 `eyetrack-aoi`（不必绑定 Git）
3. 再执行上面命令

### 方法 A2：Git 自动部署

1. 把本仓库连接到 Cloudflare Pages
2. Build command 留空
3. Build output directory 设为 `public`
4. 推送到 main 分支后自动发布

---

## 2. 方案 B：Cloudflare Workers + Assets

适用于后续你想在同域下增加 API（例如 AOI 存储、用户管理、鉴权）。

仓库内已提供：
- `worker.js`: 请求转发到静态资源
- `wrangler.toml`: assets 目录绑定到 `public`

部署命令：

```bash
npx wrangler deploy
```

部署成功后访问 `workers.dev` 地址即可。

---

## 3. 验证清单

部署完成后检查：

- 页面可以打开
- 上传背景图正常
- 可绘制 polygon
- 可导出 `aoi.json`
- 缩放/平移/编辑功能正常

---

## 4. 常见问题

### Q1: `wrangler` 未登录或权限错误
重新执行：

```bash
npx wrangler login
```

### Q2: Pages 报项目不存在
先在 Dashboard 手动创建 Pages 项目，再用 CLI 部署。

### Q3: 更新后页面没变化
- 强刷浏览器缓存（Ctrl/Cmd + Shift + R）
- 确认部署到正确项目名

---

## 5. 后续建议

- 若仅托管 AOI 网页：长期用 **Pages**
- 若未来增加后端接口：切 **Workers + Assets**


# eyetrack-aoi（中文说明）

这是从 `eyetrack` 项目中拆分出来的 AOI 标注网页仓库，目标是：
- 快速在线标注 AOI（不规则多边形）
- 用 Cloudflare + GitHub 实现一键部署和自动更新

仓库地址：`https://github.com/wannaqueen66-create/eyetrack-aoi`

---

## 一、网页里两个上传框分别是什么？

你提到的困惑是对的，下面是明确对应关系：

### 1）上传场景底图（必选）
- 文件类型：`jpg/png`
- 作用：作为 AOI 标注的背景图
- 没有这张图就无法开始有效框选

### 2）上传眼动 CSV（可选）
- 文件类型：`.csv`
- 必须包含列名：
  - `Gaze Point X[px]`
  - `Gaze Point Y[px]`
- 作用：只是在图上叠加 gaze 点，帮助你参考注意分布
- 不上传也不影响 AOI 的创建和导出

---

## 二、Cloudflare 一键部署（浏览器操作）

## 方案 A：Cloudflare Pages（推荐）

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 点击 **Create application** → **Pages**
4. 选择 **Connect to Git**，授权 GitHub
5. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
6. 构建配置：
   - Production branch: `main`
   - Build command: 留空
   - Build output directory: `public`
7. 点击 **Save and Deploy**

部署后得到 `*.pages.dev` 地址。
之后每次推送到 `main` 会自动部署。

## 方案 B：Cloudflare Workers（GitHub 驱动）

1. 进入 **Workers & Pages**
2. 点击 **Create** → **Workers**
3. 选择 **Import repository**
4. 选择仓库：`wannaqueen66-create/eyetrack-aoi`
5. 填写：
   - Install command: `npm install`
   - Deploy command: `npx wrangler deploy`
6. 确认部署

---

## 三、日常更新流程

当你改了前端页面后：
1. 提交并推送到 `main`
2. Cloudflare 自动触发重新部署
3. 打开线上地址验证即可

---

## 四、功能说明（当前版本）

- 不规则多边形 AOI 绘制
- 同类 AOI 多区域
- 顶点拖拽编辑
- Shift 拖动多边形整体移动
- 导入/导出 `aoi.json`
- 可选叠加 gaze 点显示


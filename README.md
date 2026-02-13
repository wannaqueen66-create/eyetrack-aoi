# eyetrack-aoi

AOI Labeler web app extracted from `eyetrack`, deployable on Cloudflare with GitHub-based one-click flow.

从 `eyetrack` 拆分出的 AOI 标注网页，支持 Cloudflare 基于 GitHub 的一键部署。

- 中文完整文档 / Full Chinese guide: [`README_zh.md`](./README_zh.md)

---

## Features / 功能

- Irregular polygon AOI drawing / 不规则多边形 AOI 框选
- Multiple polygons under one class / 同类多区域
- Import & export `aoi.json` / 导入导出 `aoi.json`
- **Batch mode (NEW)**: 1 image + N CSV files → zip results
- **批处理（新增）**：1 张底图 + 多个 CSV 批量产出指标压缩包

---

## What to upload / 上传什么文件

### Required / 必选
- Background image (`jpg/png`) / 场景底图（`jpg/png`）

### Optional / 可选
- Single CSV overlay (`Gaze Point X[px]`, `Gaze Point Y[px]`) for visualization
- 单个 CSV 叠加显示 gaze 点（需包含上述两列）

### Batch mode / 批处理
- Select multiple CSV files in **Batch CSV input**
- Click **Run Batch** then **Download batch_results.zip**

Zip content:
- `summary_by_class.csv`
- `per_file/<name>_aoi_metrics_by_class.csv`
- `per_file/<name>_aoi_metrics_by_polygon.csv`
- `failed_files.csv` (only when parsing fails)

---

## One-click deploy with GitHub (Browser)

### Option A: Cloudflare Pages (Recommended)
1. Dashboard → Workers & Pages → Create application → Pages
2. Connect GitHub repo: `wannaqueen66-create/eyetrack-aoi`
3. Build command: *(empty)*
4. Output directory: `public`
5. Save and Deploy

### Option B: Cloudflare Workers (Git-driven)
1. Dashboard → Workers & Pages → Create → Workers
2. Import repository: `wannaqueen66-create/eyetrack-aoi`
3. Install command: `npm install`
4. Deploy command: `npx wrangler deploy`


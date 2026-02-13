# eyetrack-aoi（中文说明）

这是从 `eyetrack` 项目拆分出的 AOI 标注网页仓库，支持 Cloudflare + GitHub 一键部署。

仓库：`https://github.com/wannaqueen66-create/eyetrack-aoi`

---

## 1. 现在能做什么

- 不规则多边形 AOI 框选
- 同一 AOI 类支持多个分离区域
- 导入/导出 `aoi.json`
- 可叠加 gaze 点查看
- **批处理（新增）**：1 张底图对应多个 CSV，批量输出 AOI 指标

---

## 2. 两个上传框分别是什么

### 上传场景底图（必选）
- 文件：`jpg/png`
- 作用：AOI 绘制背景

### 上传眼动 CSV（可选）
- 文件：`.csv`
- 必须有列：
  - `Gaze Point X[px]`
  - `Gaze Point Y[px]`
- 作用：叠加显示 gaze 点（不影响 AOI 导出）

---

## 3. 批处理怎么用（重点）

适用场景：**一张映射图 + 多个被试 CSV**。

步骤：
1. 先上传底图并画好 AOI（或导入已有 `aoi.json`）
2. 在“批处理”区域选择多个 CSV
3. 点击“批量计算 AOI 指标”
4. 点击“下载 batch_results.zip”

压缩包内容：
- `summary_by_class.csv`：所有文件汇总（按 class）
- `per_file/<文件名>_aoi_metrics_by_class.csv`
- `per_file/<文件名>_aoi_metrics_by_polygon.csv`
- `failed_files.csv`：失败文件及原因（若有）

---

## 4. Cloudflare 浏览器一键部署

### 方案 A：Pages（推荐）
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages
2. Connect to Git，选择仓库 `wannaqueen66-create/eyetrack-aoi`
3. Build command 留空
4. Build output directory 填 `public`
5. Save and Deploy

### 方案 B：Workers（GitHub 驱动）
1. Dashboard → Workers & Pages → Create → Workers
2. Import repository：`wannaqueen66-create/eyetrack-aoi`
3. Install command：`npm install`
4. Deploy command：`npx wrangler deploy`


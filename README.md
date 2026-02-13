# eyetrack-aoi

AOI Labeler web app extracted from `eyetrack`, deployable on Cloudflare with GitHub-based one-click flow.

从 `eyetrack` 拆分出的 AOI 标注网页，支持 Cloudflare 基于 GitHub 的一键部署。

- 中文文档（完整）：[`README_zh.md`](./README_zh.md)
- Chinese full guide: [`README_zh.md`](./README_zh.md)

---

## 1) What to upload / 上传什么文件

### Required / 必选
- **Background image** (`jpg/png`): your scene screenshot/photo used for AOI drawing.
- **场景底图**（`jpg/png`）：用于画 AOI 的图片。

### Optional / 可选
- **Gaze CSV** with columns:
  - `Gaze Point X[px]`
  - `Gaze Point Y[px]`
- This is only for visual overlay of gaze points, not required for AOI export.
- **眼动 CSV**（包含以上两列）：仅用于叠加显示 gaze 点，不影响 AOI 导出。

---

## 2) One-click deploy with GitHub (Browser)

### Option A: Cloudflare Pages (Recommended)
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages
2. Connect to GitHub and choose: `wannaqueen66-create/eyetrack-aoi`
3. Build settings:
   - Build command: *(empty)*
   - Output directory: `public`
4. Save and Deploy

### Option B: Cloudflare Workers (Git-driven)
1. Dashboard → Workers & Pages → Create → Workers
2. Import repository: `wannaqueen66-create/eyetrack-aoi`
3. Set:
   - Install command: `npm install`
   - Deploy command: `npx wrangler deploy`

---

## 3) Repo structure

```text
.
├─ public/index.html
├─ worker.js
├─ wrangler.toml
├─ docs/DEPLOY_ZH.md
└─ README_zh.md
```


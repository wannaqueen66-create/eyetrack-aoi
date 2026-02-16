/*
  AOI batch computation worker.

  Goals:
  - Offload heavy computation from UI thread
  - Use bounding-box prefilter for polygons
  - Support two dwell aggregation modes:
      - "row": sum Fixation Duration[ms] for every row inside AOI (legacy behavior)
      - "fixation": sum one duration per Fixation Index inside AOI (dedup by fixation id)

  Messages:
    main -> worker: { type:'run', payload:{ aois, files:[{name,text}], mode:'row'|'fixation' } }
    worker -> main:
      - { type:'progress', payload:{ index, total, name } }
      - { type:'result', payload:{ zipBase64, summaryCount, failedCount, failed } }
      - { type:'error', payload:{ message } }
*/

/* global Papa, JSZip */

// Load dependencies inside worker context
importScripts('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js');
importScripts('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');

function toNum(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function pointInPoly(px, py, poly){
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function bboxOf(poly){
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x,y] of poly){
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return {minX, minY, maxX, maxY};
}

function rowsToCSV(rows, columns){
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const sv = String(v);
    return /[",\n]/.test(sv) ? '"' + sv.replace(/"/g, '""') + '"' : sv;
  };
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => esc(r[c])).join(','));
  return [header, ...body].join('\n');
}

function normalizeAoIs(aoisObj){
  const out = {};
  for (const cls of Object.keys(aoisObj || {})) {
    out[cls] = (aoisObj[cls] || []).map(p => ({ points: (p.points || p) }));
  }
  return out;
}

function computeMetricsForRows(rows, aoisObj, mode){
  const classes = Object.keys(aoisObj || {});

  // parse t0 for TTFF baseline
  let t0 = NaN;
  for (let i=0;i<rows.length;i++){
    const t = toNum(rows[i]['Recording Time Stamp[ms]']);
    if (Number.isFinite(t)) { t0 = t; break; }
  }
  // if not strictly sorted, still better to use min
  if (Number.isFinite(t0)){
    for (let i=0;i<rows.length;i++){
      const t = toNum(rows[i]['Recording Time Stamp[ms]']);
      if (Number.isFinite(t) && t < t0) t0 = t;
    }
  }

  const perPolygon = [];
  const perClass = [];

  // Precompute polygons + bboxes
  const polysByClass = {};
  for (const cls of classes){
    polysByClass[cls] = (aoisObj[cls] || []).map((pObj, idx) => {
      const pts = pObj.points || pObj;
      return { pts, polygon_id: idx+1, bbox: bboxOf(pts) };
    });
  }

  // For union per class we track hit row indices
  const classUnionHits = {};
  for (const cls of classes) classUnionHits[cls] = new Set();

  // Compute per polygon
  for (const cls of classes){
    const polys = polysByClass[cls];

    for (const polyInfo of polys){
      const {pts: poly, polygon_id, bbox} = polyInfo;
      let samples = 0;
      let dwell = 0;
      let minT = Infinity;

      const fixationSeen = new Set();

      for (let ri=0; ri<rows.length; ri++){
        const r = rows[ri];
        const x = toNum(r['Gaze Point X[px]']);
        const y = toNum(r['Gaze Point Y[px]']);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

        // bbox prefilter
        if (x < bbox.minX || x > bbox.maxX || y < bbox.minY || y > bbox.maxY) continue;

        if (!pointInPoly(x, y, poly)) continue;

        samples += 1;
        classUnionHits[cls].add(ri);

        const t = toNum(r['Recording Time Stamp[ms]']);
        if (Number.isFinite(t) && t < minT) minT = t;

        const fd = toNum(r['Fixation Duration[ms]']);
        if (mode === 'fixation'){
          const fx = r['Fixation Index'];
          const key = (fx === undefined || fx === null) ? '' : String(fx).trim();
          if (key){
            if (!fixationSeen.has(key)){
              fixationSeen.add(key);
              if (Number.isFinite(fd)) dwell += fd;
            }
          } else {
            // no fixation index; fall back to row sum for this row
            if (Number.isFinite(fd)) dwell += fd;
          }
        } else {
          if (Number.isFinite(fd)) dwell += fd;
          const fx = r['Fixation Index'];
          const key = (fx === undefined || fx === null) ? '' : String(fx).trim();
          if (key) fixationSeen.add(key);
        }
      }

      perPolygon.push({
        class_name: cls,
        polygon_id,
        samples,
        dwell_time_ms: dwell,
        fixation_count: fixationSeen.size,
        TTFF_ms: (Number.isFinite(minT) && Number.isFinite(t0)) ? (minT - t0) : ''
      });
    }
  }

  // Compute per class (union)
  for (const cls of classes){
    const hitIdx = classUnionHits[cls];
    let dwell = 0;
    let minT = Infinity;
    const fixationSeen = new Set();

    if (mode === 'fixation'){
      // dedup by fixation index
      const fixToDur = new Map();
      for (const ri of hitIdx){
        const r = rows[ri];
        const t = toNum(r['Recording Time Stamp[ms]']);
        if (Number.isFinite(t) && t < minT) minT = t;

        const fx = r['Fixation Index'];
        const key = (fx === undefined || fx === null) ? '' : String(fx).trim();
        const fd = toNum(r['Fixation Duration[ms]']);
        if (key){
          fixationSeen.add(key);
          if (!fixToDur.has(key) && Number.isFinite(fd)) fixToDur.set(key, fd);
        } else {
          // no fixation index; sum rows
          if (Number.isFinite(fd)) dwell += fd;
        }
      }
      for (const v of fixToDur.values()) dwell += v;
    } else {
      for (const ri of hitIdx){
        const r = rows[ri];
        const t = toNum(r['Recording Time Stamp[ms]']);
        if (Number.isFinite(t) && t < minT) minT = t;
        const fd = toNum(r['Fixation Duration[ms]']);
        if (Number.isFinite(fd)) dwell += fd;
        const fx = r['Fixation Index'];
        const key = (fx === undefined || fx === null) ? '' : String(fx).trim();
        if (key) fixationSeen.add(key);
      }
    }

    perClass.push({
      class_name: cls,
      polygon_count: (aoisObj[cls] || []).length,
      samples: hitIdx.size,
      dwell_time_ms: dwell,
      fixation_count: fixationSeen.size,
      TTFF_ms: (Number.isFinite(minT) && Number.isFinite(t0)) ? (minT - t0) : ''
    });
  }

  return { perPolygon, perClass };
}

async function buildZipForFiles(files, aoisObj, mode){
  const zip = new JSZip();
  const allClassRows = [];
  const failed = [];

  for (let i=0; i<files.length; i++){
    const f = files[i];
    postMessage({ type:'progress', payload:{ index:i+1, total:files.length, name:f.name } });

    try{
      const parsed = Papa.parse(f.text, { header:true, skipEmptyLines:true });
      const rows = parsed.data || [];
      if (!rows.length) throw new Error('空CSV或解析失败');
      const hasX = rows[0] && ('Gaze Point X[px]' in rows[0]);
      const hasY = rows[0] && ('Gaze Point Y[px]' in rows[0]);
      if (!hasX || !hasY) throw new Error('缺少 Gaze Point X[px]/Y[px] 列');

      const { perPolygon, perClass } = computeMetricsForRows(rows, aoisObj, mode);
      const base = f.name.replace(/\.csv$/i, '');
      const classCols = ['class_name','polygon_count','samples','dwell_time_ms','fixation_count','TTFF_ms'];
      const polyCols  = ['class_name','polygon_id','samples','dwell_time_ms','fixation_count','TTFF_ms'];

      zip.file(`per_file/${base}_aoi_metrics_by_class.csv`, rowsToCSV(perClass, classCols));
      zip.file(`per_file/${base}_aoi_metrics_by_polygon.csv`, rowsToCSV(perPolygon, polyCols));

      perClass.forEach(r => allClassRows.push({ ...r, source_file: f.name }));
    } catch (err){
      failed.push({ file: f.name, error: String(err && (err.message || err)) });
    }
  }

  const summaryCols = ['source_file','class_name','polygon_count','samples','dwell_time_ms','fixation_count','TTFF_ms'];
  zip.file('summary_by_class.csv', rowsToCSV(allClassRows, summaryCols));
  if (failed.length){
    zip.file('failed_files.csv', rowsToCSV(failed, ['file','error']));
  }

  const blob = await zip.generateAsync({ type:'base64' });
  return { zipBase64: blob, summaryCount: allClassRows.length, failedCount: failed.length, failed };
}

self.onmessage = async (ev) => {
  try{
    const msg = ev.data || {};
    if (msg.type !== 'run') return;
    const payload = msg.payload || {};
    const aoisObj = normalizeAoIs(payload.aois || {});
    const files = payload.files || [];
    const mode = payload.mode === 'fixation' ? 'fixation' : 'row';

    if (!files.length) throw new Error('没有收到 CSV 文件');
    if (!Object.keys(aoisObj).length) throw new Error('没有 AOI 数据');

    const res = await buildZipForFiles(files, aoisObj, mode);
    postMessage({ type:'result', payload: res });
  } catch (err){
    postMessage({ type:'error', payload:{ message: String(err && (err.message || err)) } });
  }
};

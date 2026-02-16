// geometry.js - reusable geometry + AOI validation utilities
// UMD-ish export: window.AOIGeom in browser, module.exports in Node.

(function(root, factory){
  if(typeof module === 'object' && module.exports){
    module.exports = factory();
  } else {
    root.AOIGeom = factory();
  }
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  function pointInPoly(px, py, poly){
    let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1];
      const intersect=((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/((yj-yi)||1e-9)+xi);
      if(intersect) inside=!inside;
    }
    return inside;
  }

  function polygonArea(poly){
    // Shoelace formula
    if(!poly || poly.length < 3) return 0;
    let a = 0;
    for(let i=0;i<poly.length;i++){
      const x1 = poly[i][0], y1 = poly[i][1];
      const x2 = poly[(i+1)%poly.length][0], y2 = poly[(i+1)%poly.length][1];
      a += x1*y2 - x2*y1;
    }
    return Math.abs(a)/2;
  }

  function segmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy){
    function orient(px,py,qx,qy,rx,ry){
      return (qx-px)*(ry-py) - (qy-py)*(rx-px);
    }
    function onSeg(px,py,qx,qy,rx,ry){
      return Math.min(px,rx) <= qx && qx <= Math.max(px,rx) && Math.min(py,ry) <= qy && qy <= Math.max(py,ry);
    }
    const o1 = orient(ax,ay,bx,by,cx,cy);
    const o2 = orient(ax,ay,bx,by,dx,dy);
    const o3 = orient(cx,cy,dx,dy,ax,ay);
    const o4 = orient(cx,cy,dx,dy,bx,by);

    if(((o1>0 && o2<0) || (o1<0 && o2>0)) && ((o3>0 && o4<0) || (o3<0 && o4>0))) return true;
    if(o1===0 && onSeg(ax,ay,cx,cy,bx,by)) return true;
    if(o2===0 && onSeg(ax,ay,dx,dy,bx,by)) return true;
    if(o3===0 && onSeg(cx,cy,ax,ay,dx,dy)) return true;
    if(o4===0 && onSeg(cx,cy,bx,by,dx,dy)) return true;
    return false;
  }

  function polygonSelfIntersects(poly){
    if(!poly || poly.length < 4) return false;
    for(let i=0;i<poly.length;i++){
      const a = poly[i];
      const b = poly[(i+1)%poly.length];
      for(let j=i+1;j<poly.length;j++){
        if(Math.abs(i-j) <= 1) continue;
        if(i===0 && j===poly.length-1) continue;
        const c = poly[j];
        const d = poly[(j+1)%poly.length];
        if(segmentsIntersect(a[0],a[1],b[0],b[1],c[0],c[1],d[0],d[1])) return true;
      }
    }
    return false;
  }

  function validateAoIs(aoisObj){
    const warnings=[];
    for(const cls of Object.keys(aoisObj||{})){
      const polys = aoisObj[cls] || [];
      polys.forEach((pObj, idx)=>{
        const poly = (pObj && pObj.points) ? pObj.points : pObj;
        if(!poly || poly.length < 3){
          warnings.push(`${cls}#${idx+1}: 点数不足（<3）`);
          return;
        }
        for(const pt of poly){
          if(!pt || pt.length<2 || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])){
            warnings.push(`${cls}#${idx+1}: 存在非法点（NaN/空）`);
            break;
          }
        }
        const area = polygonArea(poly);
        if(area <= 1e-6) warnings.push(`${cls}#${idx+1}: 面积≈0（可能退化）`);
        if(polygonSelfIntersects(poly)) warnings.push(`${cls}#${idx+1}: 多边形自交（建议重新画/拆分）`);
      });
    }
    return warnings;
  }

  return {
    pointInPoly,
    polygonArea,
    polygonSelfIntersects,
    validateAoIs,
  };
});

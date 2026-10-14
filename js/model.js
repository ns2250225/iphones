/*
 * 程序化 iPhone 建模
 * 机身 = 圆角矩形（超椭圆角）轮廓 × 边缘截面(profile) 扫掠；前后盖板为平面填充。
 * 所有几何单位为毫米，整机 group 缩放 0.01 放入场景。
 */
(function () {
  const T = THREE;
  const APPLE_PATH = 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';
  window.APPLE_PATH = APPLE_PATH;

  // ---------- 几何工具 ----------
  // r 可为数组：[右上, 左上, 左下, 右下]
  function outline(w, h, r, n, seg) {
    const pts = [], e = 2 / n, rs = Array.isArray(r) ? r : [r, r, r, r];
    const sx = [1, -1, -1, 1], sy = [1, 1, -1, -1];
    for (let ci = 0; ci < 4; ci++) {
      const r = rs[ci], ox = sx[ci] * (w / 2 - r), oy = sy[ci] * (h / 2 - r), a0 = ci * 90;
      for (let i = 0; i <= seg; i++) {
        const a = (a0 + 90 * i / seg) * Math.PI / 180;
        const c = Math.cos(a), s = Math.sin(a);
        const px = ox + r * Math.sign(c) * Math.pow(Math.abs(c), e);
        const py = oy + r * Math.sign(s) * Math.pow(Math.abs(s), e);
        const gx = Math.sign(c) * Math.pow(Math.abs(c), 2 - e), gy = Math.sign(s) * Math.pow(Math.abs(s), 2 - e);
        const l = Math.hypot(gx, gy) || 1;
        pts.push({ x: px, y: py, nx: gx / l, ny: gy / l });
      }
    }
    return pts;
  }
  const inset = (ol, d) => ol.map(p => new T.Vector2(p.x - p.nx * d, p.y - p.ny * d));

  // 四角独立半径的矩形（cx 为中心 x 偏移）：[右上, 左上, 左下, 右下]
  function rrShape4(w, h, rs, cx) {
    const s = new T.Shape(), x = (cx || 0) - w / 2, y = -h / 2, [tr, tl, bl, br] = rs;
    s.moveTo(x + bl, y);
    s.lineTo(x + w - br, y); s.quadraticCurveTo(x + w, y, x + w, y + br);
    s.lineTo(x + w, y + h - tr); s.quadraticCurveTo(x + w, y + h, x + w - tr, y + h);
    s.lineTo(x + tl, y + h); s.quadraticCurveTo(x, y + h, x, y + h - tl);
    s.lineTo(x, y + bl); s.quadraticCurveTo(x, y, x + bl, y);
    return s;
  }

  function rrShape(w, h, rt, rb) {
    rb = rb === undefined ? rt : rb;
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + rb, y);
    s.lineTo(x + w - rb, y); s.quadraticCurveTo(x + w, y, x + w, y + rb);
    s.lineTo(x + w, y + h - rt); s.quadraticCurveTo(x + w, y + h, x + w - rt, y + h);
    s.lineTo(x + rt, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rt);
    s.lineTo(x, y + rb); s.quadraticCurveTo(x, y, x + rb, y);
    return s;
  }

  function planarUV(geo, W, H, oy) {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getY(i) - (oy || 0) + H / 2) / H);
    uv.needsUpdate = true;
  }

  // 截面扫掠：profile 从正面(z=+d/2)走到背面(z=-d/2)
  function sweep(ol, profile, matKeys) {
    const rows = [];
    let prevM = profile[0].m;
    for (const p of profile) {
      if (p.crease) rows.push({ i: p.i, z: p.z, m: prevM });
      rows.push({ i: p.i, z: p.z, m: p.m });
      prevM = p.m;
    }
    const N = ol.length, P = rows.length, pos = [];
    for (const r of rows) for (const p of ol) pos.push(p.x - p.nx * r.i, p.y - p.ny * r.i, r.z);
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    const idx = [];
    let gStart = 0, gMat = -1;
    for (let j = 0; j < P - 1; j++) {
      const mi = matKeys.indexOf(rows[j].m);
      if (mi !== gMat) { if (gMat >= 0) geo.addGroup(gStart, idx.length - gStart, gMat); gStart = idx.length; gMat = mi; }
      for (let k = 0; k < N; k++) {
        const a = j * N + k, b = j * N + (k + 1) % N, c = (j + 1) * N + (k + 1) % N, d = (j + 1) * N + k;
        idx.push(a, c, b, a, d, c);
      }
    }
    geo.addGroup(gStart, idx.length - gStart, gMat);
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  function superQuarter(out, from, to, n, steps, mFn) {
    // from/to: {i,z}; 生成从 from 到 to 的四分之一超椭圆，from 处切线水平，to 处切线竖直（或相反）
    const e = 2 / n;
    for (let s = 1; s <= steps; s++) {
      const a = (s / steps) * Math.PI / 2;
      const ca = Math.pow(Math.cos(a), e), sa = Math.pow(Math.sin(a), e);
      let i, z;
      if (from.i > to.i) { i = from.i - (from.i - to.i) * sa; z = to.z + (from.z - to.z) * ca; }
      else { i = from.i + (to.i - from.i) * (1 - ca); z = from.z - (from.z - to.z) * sa; }
      out.push({ i, z, m: mFn(z) });
    }
  }

  function makeProfile(d, D) {
    const d2 = D / 2;
    const P = [];
    switch (d.profile) {
      case 'pillow': {
        const zc = d2 - d.pillow.z, B = d.pillow.back;
        P.push({ i: 1.3, z: d2, m: 'chrome' }, { i: 0.72, z: d2 - 0.12, m: 'chrome' }, { i: 0.28, z: d2 - 0.42, m: 'chrome' }, { i: 0.05, z: d2 - 0.9, m: 'chrome' }, { i: 0, z: zc, m: 'back', crease: true });
        superQuarter(P, { i: 0, z: zc }, { i: B, z: -d2 }, d.id === 'iphone' ? 2.8 : 2.2, 18, () => 'back');
        return { P, zBtn: zc - 1.2 };
      }
      case 'flat4':
        P.push({ i: 0.3, z: d2, m: 'front' }, { i: 0.08, z: d2 - 0.12, m: 'front' }, { i: 0, z: d2 - 0.35, m: 'front' },
          { i: 0.1, z: d2 - 0.75, m: 'frame', crease: true }, { i: 0, z: d2 - 1.05, m: 'frame' }, { i: 0, z: -d2 + 1.05, m: 'frame' }, { i: 0.1, z: -d2 + 0.75, m: 'back', crease: true },
          { i: 0, z: -d2 + 0.35, m: 'back' }, { i: 0.08, z: -d2 + 0.12, m: 'back' }, { i: 0.3, z: -d2, m: 'back' });
        return { P, zBtn: 0 };
      case 'chamfer':
        P.push({ i: 0.62, z: d2, m: 'chamfer' }, { i: 0, z: d2 - 0.62, m: 'frame', crease: true }, { i: 0, z: -d2 + 0.62, m: 'chamfer', crease: true }, { i: 0.62, z: -d2, m: 'chamfer' });
        return { P, zBtn: 0 };
      case 'plastic': {
        const zm = d2 * 0.12;
        P.push({ i: 1.0, z: d2, m: 'frame' });
        superQuarter(P, { i: 1.0, z: d2 }, { i: 0, z: zm }, 2.5, 10, () => 'frame');
        superQuarter(P, { i: 0, z: zm }, { i: 2.8, z: -d2 }, 2.3, 14, () => 'frame');
        return { P, zBtn: zm };
      }
      case 'round': {
        const o = d.round, zf = d2 - Math.min(1.0, D * 0.13), zb = -d2 + 0.9;
        const mFn = z => z > zf ? 'front' : (o.glassBack && z < zb ? 'back' : 'frame');
        P.push({ i: o.f, z: d2, m: 'front' });
        superQuarter(P, { i: o.f, z: d2 }, { i: 0, z: 0 }, o.n, 14, mFn);
        superQuarter(P, { i: 0, z: 0 }, { i: o.b, z: -d2 }, o.n, 14, mFn);
        return { P, zBtn: 0 };
      }
      case 'flat': {
        const o = d.flat || {};
        P.push({ i: 0.55, z: d2, m: 'front' }, { i: 0.2, z: d2 - 0.08, m: 'front' }, { i: 0.05, z: d2 - 0.22, m: 'front' });
        if (o.round) {
          P.push({ i: 0.04, z: d2 - 0.32, m: 'frame', crease: true }, { i: 0.01, z: d2 - 0.7, m: 'frame' }, { i: 0, z: d2 - 1.2, m: 'frame' },
            { i: 0, z: -d2 + 1.2, m: 'frame' }, { i: 0.01, z: -d2 + 0.7, m: 'frame' }, { i: 0.04, z: -d2 + 0.32, m: 'back', crease: true });
        } else {
          P.push({ i: 0, z: d2 - 0.4, m: 'frame', crease: true }, { i: 0, z: -d2 + 0.4, m: 'back', crease: true });
        }
        P.push({ i: 0.05, z: -d2 + 0.22, m: 'back' }, { i: 0.2, z: -d2 + 0.08, m: 'back' }, { i: 0.55, z: -d2, m: 'back' });
        return { P, zBtn: 0 };
      }
      case 'unibody': {
        P.push({ i: 0.55, z: d2, m: 'front' }, { i: 0.2, z: d2 - 0.08, m: 'front' }, { i: 0.05, z: d2 - 0.22, m: 'front' }, { i: 0, z: d2 - 0.4, m: 'frame', crease: true }, { i: 0, z: -d2 + 2.0, m: 'frame' });
        superQuarter(P, { i: 0, z: -d2 + 2.0 }, { i: 1.7, z: -d2 }, 2.4, 12, () => 'frame');
        return { P, zBtn: 0.6 };
      }
    }
  }

  // ---------- 材质 ----------
  const C = c => new T.Color(c);
  function lum(hex) { const c = new T.Color(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; }
  function shade(hex, f) { const c = new T.Color(hex); return f > 0 ? c.lerp(new T.Color('#ffffff'), f) : c.lerp(new T.Color('#000000'), -f); }

  function material(type, color, extra) {
    const m = (o) => new T.MeshPhysicalMaterial(Object.assign({ color: C(color) }, o, extra || {}));
    switch (type) {
      case 'aluminum': return m({ metalness: 0.88, roughness: 0.36 });
      case 'aluminumMatte': return m({ metalness: 0.75, roughness: 0.45 });
      case 'aluminumUni': return m({ metalness: 0.8, roughness: 0.42 });
      case 'steel': return m({ metalness: 1, roughness: 0.12 });
      case 'titanium': return m({ metalness: 0.95, roughness: 0.42 });
      case 'titaniumPolish': return m({ metalness: 1, roughness: 0.1 });
      case 'chrome': return m({ metalness: 1, roughness: 0.05 });
      case 'plasticGloss': return m({ metalness: 0, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04 });
      case 'glass': return m({ metalness: 0.05, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.02 });
      case 'glassMatte': return m({ metalness: 0.05, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.45 });
      case 'jet': return m({ metalness: 0.6, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.01 });
      case 'frontGlass': return m({ metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 0.45 });
      case 'dark': return new T.MeshStandardMaterial({ color: C(color), roughness: 0.6, metalness: 0.1 });
      default: return m({ metalness: 0.5, roughness: 0.4 });
    }
  }

  // ---------- 背面贴图 ----------
  function drawApple(ctx, cx, cy, s, fill) {
    ctx.save(); ctx.translate(cx - s / 2, cy - s / 2); ctx.scale(s / 24, s / 24);
    ctx.fillStyle = fill; ctx.fill(new Path2D(APPLE_PATH)); ctx.restore();
  }
  window.drawApple = drawApple;

  function backTexture(d, col, W, H) {
    const k = 6, cv = document.createElement('canvas');
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    const g = cv.getContext('2d');
    g.scale(k, k);
    const b = d.back, base = col.back;
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    const light = lum(base) > 0.5;
    let logoFill = b.logoColor || '#' + shade(base, light ? -0.16 : 0.2).getHexString();
    let textFill = '#' + shade(base, light ? -0.28 : 0.3).getHexString();
    let logoS = 13, logoY = H * b.logoY;

    if (b.style === '2007') {
      g.fillStyle = '#1b1b1d'; g.fillRect(0, H - 19, W, 19);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, H - 19, W, 0.3);
      logoFill = '#e9eaec'; textFill = '#8c8e92';
      // 拉丝纹理
      g.globalAlpha = 0.05;
      for (let y = 0; y < H - 19; y += 0.35) { g.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'; g.fillRect(0, y, W, 0.18); }
      g.globalAlpha = 1;
      drawApple(g, W / 2, logoY, 14, logoFill);
      txt(g, 'iPhone', W / 2, H * 0.56, 4.4, textFill, 500);
      txt(g, '8GB', W / 2, H * 0.62, 2.2, textFill, 400);
      return tex(cv);
    }
    if (b.style === 'two-tone') {
      g.fillStyle = col.strip; g.fillRect(0, 0, W, b.strips[0]); g.fillRect(0, H - b.strips[1], W, b.strips[1]);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, b.strips[0], W, 0.12); g.fillRect(0, H - b.strips[1] - 0.12, W, 0.12);
    }
    if (b.style === 'alu6') {
      g.fillStyle = col.strip;
      if (b.antenna === 'band') { g.fillRect(0, 15.4, W, 1.2); g.fillRect(0, H - 16.6, W, 1.2); }
      else {
        g.strokeStyle = col.strip; g.lineWidth = 0.75;
        const r = d.corner - 2.6, o = 2.9;
        g.beginPath(); g.moveTo(o, 13); g.lineTo(o, o + r); g.arcTo(o, o, o + r, o, r); g.lineTo(W - o - r, o); g.arcTo(W - o, o, W - o, o + r, r); g.lineTo(W - o, 13); g.stroke();
        g.beginPath(); g.moveTo(o, H - 13); g.lineTo(o, H - o - r); g.arcTo(o, H - o, o + r, H - o, r); g.lineTo(W - o - r, H - o); g.arcTo(W - o, H - o, W - o, H - o - r, r); g.lineTo(W - o, H - 13); g.stroke();
      }
    }
    if (b.style === 'unibody') {
      const [top, bot] = b.cutout, m = 4.2;
      g.fillStyle = col.glass; rr(g, m, top, W - 2 * m, H - top - bot, 5); g.fill();
      if (!b.matched) { g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 0.15; g.stroke(); }
      logoFill = '#' + shade(col.glass, light ? -0.12 : 0.16).getHexString();
    }
    if (b.style === 'plastic' && b.matchText) textFill = '#' + shade(base, light ? -0.2 : 0.25).getHexString();
    if (b.shinyText) textFill = '#cfcfcf';
    if (b.style === 'plastic' && !b.matchText) textFill = light ? '#9a9a9a' : '#8a8a8a';

    drawApple(g, W / 2, logoY, logoS, logoFill);
    if (b.text) {
      const ty = b.style === 'two-tone' ? H * 0.78 : (b.style === 'alu6' || b.style === 'glass') ? H * 0.82 : H * 0.7;
      txt(g, 'iPhone', W / 2, ty, 4.1, textFill, 500);
      if (b.mark) { g.fillStyle = textFill; rr(g, W / 2 - 2.6, ty + 3.4, 5.2, 4.2, 0.9); g.fill(); txt(g, 'S', W / 2, ty + 5.55, 3.2, base, 700); }
      const fine = b.style === 'plastic' || b.style === 'glass4' ? ['Designed by Apple in California  Assembled in China', 'Model A1241  FCC ID: BCG-E2' + (d.year % 10) + '41A  IC: 579C-E' + d.year] : ['Designed by Apple in California  Assembled in China'];
      fine.forEach((s, i) => txt(g, s, W / 2, ty + (b.mark ? 10 : 4.5) + i * 1.6, 1.05, textFill, 400));
    }
    return tex(cv);
  }
  function txt(g, s, x, y, size, fill, w) {
    g.fillStyle = fill; g.font = `${w || 400} ${size}px "Helvetica Neue", Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y);
  }
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  window.rrPath = rr;
  function tex(cv) { const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; }

  let homeIconTex = null;
  function homeSquareTex() {
    if (homeIconTex) return homeIconTex;
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    g.strokeStyle = '#9a9a9c'; g.lineWidth = 5; rr(g, 40, 40, 48, 48, 9); g.stroke();
    homeIconTex = tex(cv); return homeIconTex;
  }

  // ---------- 主构建 ----------
  function displaySize(d) {
    const [pw, ph] = d.display.pts, dg = d.display.inch * 25.4, hyp = Math.hypot(pw, ph);
    return { sw: dg * pw / hyp, sh: dg * ph / hyp, mmPerPt: dg / hyp };
  }

  class PhoneModel {
    constructor(data, colorIdx, os) {
      this.data = data; this.colorIdx = colorIdx; this.os = os;
      this.group = new T.Group();
      this.root = new T.Group(); this.root.scale.setScalar(0.01); this.group.add(this.root);
      this.parts = []; this.pressAnims = [];
      this.disposables = [];
      this.build();
    }
    add(mesh, parent) { (parent || this.root).add(mesh); if (mesh.geometry) this.disposables.push(mesh.geometry); return mesh; }

    build() {
      const d = this.data, col = d.colors[this.colorIdx];
      const [H, W, D] = d.dims, d2 = D / 2;
      this.H = H; this.W = W; this.D = D;
      const ol = outline(W, H, d.corner, d.exp, 18);
      const { P, zBtn } = makeProfile(d, D);
      this.zBtn = zBtn;

      // 材质
      const frameType = col.jet ? 'jet' : (col.matte ? 'aluminumMatte' : d.frameMat);
      const frontCol = col.front === 'white' ? '#f3f3f1' : '#060607';
      const M = this.M = {
        frame: material(frameType, col.frame),
        front: material('frontGlass', frontCol),
        chrome: material('chrome', '#e9eaec'),
        chamfer: material('chrome', col.chamfer || shade(col.frame, 0.35).getStyle(), d.matteChamfer ? { roughness: 0.35 } : null),
        dark: material('dark', '#0d0d0e'),
        darkGlass: new T.MeshPhysicalMaterial({ color: '#08090b', roughness: 0.1, metalness: 0.2, clearcoat: 1 }),
        ringDark: new T.MeshStandardMaterial({ color: '#141416', roughness: 0.35, metalness: 0.8 }),
        lensGlass: new T.MeshPhysicalMaterial({ color: '#06080c', roughness: 0.05, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.8, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 520] }),
        iris: new T.MeshPhysicalMaterial({ color: '#1b2238', roughness: 0.1, metalness: 0.6, clearcoat: 1 }),
        ringPolish: material('steel', shade(col.frame, -0.05).getStyle()),
        flash: new T.MeshStandardMaterial({ color: '#efe7cc', roughness: 0.3, metalness: 0, emissive: '#000000' }),
        orange: new T.MeshStandardMaterial({ color: '#ff6a00', roughness: 0.5 }),
        btn: material(frameType === 'chrome' ? 'chrome' : frameType, d.profile === 'pillow' ? '#d9d9db' : col.frame)
      };
      if (d.profile === 'pillow' && d.id === 'iphone') M.btn = material('plasticGloss', '#1a1a1a');
      const backType = col.jet ? 'jet' : (col.matte ? 'aluminumMatte' : d.backMat);
      const backMap = backTexture(d, col, W, H);
      M.back = material(backType, '#ffffff', { map: backMap });
      M.backSolid = material(backType, col.back);
      M.sweepBack = d.backMat === 'glass' || d.backMat === 'glassMatte' ? material(backType, col.back) : (d.profile === 'pillow' ? material(d.backMat, col.back) : M.frame);
      if (d.id === 'iphone') M.sweepBack = material('aluminum', col.back);
      this.disposables.push(backMap);
      Object.values(M).forEach(m => this.disposables.push(m));

      // 机身扫掠
      const keys = ['front', 'frame', 'back', 'chrome', 'chamfer'];
      const body = this.add(new T.Mesh(sweep(ol, P, keys), [M.front, M.frame, M.sweepBack, M.chrome, M.chamfer]));
      body.userData.part = 'body';
      // 2007 初代：底部黑色塑料延伸到侧面 —— 用一圈薄壳覆盖
      if (d.id === 'iphone') {
        const clip = new T.Mesh(sweep(ol, P.slice(4).map(p => Object.assign({}, p, { i: p.i - 0.03, crease: false, m: 'back' })), ['back']), new T.MeshPhysicalMaterial({ color: '#1b1b1d', roughness: 0.45, clippingPlanes: [new T.Plane(new T.Vector3(0, -1, 0), 0)] }));
        clip.userData.clipY = -H / 2 + 19;
        this.add(clip); this.clipMesh = clip;
      }

      // 前盖
      const fIn = P[0].i, bIn = P[P.length - 1].i;
      const fGeo = new T.ShapeGeometry(new T.Shape(inset(ol, fIn)));
      const front = this.add(new T.Mesh(fGeo, M.front)); front.position.z = d2;
      // 后盖
      const bGeo = new T.ShapeGeometry(new T.Shape(inset(ol, bIn)));
      planarUV(bGeo, W, H); bGeo.rotateY(Math.PI);
      const back = this.add(new T.Mesh(bGeo, M.back)); back.position.z = -d2;
      back.userData.part = 'body';

      // 屏幕
      const { sw, sh, mmPerPt } = displaySize(d);
      this.sw = sw; this.sh = sh; this.mmPerPt = mmPerPt;
      const sr = Math.max(0.01, d.display.r * mmPerPt);
      const sGeo = new T.ShapeGeometry(rrShape(sw, sh, sr), 12);
      planarUV(sGeo, sw, sh);
      this.screenMat = new T.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: null, roughness: 0.06, metalness: 0, toneMapped: false, envMapIntensity: 0.4 });
      this.screenMat.emissiveIntensity = 0;
      const screen = this.add(new T.Mesh(sGeo, this.screenMat));
      screen.position.set(0, d.display.y, d2 + 0.03);
      screen.userData.part = 'screen';
      this.screen = screen; this.parts.push(screen);
      this.disposables.push(this.screenMat);

      const sTop = d.display.y + sh / 2, sBot = d.display.y - sh / 2;
      const f = d.front || {};
      // 听筒、前摄
      if (f.ear) {
        const ey = (H / 2 + sTop) / 2 + (d.profile === 'pillow' ? 0.4 : 0);
        const e = this.add(new T.Mesh(new T.ShapeGeometry(rrShape(f.ear[0], f.ear[1], f.ear[1] / 2)), new T.MeshStandardMaterial({ color: col.front === 'white' ? '#5a5a5c' : '#1e1e20', roughness: 0.8 })));
        e.position.set(0, ey, d2 + 0.02);
        if (f.cam) {
          const c = this.add(new T.Mesh(new T.CircleGeometry(1.15, 32), M.darkGlass));
          c.position.set(f.cam.x, ey + f.cam.y, d2 + 0.02);
          const ring = this.add(new T.Mesh(new T.RingGeometry(1.15, 1.55, 32), new T.MeshStandardMaterial({ color: col.front === 'white' ? '#bdbdbd' : '#121214', roughness: 0.4 })));
          ring.position.copy(c.position);
        }
      }
      // 主屏幕按钮
      if (f.home) {
        const hy = (-H / 2 + sBot) / 2, r = f.homeD / 2;
        const hg = new T.CylinderGeometry(r, r, 0.3, 64); hg.rotateX(Math.PI / 2);
        const hm = f.home === 'square' ? new T.MeshPhysicalMaterial({ color: col.front === 'white' ? '#f2f2f2' : '#101011', roughness: 0.2, clearcoat: 1, map: null }) : new T.MeshPhysicalMaterial({ color: col.front === 'white' ? '#f2f2f2' : '#0c0c0d', roughness: 0.08, clearcoat: 1 });
        const home = this.add(new T.Mesh(hg, hm)); home.position.set(0, hy, d2 - 0.05);
        home.userData.part = 'home'; home.userData.press = { axis: new T.Vector3(0, 0, -1), depth: f.solidHome ? 0.04 : 0.35 };
        this.parts.push(home);
        const rim = this.add(new T.Mesh(new T.TorusGeometry(r + 0.05, 0.12, 8, 64), new T.MeshStandardMaterial({ color: col.front === 'white' ? '#cfcfcf' : '#000', roughness: 0.6 })));
        rim.position.set(0, hy, d2 - 0.02);
        if (f.home === 'square') {
          const ig = new T.CircleGeometry(r * 0.98, 48);
          const icon = new T.Mesh(ig, new T.MeshBasicMaterial({ map: homeSquareTex(), transparent: true, depthWrite: false }));
          icon.position.z = 0.16; home.add(icon); this.disposables.push(ig);
        } else {
          const tr = new T.Mesh(new T.TorusGeometry(r - 0.25, 0.22, 10, 72), material('steel', col.front === 'white' ? shade(col.frame, -0.05).getStyle() : '#55565a'));
          tr.position.z = 0.16; home.add(tr); this.disposables.push(tr.geometry);
        }
      }

      this.buildButtons(d, col, M, W, H, D, zBtn);
      this.buildPorts(d, M, W, H, D, zBtn);
      this.buildRear(d, col, M, W, H, D);
      if (d.bandGaps) {
        const gm = material('plasticGloss', '#18181a');
        for (const [edge, at] of d.bandGaps) {
          const vert = edge === 'left' || edge === 'right';
          const gb = this.add(new T.Mesh(new T.BoxGeometry(vert ? 0.6 : 0.9, vert ? 0.9 : 0.6, D - 1.6), gm));
          gb.position.set(vert ? (edge === 'left' ? -W / 2 : W / 2) : at, vert ? at : (edge === 'top' ? H / 2 : -H / 2), 0);
        }
      }
    }

    buildButtons(d, col, M, W, H, D, z) {
      const b = d.buttons, bt = Math.min(2.6, D * 0.33), prot = d.profile === 'flat' || d.profile === 'unibody' ? 0.55 : 0.6;
      const capsule = (len, thick, pr, along) => {
        const r = thick / 2, g = new T.CapsuleGeometry(r, Math.max(0.01, len - thick), 6, 20);
        g.scale(pr / r, 1, 1);
        if (along === 'x') g.rotateZ(Math.PI / 2);
        return g;
      };
      const mk = (geo, mat, part, pos, axis, depth) => {
        const m = this.add(new T.Mesh(geo, mat)); m.position.copy(pos);
        if (part) { m.userData.part = part; m.userData.press = { axis, depth }; this.parts.push(m); }
        return m;
      };
      const L = new T.Vector3(1, 0, 0), R = new T.Vector3(-1, 0, 0), DN = new T.Vector3(0, -1, 0);
      // 电源键
      if (b.power === 'top') {
        const maxX = W / 2 - d.corner - b.powerLen / 2 + 1;
        const px = Math.min(W / 2 - b.powerX, maxX);
        mk(capsule(b.powerLen, bt * 0.9, prot, 'x'), M.btn, 'power', new T.Vector3(px, H / 2, z), DN, 0.35);
      } else {
        mk(capsule(b.powerLen, bt, prot, 'y'), M.btn, 'power', new T.Vector3(W / 2, H / 2 - b.powerY, z), R, 0.35);
      }
      // 音量
      if (b.vol === 'top') {
        b.volX.forEach((vx, i) => mk(capsule(b.volLen, bt * 0.9, prot, 'x'), M.btn, i ? 'volDown' : 'volUp', new T.Vector3(W / 2 - vx, H / 2, z), DN, 0.3));
      } else if (b.vol === 'pill' || b.vol === 'rocker') {
        const len = b.vol === 'rocker' ? (b.volY[1] - b.volY[0]) : b.volLen;
        mk(capsule(len, bt, prot, 'y'), M.btn, 'volUp', new T.Vector3(-W / 2, H / 2 - b.volY[0] + (b.vol === 'rocker' ? -len / 2 + len / 2 - 0.1 : 0), z), L, 0.3);
        mk(capsule(len, bt, prot, 'y'), M.btn, 'volDown', new T.Vector3(-W / 2, H / 2 - b.volY[1] + (b.vol === 'rocker' ? 0.1 : 0), z), L, 0.3);
      } else {
        const r = b.vol === 'round2' ? 2.5 : 2.9;
        const g = () => { const c = new T.CylinderGeometry(r, r, prot * 2, 40); c.rotateZ(Math.PI / 2); return c; };
        mk(g(), M.btn, 'volUp', new T.Vector3(-W / 2, H / 2 - b.volY[0], z), L, 0.3);
        mk(g(), M.btn, 'volDown', new T.Vector3(-W / 2, H / 2 - b.volY[1], z), L, 0.3);
      }
      // 静音拨片 / 操作按钮
      if (b.mute === 'switch') {
        const slot = this.add(new T.Mesh(new T.BoxGeometry(0.5, 5.2, Math.min(2.6, D * 0.38)), M.dark));
        slot.position.set(-W / 2 - 0.05, H / 2 - b.muteY, z);
        const or = this.add(new T.Mesh(new T.BoxGeometry(0.55, 3.6, 0.5), M.orange));
        or.position.set(-W / 2 - 0.05, H / 2 - b.muteY, z + Math.min(2.6, D * 0.38) / 4);
        const nub = mk(capsule(3.6, Math.min(1.5, D * 0.18), 0.65, 'y'), M.btn, 'mute', new T.Vector3(-W / 2, H / 2 - b.muteY, z), L, 0);
        nub.userData.baseZ = z; nub.userData.travel = Math.min(2.6, D * 0.38) / 4;
        this.muteNub = nub; this.setMute(this.os.muted, true);
      } else if (b.mute === 'action') {
        mk(capsule(7, bt * 0.95, prot, 'y'), M.btn, 'action', new T.Vector3(-W / 2, H / 2 - b.muteY, z), L, 0.3);
      }
      // 相机控制
      if (b.camCtrl) {
        const cm = new T.MeshPhysicalMaterial({ color: shade(col.frame, -0.35), roughness: 0.08, metalness: 0.3, clearcoat: 1 });
        this.disposables.push(cm);
        const recess = this.add(new T.Mesh(capsule(19, bt * 0.95, 0.15, 'y'), M.ringPolish)); recess.position.set(W / 2 - 0.05, H / 2 - b.camCtrl, z);
        mk(capsule(18, bt * 0.82, 0.18, 'y'), cm, 'camCtrl', new T.Vector3(W / 2 + 0.02, H / 2 - b.camCtrl, z), R, 0.1);
      }
    }

    buildPorts(d, M, W, H, D, z) {
      const y0 = -H / 2;
      const hole = (x, r) => { const g = new T.CylinderGeometry(r, r, 0.6, 16); const m = this.add(new T.Mesh(g, M.dark)); m.position.set(x, y0 + 0.12, z); return m; };
      if (d.port === '30pin') {
        const s = this.add(new T.Mesh(new T.BoxGeometry(21, 0.5, Math.min(2.6, D * 0.25)), M.dark)); s.position.set(0, y0 + 0.1, z);
        if (d.profile === 'pillow') for (let i = 0; i < 7; i++) { hole(-17 + i * 0.9, 0.35); hole(12 + i * 0.9, 0.35); }
      } else {
        const t = d.port === 'usbc' ? [8.9, Math.min(3.1, D * 0.4)] : [7.8, Math.min(1.9, D * 0.27)];
        const g = new T.CapsuleGeometry(t[1] / 2, t[0] - t[1], 4, 20); g.rotateZ(Math.PI / 2); g.scale(1, 0.6 / t[1], 1);
        const m = this.add(new T.Mesh(g, M.dark)); m.position.set(0, y0 + 0.08, z);
        const n = d.speakerBoth || d.port === 'usbc' ? 6 : 6;
        for (let i = 0; i < n; i++) { hole(-9 - i * 2.1, 0.55); if (d.speakerBoth || i < 6) hole(9 + i * 2.1, 0.55); }
      }
      if (d.jack === 'top' || d.jack === 'top-recessed') {
        const g = new T.CylinderGeometry(1.8, 1.8, 0.6, 32); const m = this.add(new T.Mesh(g, M.dark)); m.position.set(-W / 2 + 11.5, H / 2 - 0.12, z);
      } else if (d.jack === 'bottom') {
        const g = new T.CylinderGeometry(1.8, 1.8, 0.6, 32); const m = this.add(new T.Mesh(g, M.dark)); m.position.set(-W / 2 + 10.5, y0 + 0.12, z);
      }
    }

    buildRear(d, col, M, W, H, D) {
      const r = d.rear || {}, d2 = D / 2;
      const P = (bx, by) => [W / 2 - bx, H / 2 - by];
      let moduleZ = -d2, moduleMat = M.backSolid;
      const bumpMesh = (shape, depth, mat, x, y) => {
        const bt = Math.min(0.5, depth * 0.42);
        const g = new T.ExtrudeGeometry(shape, { depth: Math.max(0.05, depth - bt), bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 5, curveSegments: 24 });
        g.rotateY(Math.PI);
        const m = this.add(new T.Mesh(g, mat)); m.position.set(x, y, -d2 + 0.02);
        return -d2 - depth - bt + 0.02 + bt;
      };
      const sq = r.square, pill = r.pill, pl = r.plateau, ap = r.airPlateau;
      if (sq) { const [x, y] = P(sq.x, sq.y); moduleZ = bumpMesh(rrShape(sq.s - 1, sq.s - 1, sq.r), sq.bump, d.back.matte ? material('glass', col.back) : material('glassMatte', col.back), x, y); }
      if (pill) { const [x, y] = P(pill.x, pill.y); moduleZ = bumpMesh(rrShape(pill.w - 1, pill.h - 1, (pill.w - 1) / 2), pill.bump, material('glass', col.back), x, y); }
      if (pl) {
        const w = W - 3.8, y = H / 2 - pl.y0 - pl.h / 2;
        moduleZ = bumpMesh(rrShape(w - 1, pl.h - 1, d.corner - 2.6, 6.5), pl.bump, M.frame, 0, y);
      }
      if (ap) {
        const w = W - 2 * ap.x0, y = H / 2 - ap.y0 - ap.h / 2;
        moduleZ = bumpMesh(rrShape(w - 1, ap.h - 1, (ap.h - 1) / 2), ap.bump, material('glass', col.back), 0, y);
      }
      const hasModule = !!(sq || pill || pl || ap);
      for (const L of r.lenses || []) {
        const [x, y] = P(L.x, L.y);
        this.lens(L, x, y, hasModule ? moduleZ : -d2, M);
      }
      this.flashMeshes = [];
      for (const F of r.flash || []) {
        const [x, y] = P(F.x, F.y);
        const z = hasModule ? moduleZ : -d2;
        let g;
        if (F.w) { g = new T.CapsuleGeometry(F.w / 2, F.h - F.w, 4, 20); g.scale(1, 1, 0.25 / (F.w / 2)); }
        else { g = new T.CylinderGeometry(F.d / 2, F.d / 2, 0.25, 32); g.rotateX(Math.PI / 2); }
        const m = this.add(new T.Mesh(g, M.flash)); m.position.set(x, y, z - 0.08);
        const ringR = (F.w ? F.w : F.d) / 2 + 0.35;
        if (!F.w) { const rg = new T.TorusGeometry(ringR - 0.15, 0.18, 8, 40); const rm = this.add(new T.Mesh(rg, M.ringPolish)); rm.position.set(x, y, z - 0.05); }
        this.flashMeshes.push(m);
      }
      if (r.lidar) {
        const [x, y] = P(r.lidar.x, r.lidar.y);
        const g = new T.CylinderGeometry(r.lidar.d / 2, r.lidar.d / 2, 0.3, 32); g.rotateX(Math.PI / 2);
        const m = this.add(new T.Mesh(g, M.darkGlass)); m.position.set(x, y, moduleZ - 0.1);
      }
      for (const mic of r.mic || []) {
        const [x, y] = P(mic.x, mic.y);
        const g = new T.CylinderGeometry(0.45, 0.45, 0.2, 16); g.rotateX(Math.PI / 2);
        const m = this.add(new T.Mesh(g, M.dark)); m.position.set(x, y, (hasModule && !r.lenses.some(l => l.ring) ? moduleZ : -d2) - 0.06);
      }
    }

    lens(L, x, y, surf, M) {
      const grp = new T.Group(); grp.position.set(x, y, surf); this.root.add(grp);
      const cyl = (rad, h, mat, z) => { const g = new T.CylinderGeometry(rad, rad, h, 56); g.rotateX(Math.PI / 2); const m = new T.Mesh(g, mat); m.position.z = z; grp.add(m); this.disposables.push(g); return m; };
      const d = L.d;
      if (L.flush) {
        cyl(d / 2, 0.14, M.ringDark, -0.04); cyl(d / 2 * 0.72, 0.16, M.lensGlass, -0.06); cyl(d * 0.14, 0.17, M.iris, -0.07);
      } else if (L.ring) {
        const h = L.bump;
        const ringMat = L.bodyRing ? M.frame : M.ringPolish;
        cyl(L.ring / 2, h, ringMat, -h / 2);
        cyl(d / 2, 0.14, M.ringDark, -h - 0.02); cyl(d / 2 * 0.78, 0.16, M.lensGlass, -h - 0.04); cyl(d * 0.15, 0.17, M.iris, -h - 0.05);
      } else if (L.deep) {
        const h = 1.1;
        cyl(d / 2, h, M.ringPolish, -h / 2);
        cyl(d / 2 * 0.88, 0.14, M.ringDark, -h - 0.02); cyl(d / 2 * 0.68, 0.22, M.lensGlass, -h - 0.05); cyl(d * 0.14, 0.24, M.iris, -h - 0.07);
      } else {
        const h = 0.65;
        cyl(d / 2, h, M.ringPolish, -h / 2);
        cyl(d / 2 * 0.86, 0.12, M.ringDark, -h - 0.02); cyl(d / 2 * 0.66, 0.16, M.lensGlass, -h - 0.04); cyl(d * 0.14, 0.17, M.iris, -h - 0.05);
      }
    }

    // ---------- 交互 ----------
    press(part) {
      const m = this.parts.find(p => p.userData.part === part);
      if (!m || !m.userData.press) return;
      if (!m.userData.base) m.userData.base = m.position.clone();
      this.pressAnims.push({ m, t0: performance.now() });
    }
    setMute(muted, instant) {
      if (!this.muteNub) return;
      const n = this.muteNub;
      n.userData.target = n.userData.baseZ + (muted ? -n.userData.travel : n.userData.travel);
      if (instant) n.position.z = n.userData.target;
    }
    setFlash(on) {
      this.M.flash.emissive.set(on ? '#fff6dc' : '#000000');
      this.M.flash.emissiveIntensity = on ? 3 : 0;
    }
    isActiveScreen(obj) { return obj === this.screen; }
    viewDims() { return [this.data.dims[0], this.data.dims[1]]; }
    stepPress(now) {
      this.pressAnims = this.pressAnims.filter(a => {
        const t = (now - a.t0) / 220, p = a.m.userData.press;
        const k = t < 0.35 ? t / 0.35 : Math.max(0, 1 - (t - 0.35) / 0.65);
        a.m.position.copy(a.m.userData.base).addScaledVector(p.axis, p.depth * k);
        if (t >= 1) { a.m.position.copy(a.m.userData.base); return false; }
        return true;
      });
    }
    update(now) {
      // 按键动画
      this.pressAnims = this.pressAnims.filter(a => {
        const t = (now - a.t0) / 220, p = a.m.userData.press;
        const k = t < 0.35 ? t / 0.35 : Math.max(0, 1 - (t - 0.35) / 0.65);
        a.m.position.copy(a.m.userData.base).addScaledVector(p.axis, p.depth * k);
        if (t >= 1) { a.m.position.copy(a.m.userData.base); return false; }
        return true;
      });
      if (this.muteNub && this.muteNub.userData.target !== undefined) this.muteNub.position.z += (this.muteNub.userData.target - this.muteNub.position.z) * 0.25;
      // 屏幕亮度
      const target = this.os.brightness();
      this.screenMat.emissiveIntensity += (target - this.screenMat.emissiveIntensity) * 0.2;
      // 熄屏时卸下贴图，节省显存
      const want = target > 0 || this.screenMat.emissiveIntensity > 0.005 ? this.os.texture : null;
      if (this.screenMat.emissiveMap !== want) { this.screenMat.emissiveMap = want; this.screenMat.needsUpdate = true; }
      if (this.clipMesh) {
        // 初代：底部黑色塑料（世界坐标裁剪平面跟随机身）
        const pl = this.clipMesh.material.clippingPlanes[0];
        const nrm = new T.Vector3(0, -1, 0).applyQuaternion(this.group.getWorldQuaternion(new T.Quaternion()));
        const pt = new T.Vector3(0, this.clipMesh.userData.clipY, 0); this.root.localToWorld(pt);
        pl.setFromNormalAndCoplanarPoint(nrm, pt);
      }
    }
    dispose() {
      this.disposables.forEach(x => x.dispose && x.dispose());
      if (this.group.parent) this.group.parent.remove(this.group);
    }
  }

  // ---------- 折叠屏（iPhone Duo） ----------
  // 展开时两半并排、内屏朝 +z；左半绕铰链轴（x=0, z=t/2+δ）旋转 180° 合上，外屏在左半背面。
  class FoldPhoneModel extends PhoneModel {
    build() {
      const d = this.data, f = d.fold, col = d.colors[this.colorIdx];
      const H = d.dims[0], t = f.t, hw = f.hw, g = f.gap, dl = f.delta;
      const xc = g + hw / 2, zp = t / 2 + dl;
      this.H = H; this.W = hw; this.D = t; this.xc = xc; this.zp = zp;
      const M = this.M = {
        frame: material(d.frameMat, col.frame),
        front: material('frontGlass', '#060607'),
        chrome: material('chrome', '#e9eaec'), chamfer: material('chrome', '#e9eaec'),
        dark: material('dark', '#0d0d0e'),
        darkGlass: new T.MeshPhysicalMaterial({ color: '#08090b', roughness: 0.1, metalness: 0.2, clearcoat: 1 }),
        ringDark: new T.MeshStandardMaterial({ color: '#141416', roughness: 0.35, metalness: 0.8 }),
        lensGlass: new T.MeshPhysicalMaterial({ color: '#06080c', roughness: 0.05, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.8, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 520] }),
        iris: new T.MeshPhysicalMaterial({ color: '#1b2238', roughness: 0.1, metalness: 0.6, clearcoat: 1 }),
        ringPolish: material('steel', shade(col.frame, -0.05).getStyle()),
        flash: new T.MeshStandardMaterial({ color: '#efe7cc', roughness: 0.3, metalness: 0, emissive: '#000000' }),
        btn: material(d.frameMat, col.frame),
        backSolid: material(d.backMat, col.back)
      };
      const backMap = backTexture(d, col, hw, H);
      M.back = material(d.backMat, '#ffffff', { map: backMap });
      this.disposables.push(backMap);
      Object.values(M).forEach(m => this.disposables.push(m));

      const { P } = makeProfile({ profile: 'flat', flat: { polish: true } }, t);
      const R = d.corner, rh = f.hingeR;
      const half = (outer, backMat) => {
        const grp = new T.Group();
        const ol = outline(hw, H, outer === 'R' ? [R, rh, rh, R] : [rh, R, R, rh], d.exp, 18);
        const sw = new T.Mesh(sweep(ol, P, ['front', 'frame', 'back', 'chrome', 'chamfer']), [M.front, M.frame, backMat === M.back ? M.backSolid : M.front, M.chrome, M.chamfer]);
        sw.userData.part = 'body'; grp.add(sw); this.disposables.push(sw.geometry);
        const fc = new T.Mesh(new T.ShapeGeometry(new T.Shape(inset(ol, P[0].i))), M.front); fc.position.z = t / 2; grp.add(fc); this.disposables.push(fc.geometry);
        const bg = new T.ShapeGeometry(new T.Shape(inset(ol, P[P.length - 1].i))); planarUV(bg, hw, H); bg.rotateY(Math.PI);
        const bc = new T.Mesh(bg, backMat); bc.position.z = -t / 2; bc.userData.part = 'body'; grp.add(bc); this.disposables.push(bg);
        return grp;
      };
      // 固定的右半：背面是相机高原
      const right = half('R', M.back); right.position.x = xc; this.root.add(right);
      // 可翻转的左半：背面是外屏
      const pivot = new T.Group(); pivot.position.z = zp; this.root.add(pivot); this.pivot = pivot;
      const left = half('L', M.front); left.position.set(-xc, 0, -zp); pivot.add(left);
      // 铰链：压扁的半圆柱，合上时成为左侧圆润的书脊；两端按铰链侧圆角收成圆顶，避免方角凸出
      const hr = t + dl, L2 = H / 2 - 0.15, prof = [];
      for (let i = 0; i <= 16; i++) {
        const a = i / 16 * Math.PI / 2;
        prof.push(new T.Vector2(hr * Math.sin(a), -L2 + rh * (1 - Math.cos(a))));
      }
      for (let i = 16; i >= 0; i--) {
        const a = i / 16 * Math.PI / 2;
        prof.push(new T.Vector2(hr * Math.sin(a), L2 - rh * (1 - Math.cos(a))));
      }
      const hg = new T.LatheGeometry(prof, 48, Math.PI - 1.35, 2.7);
      const hinge = new T.Mesh(hg, M.frame); hinge.scale.x = f.spine / hr; hinge.position.z = zp; this.root.add(hinge); this.hinge = hinge; this.disposables.push(hg);

      // 内屏（左右两片，共用一张贴图；各片本地坐标 = 整块内屏坐标）
      // 屏幕圆角与机身圆角同心：半径 = 机身圆角 − 边框宽度
      const ids = displaySize({ display: f.inner }), ir = Math.max(1, R - (2 * (hw + g) - ids.sw) / 2);
      this.inner = { sw: ids.sw, sh: ids.sh };
      this.innerMat = this.screenMaterial();
      const mkPiece = (x0, x1, rs, parent, px, pz) => {
        const geo = new T.ShapeGeometry(rrShape4(x1 - x0, ids.sh, rs, (x0 + x1) / 2), 12); planarUV(geo, ids.sw, ids.sh);
        const m = new T.Mesh(geo, this.innerMat); m.position.set(px, 0, pz); m.userData.part = 'screen';
        parent.add(m); this.parts.push(m); this.disposables.push(geo); return m;
      };
      this.innerR = mkPiece(0.05, ids.sw / 2, [ir, 0.01, 0.01, ir], right, -xc, t / 2 + 0.03);
      this.innerL = mkPiece(-ids.sw / 2, -0.05, [0.01, ir, ir, 0.01], left, xc, t / 2 + 0.03);
      // 外屏：左半背面，网格旋转 180° 使其本地坐标从外侧看是正向
      const ods = displaySize({ display: f.outer }), ob = Math.min(hw - ods.sw, H - ods.sh) / 2;
      const or = Math.max(1, R - ob), orh = Math.max(0.6, rh - ob);
      this.outer = { sw: ods.sw, sh: ods.sh };
      this.outerMat = this.screenMaterial();
      // 网格旋转 180° 后本地右侧 = 机身外侧（大圆角），左侧 = 铰链侧（小圆角）
      const og = new T.ShapeGeometry(rrShape4(ods.sw, ods.sh, [or, orh, orh, or]), 12); planarUV(og, ods.sw, ods.sh);
      const os = new T.Mesh(og, this.outerMat); os.rotation.y = Math.PI; os.position.set(0, 0, -t / 2 - 0.03); os.userData.part = 'screen';
      left.add(os); this.outerScreen = os; this.parts.push(os); this.disposables.push(og);

      // 右半的按键、接口、相机：临时把 root 指向右半
      const realRoot = this.root; this.root = right;
      const dd = Object.assign({}, d, { rear: f.rear, corner: R });
      this.buildButtons(dd, col, M, hw, H, t, 0);
      this.buildPorts(dd, M, hw, H, t, 0);
      this.buildRear(dd, col, M, hw, H, t);
      this.root = realRoot;

      this.fold = this.foldTarget = this.os.disp === 'inner' ? 0 : 1;
      this.applyFold();
    }
    screenMaterial() {
      const m = new T.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: null, roughness: 0.06, metalness: 0, toneMapped: false, envMapIntensity: 0.4 });
      m.emissiveIntensity = 0; this.disposables.push(m); return m;
    }
    get folded() { return this.fold > 0.999; }
    get unfolded() { return this.fold < 0.001; }
    get screen() { return this.unfolded ? this.innerR : this.outerScreen; }
    set screen(v) { }
    get sw() { return this.unfolded ? this.inner.sw : this.outer.sw; }
    set sw(v) { }
    get sh() { return this.unfolded ? this.inner.sh : this.outer.sh; }
    set sh(v) { }
    isActiveScreen(obj) { return this.unfolded ? (obj === this.innerL || obj === this.innerR) : (this.folded && obj === this.outerScreen); }
    viewDims() { return this.foldTarget > 0.5 ? [this.data.dims[0], this.data.dims[1]] : [this.data.fold.open[0], this.data.fold.open[1]]; }
    toggleFold() {
      this.foldTarget = this.foldTarget > 0.5 ? 0 : 1;
      this.foldT0 = performance.now(); this.foldFrom = this.fold;
      this.os.foldMoving = true;
    }
    applyFold() {
      const e = this.fold < 0.5 ? 2 * this.fold * this.fold : 1 - Math.pow(-2 * this.fold + 2, 2) / 2;
      this.pivot.rotation.y = Math.PI * e;
      this.hinge.rotation.y = Math.PI / 2 * e;
      this.root.position.set(-this.xc * e * 0.01, 0, -this.zp * e * 0.01);
    }
    update(now) {
      this.stepPress(now);
      if (this.foldT0 !== undefined) {
        const k = Math.min(1, (now - this.foldT0) / 1100);
        this.fold = this.foldFrom + (this.foldTarget - this.foldFrom) * k;
        this.applyFold();
        if (k >= 1) {
          this.foldT0 = undefined; this.fold = this.foldTarget; this.applyFold();
          this.os.foldMoving = false;
          this.os.setDisplay(this.foldTarget > 0.5 ? 'outer' : 'inner');
          this.onFoldDone && this.onFoldDone(this.foldTarget > 0.5);
        }
      }
      const b = this.os.foldMoving ? 0 : this.os.brightness();
      const set = (mat, on) => {
        const tg = on ? b : 0;
        // 开合时非当前屏幕立即熄灭；其余情况平滑过渡
        mat.emissiveIntensity = on ? mat.emissiveIntensity + (tg - mat.emissiveIntensity) * 0.2 : 0;
        const want = tg > 0 || mat.emissiveIntensity > 0.005 ? this.os.texture : null;
        if (mat.emissiveMap !== want) { mat.emissiveMap = want; mat.needsUpdate = true; }
      };
      set(this.innerMat, this.unfolded && this.os.disp === 'inner');
      set(this.outerMat, this.folded && this.os.disp === 'outer');
    }
  }

  window.createPhoneModel = (d, ci, os) => d.fold ? new FoldPhoneModel(d, ci, os) : new PhoneModel(d, ci, os);
  window.PhoneModel = PhoneModel;
  window.displaySize = displaySize;
})();

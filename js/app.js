/* iPhone 博物馆 —— 场景、交互与界面 */
(function () {
  const T = THREE;
  T.ColorManagement.legacyMode = false;
  const PH = window.PHONES;
  const $ = s => document.querySelector(s);
  document.getElementById('logoPath').setAttribute('d', window.APPLE_PATH);

  // ---------- 渲染器 ----------
  const stage = $('#stage');
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  stage.prepend(renderer.domElement);

  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new T.RoomEnvironment(), 0.04).texture;
  const camera = new T.PerspectiveCamera(30, 1, 0.05, 200);
  camera.position.set(0, 0.15, 4.2);
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 0.8; controls.maxDistance = 9;
  controls.autoRotateSpeed = 1.2;

  const key = new T.DirectionalLight(0xffffff, 1.1); key.position.set(2.5, 3, 4); scene.add(key);
  const rim = new T.DirectionalLight(0xc8dcff, 0.9); rim.position.set(-3, 1.5, -3.5); scene.add(rim);
  scene.add(new T.HemisphereLight(0xffffff, 0x202024, 0.25));

  // 展台
  function radialTex(stops) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }
  const focusRoot = new T.Group(); scene.add(focusRoot);
  const pedestal = new T.Group(); focusRoot.add(pedestal);
  const ped = new T.Mesh(new T.CylinderGeometry(0.62, 0.66, 0.06, 96), new T.MeshStandardMaterial({ color: '#0d0d0f', roughness: 0.75, metalness: 0.1, envMapIntensity: 0.12 }));
  pedestal.add(ped);
  const pedRing = new T.Mesh(new T.TorusGeometry(0.64, 0.004, 8, 128), new T.MeshBasicMaterial({ color: '#e8c88a' }));
  pedRing.rotation.x = Math.PI / 2; pedRing.position.y = 0.031; pedestal.add(pedRing);
  const shadow = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ map: radialTex([[0, 'rgba(0,0,0,0.7)'], [0.45, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.032; pedestal.add(shadow);
  const holder = new T.Group(); focusRoot.add(holder);

  const lineupRoot = new T.Group(); lineupRoot.visible = false; scene.add(lineupRoot);
  const floor = new T.Mesh(new T.PlaneGeometry(60, 12), new T.MeshBasicMaterial({ map: radialTex([[0, 'rgba(60,60,70,0.55)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.002; lineupRoot.add(floor);

  // ---------- 展品缓存 ----------
  const cache = {};
  let cur = null, curIdx = 0, mode = 'focus';
  function entry(i) {
    const d = PH[i];
    let e = cache[d.id];
    if (!e) {
      const os = new PhoneOS(d);
      e = cache[d.id] = { d, i, os, colorIdx: 0, model: null };
      os.colorFrontWhite = d.colors[0].front === 'white';
      os.onFlash = on => e.model && e.model.setFlash(on);
      os.onMute = m => { e.model && e.model.setMute(m); if (e === cur) updateControls(); };
      os.onChange = () => { if (e === cur) updateControls(); };
    }
    if (!e.model) e.model = createPhoneModel(d, e.colorIdx, e.os);
    e.model.onFoldDone = folded => { if (e === cur && mode === 'focus') { fitView(folded ? 'three' : 'front'); updateControls(); toast(folded ? '已合上：使用 5.4 英寸外屏' : '已展开：7.6 英寸内屏'); } };
    return e;
  }
  function setColor(e, ci) {
    const parent = e.model.group.parent, pos = e.model.group.position.clone(), rot = e.model.group.rotation.clone();
    e.model.dispose();
    e.colorIdx = ci;
    e.os.colorFrontWhite = e.d.colors[ci].front === 'white';
    e.os.setAccent(e.d.colors[ci].back);
    const onFold = e.model.onFoldDone;
    e.model = createPhoneModel(e.d, ci, e.os);
    e.model.onFoldDone = onFold;
    e.model.setFlash(e.os.flashlight);
    e.model.group.position.copy(pos); e.model.group.rotation.copy(rot);
    if (parent) parent.add(e.model.group);
  }

  // ---------- 选择展品 ----------
  let intro = null;
  function select(i, opts = {}) {
    curIdx = (i + PH.length) % PH.length;
    const e = entry(curIdx);
    if (cur && cur !== e && cur.model.group.parent === holder) holder.remove(cur.model.group);
    cur = e;
    holder.add(e.model.group);
    e.model.group.position.set(0, 0, 0);
    e.model.group.rotation.set(0, 0, 0);
    const h = e.d.dims[0] * 0.01;
    pedestal.position.y = -h / 2 - 0.12;
    intro = { t0: performance.now(), from: opts.noAnim ? 0 : -Math.PI * 0.9 };
    renderTimeline(); renderInfo(); updateControls();
    if (!opts.keepView) fitView('three', !opts.noAnim);
    const loc = e.d.buttons.power === 'top' ? '顶部右侧的睡眠/唤醒键' : '右侧的侧边按钮';
    if (e.d.fold) toast('点「展开 / 合上」开合 iPhone Duo，点侧边按钮开机');
    else if (!e.os.isOn()) toast(`点击机身${loc}，或下方「电源键」开机`);
  }

  // ---------- 视角 ----------
  let camTween = null;
  function viewDist() {
    const [hm, wm] = cur.model.viewDims(), h = hm * 0.01, w = wm * 0.01;
    const aspect = camera.aspect, tanV = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
    const byH = (h / 0.56) / 2 / tanV, byW = (w * 1.6 / 0.8) / 2 / (tanV * aspect);
    return Math.max(byH, byW);
  }
  function fitView(v, anim = true) {
    const D = viewDist();
    const dirs = { front: [0, 0.02, 1], back: [0, 0.02, -1], side: [1, 0.02, 0.0001], three: [0.45, 0.14, 0.88], bottom: [0.0001, -0.92, 0.4] };
    const dv = new T.Vector3(...dirs[v]).normalize().multiplyScalar(v === 'bottom' ? D * 0.55 : D);
    const to = dv;
    document.querySelectorAll('#views [data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    const tgt = new T.Vector3(0, -cur.d.dims[0] * 0.01 * 0.1, 0);
    to.add(tgt);
    if (!anim) { camera.position.copy(to); controls.target.copy(tgt); return; }
    camTween = { t0: performance.now(), from: camera.position.clone().sub(controls.target), to: to.clone().sub(tgt), fromT: controls.target.clone(), toT: tgt };
    idleT = performance.now();
  }
  function stepCam(now) {
    if (!camTween) return;
    const k = Math.min(1, (now - camTween.t0) / 800), e = 1 - Math.pow(1 - k, 3);
    // 球面插值，绕开穿过机身
    const a = camTween.from.clone(), b = camTween.to.clone();
    const la = a.length(), lb = b.length();
    const dir = a.normalize().lerp(b.normalize(), e);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
    controls.target.lerpVectors(camTween.fromT, camTween.toT, e);
    camera.position.copy(dir.normalize().multiplyScalar(la + (lb - la) * e)).add(controls.target);
    if (k >= 1) camTween = null;
  }

  // ---------- 全家福 ----------
  let lineupX = 0, lineupTarget = 0, lineupMin = 0, lineupMax = 0, lineupFlip = false, lineupItems = [];
  const labelsEl = $('#labels');
  function enterLineup() {
    mode = 'lineup'; document.body.classList.add('lineup'); $('#tip').classList.remove('show');
    focusRoot.visible = false; lineupRoot.visible = true;
    controls.enabled = false;
    labelsEl.innerHTML = '';
    let x = 0; lineupItems = [];
    PH.forEach((d, i) => {
      const e = entry(i), w = e.model.viewDims()[1] * 0.01;
      x += w / 2;
      lineupRoot.add(e.model.group);
      e.model.group.position.set(x, d.dims[0] * 0.01 / 2, 0);
      e.model.group.rotation.set(0, lineupFlip ? Math.PI : 0, 0);
      const el = document.createElement('div'); el.className = 'lbl';
      el.innerHTML = `<b>${d.name}</b><span>${d.year} · ${d.dims[0]} mm</span>`;
      labelsEl.appendChild(el);
      lineupItems.push({ e, x, el });
      x += w / 2 + 0.24;
    });
    lineupMin = lineupItems[0].x; lineupMax = lineupItems[lineupItems.length - 1].x;
    lineupTarget = lineupX = lineupItems[curIdx].x;
    camera.position.set(lineupX, 0.85, 5.4); controls.target.set(lineupX, 0.75, 0);
    syncRange();
  }
  function exitLineup(i) {
    mode = 'focus'; document.body.classList.remove('lineup');
    lineupRoot.visible = false; focusRoot.visible = true; controls.enabled = true;
    labelsEl.innerHTML = '';
    lineupItems.forEach(it => lineupRoot.remove(it.e.model.group));
    cur = null;
    select(i);
  }
  function syncRange() { $('#lineupRange').value = Math.round((lineupTarget - lineupMin) / (lineupMax - lineupMin) * 1000); }
  $('#lineupRange').addEventListener('input', ev => { lineupTarget = lineupMin + (lineupMax - lineupMin) * ev.target.value / 1000; });
  $('#flipAll').addEventListener('click', () => { lineupFlip = !lineupFlip; $('#flipAll').textContent = lineupFlip ? '翻转到正面' : '翻转到背面'; lineupItems.forEach(it => it.flipT = performance.now()); });

  // ---------- 指针交互 ----------
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const cvs = renderer.domElement;
  function setRay(ev) {
    const r = cvs.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  }
  function partOf(obj) { while (obj) { if (obj.userData && obj.userData.part) return obj; obj = obj.parent; } return null; }
  function screenPt(model, useRay) {
    const s = model.screen; s.updateMatrixWorld();
    const inv = s.matrixWorld.clone().invert();
    const lr = useRay.clone().applyMatrix4(inv);
    if (Math.abs(lr.direction.z) < 1e-6) return null;
    const t = -lr.origin.z / lr.direction.z; const p = lr.origin.clone().addScaledVector(lr.direction, t);
    const u = (p.x + model.sw / 2) / model.sw, v = (p.y + model.sh / 2) / model.sh;
    return { x: u * model.os.W, y: (1 - v) * model.os.H };
  }
  const NAMES = { power: '电源键（单击开机/锁屏，长按关机）', home: '主屏幕按钮', volUp: '音量 +', volDown: '音量 −', mute: '响铃/静音拨片', action: '操作按钮', camCtrl: '相机控制', screen: '屏幕' };
  let drag = null, powerTimer = null, longFired = false, idleT = performance.now(), downPos = null;

  cvs.addEventListener('pointerdown', ev => {
    idleT = performance.now(); downPos = { x: ev.clientX, y: ev.clientY };
    if (mode !== 'focus') { drag = { type: 'lineup', x: ev.clientX, start: lineupTarget }; cvs.setPointerCapture(ev.pointerId); return; }
    setRay(ev);
    const hit = ray.intersectObject(cur.model.group, true)[0];
    const p = hit && partOf(hit.object);
    const part = p && p.userData.part;
    if (!part || part === 'body') return;
    if (part === 'screen') {
      const os = cur.os;
      if (!cur.model.isActiveScreen(p)) return;
      if (os.state === 'sleep' && !os.hasHome) { os.go('lock'); controls.enabled = false; drag = { type: 'none' }; return; }
      if (!os.isOn()) return;
      controls.enabled = false; cvs.setPointerCapture(ev.pointerId);
      const pt = screenPt(cur.model, ray.ray); drag = { type: 'screen', last: pt };
      os.pointer('down', pt.x, pt.y);
      return;
    }
    controls.enabled = false; cvs.setPointerCapture(ev.pointerId);
    drag = { type: 'button', part };
    if (part === 'power') powerDown(); else pressPart(part);
  }, { capture: true });

  cvs.addEventListener('pointermove', ev => {
    if (drag && drag.type === 'screen') {
      setRay(ev); const pt = screenPt(cur.model, ray.ray); if (pt) { drag.last = pt; cur.os.pointer('move', pt.x, pt.y); }
      return;
    }
    if (drag && drag.type === 'lineup') {
      lineupTarget = T.MathUtils.clamp(drag.start - (ev.clientX - drag.x) * 0.004, lineupMin, lineupMax); syncRange(); return;
    }
    if (drag) return;
    hover(ev);
  });
  window.addEventListener('pointerup', ev => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.type === 'screen' && d.last) cur.os.pointer('up', d.last.x, d.last.y);
    if (d.type === 'button' && d.part === 'power') powerUp();
    if (d.type === 'lineup') {
      if (downPos && Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y) < 5) {
        setRay(ev);
        const hit = ray.intersectObjects(lineupItems.map(it => it.e.model.group), true)[0];
        if (hit) { const it = lineupItems.find(it => isChild(hit.object, it.e.model.group)); if (it) exitLineup(it.e.i); }
      }
    }
    if (mode === 'focus') controls.enabled = true;
  });
  function isChild(o, g) { while (o) { if (o === g) return true; o = o.parent; } return false; }

  let hoverItem = null;
  function hover(ev) {
    setRay(ev);
    const tip = $('#tip');
    if (mode === 'lineup') {
      const hit = ray.intersectObjects(lineupItems.map(it => it.e.model.group), true)[0];
      const it = hit && lineupItems.find(it => isChild(hit.object, it.e.model.group));
      if (hoverItem && hoverItem !== it) hoverItem.el.classList.remove('hover');
      hoverItem = it || null; if (it) it.el.classList.add('hover');
      cvs.style.cursor = it ? 'pointer' : 'grab';
      return;
    }
    const hit = ray.intersectObject(cur.model.group, true)[0];
    const p = hit && partOf(hit.object), part = p && p.userData.part;
    const show = part && part !== 'body' && (part !== 'screen' || (cur.os.isOn() && cur.model.isActiveScreen(p)));
    cvs.style.cursor = show ? 'pointer' : 'grab';
    if (show) {
      const r = stage.getBoundingClientRect();
      tip.textContent = part === 'screen' ? '屏幕：点按 / 滑动' : NAMES[part];
      tip.style.left = (ev.clientX - r.left + 14) + 'px'; tip.style.top = (ev.clientY - r.top + 12) + 'px';
      tip.classList.add('show');
    } else tip.classList.remove('show');
  }

  cvs.addEventListener('wheel', ev => {
    if (mode !== 'lineup') return;
    ev.preventDefault();
    lineupTarget = T.MathUtils.clamp(lineupTarget + (ev.deltaY + ev.deltaX) * 0.003, lineupMin, lineupMax); syncRange();
  }, { passive: false });

  // ---------- 按键动作 ----------
  function powerDown() {
    cur.model.press('power'); longFired = false;
    clearTimeout(powerTimer);
    powerTimer = setTimeout(() => { longFired = true; if (cur.os.isOn()) { cur.os.powerLong(); toast('滑动滑块即可关机'); } }, 850);
  }
  function powerUp() {
    clearTimeout(powerTimer);
    if (!longFired) {
      const was = cur.os.state;
      cur.os.powerShort();
      if (was === 'off') toast(`正在启动 ${cur.d.os}…`);
    }
  }
  function pressPart(part) {
    const os = cur.os, m = cur.model;
    idleT = performance.now();
    switch (part) {
      case 'home': m.press('home'); os.home(); if (os.state === 'lock' && os.touchID && os.osv < 10) toast('iOS 7–9：向右滑动屏幕解锁'); break;
      case 'volUp': m.press('volUp'); os.volume(1); break;
      case 'volDown': m.press('volDown'); os.volume(-1); break;
      case 'mute': os.toggleMute(); toast(os.muted ? '静音模式：开（拨片露出橙色）' : '响铃模式'); break;
      case 'action': m.press('action'); os.action(); if (!os.isOn()) toast('先开机再试试操作按钮'); break;
      case 'camCtrl': m.press('camCtrl'); os.cameraControl(); if (!os.isOn()) toast('先开机再按相机控制'); break;
    }
    updateControls();
  }

  // HTML 控制条
  const bPower = $('#bPower');
  bPower.addEventListener('pointerdown', ev => { bPower.setPointerCapture(ev.pointerId); bPower.classList.add('down'); powerDown(); });
  bPower.addEventListener('pointerup', () => { bPower.classList.remove('down'); powerUp(); });
  $('#bHome').addEventListener('click', () => { if (cur.os.hasHome) pressPart('home'); else { cur.os.goHome(); } updateControls(); });
  $('#bVolUp').addEventListener('click', () => pressPart('volUp'));
  $('#bVolDown').addEventListener('click', () => pressPart('volDown'));
  $('#bMute').addEventListener('click', () => pressPart(cur.d.buttons.mute === 'action' ? 'action' : 'mute'));
  $('#bCam').addEventListener('click', () => pressPart('camCtrl'));
  function toggleFold() { if (cur.model.toggleFold && cur.model.foldT0 === undefined) { cur.model.toggleFold(); updateControls(); } }
  $('#bFold').addEventListener('click', toggleFold);
  $('#bUnlock').addEventListener('click', () => { const os = cur.os; if (!os.isOn() && os.state !== 'sleep') return toast('请先开机'); if (os.touchID && os.state === 'lock') cur.model.press('home'); os.quickUnlock(); });

  const STATE_TXT = { off: '已关机', boot: '正在开机…', lock: '锁定屏幕', home: '主屏幕', app: 'App', sleep: '已锁屏（息屏）', powermenu: '关机菜单', shutdown: '正在关机…' };
  function updateControls() {
    if (!cur) return;
    const os = cur.os, d = cur.d;
    $('#stateText').textContent = os.state === 'app' ? '正在使用「' + ({ calc: '计算器', camera: '相机', clock: '时钟', photos: '照片', settings: '设置', notes: '备忘录', weather: '天气', messages: '信息', phone: '电话', music: '音乐', ipod: 'iPod', safari: 'Safari', maps: '地图' }[os.app] || 'App') + '」' : (STATE_TXT[os.state] || os.state);
    $('#stateDot').classList.toggle('on', os.state !== 'off');
    $('#bPowerLabel').textContent = d.buttons.power === 'top' ? '睡眠/唤醒' : '侧边按钮';
    const hb = $('#bHome'); hb.querySelector('b').textContent = os.hasHome ? '◯' : '⌃'; hb.querySelector('span').textContent = os.hasHome ? '主屏幕' : '上滑回主屏';
    const isAction = d.buttons.mute === 'action';
    $('#bMute').querySelector('b').textContent = isAction ? '◖' : (os.muted ? '🔕' : '🔔');
    $('#bMuteLabel').textContent = isAction ? '操作按钮' : (os.muted ? '静音中' : '响铃/静音');
    $('#bCam').hidden = !d.buttons.camCtrl;
    const fb = $('#bFold'); fb.hidden = !d.fold;
    if (d.fold) { const closing = cur.model.foldTarget < 0.5; fb.querySelector('b').textContent = closing ? '▯' : '▭'; fb.querySelector('span').textContent = closing ? '合上' : '展开'; }
    $('#bMute').hidden = !d.buttons.mute;
  }

  // ---------- 界面 ----------
  function renderTimeline() {
    const el = $('#timeline');
    if (!el.dataset.built) {
      let html = '', lastY = 0;
      PH.forEach((d, i) => {
        if (d.year !== lastY) { html += `<div class="tl-year">${d.year}</div>`; lastY = d.year; }
        const c = d.colors[0];
        html += `<button class="tl-item" data-i="${i}"><span class="sil" style="background:${c.frame}"></span><span><div class="nm">${d.name}</div><div class="sub">${d.date.slice(0, 7).replace('-', '年')}月</div></span></button>`;
      });
      el.innerHTML = html; el.dataset.built = 1;
      el.addEventListener('click', ev => { const b = ev.target.closest('.tl-item'); if (!b) return; const i = +b.dataset.i; if (mode === 'lineup') exitLineup(i); else if (i !== curIdx) select(i); });
    }
    el.querySelectorAll('.tl-item').forEach(b => b.classList.toggle('on', +b.dataset.i === curIdx));
    const on = el.querySelector('.tl-item.on'); on && on.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  function sizeSVG(d) {
    const ref = PH[0], k = 1.55, pad = 14;
    const items = [[ref, '初代 iPhone'], [d, d.name]];
    const maxH = Math.max(...items.map(([p]) => p.dims[0]));
    const totalW = items.reduce((s, [p]) => s + p.dims[1], 0) * k + pad * 3 + 30;
    let x = pad, out = '';
    items.forEach(([p, nm], i) => {
      const [h, w] = p.dims, y = (maxH - h) * k + 6;
      const c = i === 1 ? d.colors[cur.colorIdx].frame : '#555';
      out += `<rect x="${x}" y="${y}" width="${w * k}" height="${h * k}" rx="${p.corner * k}" fill="${i ? 'rgba(232,200,138,0.08)' : 'none'}" stroke="${i ? '#e8c88a' : '#666'}" stroke-dasharray="${i ? '0' : '4 3'}"/>`;
      out += `<rect x="${x + w * k * 0.08}" y="${y + h * k * 0.05}" width="${w * k * 0.84}" height="${h * k * 0.9}" rx="${p.corner * k * 0.7}" fill="${c}" opacity="0.18"/>`;
      out += `<text x="${x + w * k / 2}" y="${(maxH) * k + 22}" fill="#9a9aa2" font-size="11" text-anchor="middle">${nm}</text>`;
      out += `<text x="${x + w * k / 2}" y="${y + h * k / 2}" fill="#d0d0d6" font-size="10" text-anchor="middle">${h}×${w}</text>`;
      x += w * k + pad + 30;
    });
    return `<svg viewBox="0 0 ${totalW} ${maxH * k + 30}">${out}</svg>`;
  }

  function renderInfo() {
    const d = cur.d, el = $('#info'), ci = cur.colorIdx;
    const [h, w, dp] = d.dims;
    const rows = [
      ['上市日期', d.date.replace(/-/g, ' / ')], ['首发系统', d.os], ['屏幕', `${d.display.inch} 英寸 ${d.display.tech}`], ['分辨率', `${d.display.res} 像素，${d.display.ppi} ppi`],
      ['芯片', d.chip], ['运行内存', d.ram], ['存储容量', d.storage], ['后置相机', d.camera], ['前置相机', d.frontCamera],
      ['尺寸', `${h} × ${w} × ${dp} mm`], ['重量', `${d.weight} g`], ['材质', d.material], ['接口', d.connector], ['网络', d.network], ['首发价格', d.price]
    ];
    if (d.specOverride) rows.forEach(r => { if (d.specOverride[r[0]]) r[1] = d.specOverride[r[0]]; });
    const prev = PH[curIdx - 1], next = PH[curIdx + 1];
    el.innerHTML = `
      <div class="i-year">${d.year} · 第 ${curIdx + 1} 号展品</div>
      <h2>${d.nick || d.name}</h2>
      <p class="tagline">${d.tagline}</p>
      <div class="colors">${d.colors.map((c, i) => `<button class="sw ${i === ci ? 'on' : ''}" data-ci="${i}" title="${c.name}" style="background:linear-gradient(135deg, ${c.back} 55%, ${c.frame} 56%)"></button>`).join('')}</div>
      <div class="cname">${d.colors[ci].name}${d.colors.length > 1 ? ` · 共 ${d.colors.length} 种配色` : ''}</div>
      <div class="intro">${d.intro.map(p => `<p>${p}</p>`).join('')}</div>
      <ul class="hl">${d.highlights.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="sec">技术规格</div>
      <table class="specs">${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>
      <div class="sec">实物尺寸对比（等比例）</div>
      <div class="sizecmp">${sizeSVG(d)}<p>${d.name} 比初代 iPhone ${h >= 115 ? '高 ' + (h - 115).toFixed(1) + ' mm' : ''}，${dp < 11.6 ? '薄 ' + (11.6 - dp).toFixed(2) + ' mm' : '厚 ' + (dp - 11.6).toFixed(2) + ' mm'}</p></div>
      <div class="nav2">
        <button ${prev ? '' : 'disabled'} data-go="${curIdx - 1}"><small>← 上一件</small>${prev ? prev.name : '—'}</button>
        <button ${next ? '' : 'disabled'} data-go="${curIdx + 1}"><small>下一件 →</small>${next ? next.name : '—'}</button>
      </div>
      <p class="src">建模依据：Apple 官方技术规格、Wikipedia、GSMArena、dimensions.com 等公开资料中的机身尺寸、按键与镜头布局；模型在浏览器中按 1:1 毫米比例程序化生成。</p>`;
    el.classList.remove('fade'); void el.offsetWidth; el.classList.add('fade');
    el.scrollTop = 0;
  }
  $('#info').addEventListener('click', ev => {
    const sw = ev.target.closest('.sw');
    if (sw) {
      const ci = +sw.dataset.ci; if (ci === cur.colorIdx) return;
      setColor(cur, ci);
      document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.ci === ci));
      document.querySelector('.cname').textContent = cur.d.colors[ci].name + (cur.d.colors.length > 1 ? ` · 共 ${cur.d.colors.length} 种配色` : '');
      document.querySelector('.sizecmp svg').outerHTML = sizeSVG(cur.d);
      return;
    }
    const go = ev.target.closest('[data-go]'); if (go && !go.disabled) select(+go.dataset.go);
  });

  let toastT = 0;
  function toast(s) { const el = $('#toast'); el.textContent = s; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3200); }

  document.querySelectorAll('.modes [data-mode]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.modes [data-mode]').forEach(x => x.classList.toggle('on', x === b));
    if (b.dataset.mode === 'lineup' && mode !== 'lineup') { if (cur) holder.remove(cur.model.group); enterLineup(); }
    if (b.dataset.mode === 'focus' && mode !== 'focus') exitLineup(curIdx);
  }));
  document.querySelectorAll('#views [data-view]').forEach(b => b.addEventListener('click', () => fitView(b.dataset.view)));
  let autoRotate = true;
  $('#autoRot').addEventListener('click', () => { autoRotate = !autoRotate; $('#autoRot').classList.toggle('on', autoRotate); });
  $('#helpBtn').addEventListener('click', () => $('#help').hidden = false);
  $('#helpClose').addEventListener('click', () => $('#help').hidden = true);
  $('#help').addEventListener('click', ev => { if (ev.target.id === 'help') $('#help').hidden = true; });

  window.addEventListener('keydown', ev => {
    if (ev.target.tagName === 'INPUT') return;
    if (mode === 'lineup') {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { lineupTarget = T.MathUtils.clamp(lineupTarget + (ev.key === 'ArrowRight' ? 0.9 : -0.9), lineupMin, lineupMax); syncRange(); }
      return;
    }
    if (ev.key === 'ArrowRight') select(curIdx + 1);
    if (ev.key === 'ArrowLeft') select(curIdx - 1);
    if (ev.key === 'p' || ev.key === 'P') { if (!ev.repeat) powerDown(); }
    if (ev.key === 'f' || ev.key === 'F') toggleFold();
    if (ev.key === 'h' || ev.key === 'H') { if (cur.os.hasHome) pressPart('home'); else cur.os.goHome(); }
  });
  window.addEventListener('keyup', ev => { if (mode === 'focus' && (ev.key === 'p' || ev.key === 'P')) powerUp(); });

  // ---------- 尺寸与循环 ----------
  function resize() {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(stage);
  resize();

  const tmpV = new T.Vector3();
  function loop(now) {
    requestAnimationFrame(loop);
    if (mode === 'focus' && cur) {
      stepCam(now);
      const g = cur.model.group;
      if (intro) {
        const k = Math.min(1, (now - intro.t0) / 900), e = 1 - Math.pow(1 - k, 3);
        g.rotation.y = intro.from * (1 - e);
        g.position.y = 0.25 * (1 - e) + Math.sin(now / 1400) * 0.012 * e;
        if (k >= 1) intro = null;
      } else g.position.y = Math.sin(now / 1400) * 0.012;
      controls.autoRotate = autoRotate && !drag && !camTween && now - idleT > 6000 && !cur.os.isOn();
      cur.os.tick(now); cur.model.update(now);
      controls.update();
    } else if (mode === 'lineup') {
      lineupX += (lineupTarget - lineupX) * 0.12;
      camera.position.set(lineupX, 1.0, 9.2); camera.lookAt(lineupX, 0.74, 0);
      const r = stage.getBoundingClientRect();
      for (const it of lineupItems) {
        const g = it.e.model.group;
        const target = lineupFlip ? Math.PI : 0;
        g.rotation.y += (target - g.rotation.y) * 0.1;
        it.e.os.tick(now); it.e.model.update(now);
        tmpV.set(it.x, it.e.d.dims[0] * 0.01 + 0.02, 0).project(camera);
        const vis = tmpV.x > -1.2 && tmpV.x < 1.2;
        it.el.style.display = vis ? '' : 'none';
        if (vis) { it.el.style.left = ((tmpV.x + 1) / 2 * r.width) + 'px'; it.el.style.top = ((1 - tmpV.y) / 2 * r.height) + 'px'; }
      }
    }
    renderer.render(scene, camera);
  }

  window.museum = { get current() { return cur; }, select, fitView }; window.__cam = camera;
  select(0, { noAnim: false });
  requestAnimationFrame(loop);
  setTimeout(() => { $('#loading').style.opacity = 0; }, 300);
})();

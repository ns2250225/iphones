/*
 * 屏幕操作系统模拟：开机、锁屏、主屏幕、App、关机等。
 * 绘制坐标单位为 pt（与真实 iOS 逻辑分辨率一致），画布为 2 倍像素。
 */
(function () {
  const S = 2;
  const FONT = '-apple-system, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif';
  const F = (w, s) => `${w} ${s}px ${FONT}`;
  const rr = (g, x, y, w, h, r) => window.rrPath(g, x, y, w, h, r);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  const NAMES = {
    messages: '信息', calendar: '日历', photos: '照片', camera: '相机', youtube: 'YouTube', stocks: '股市', maps: '地图', weather: '天气',
    clock: '时钟', calc: '计算器', notes: '备忘录', settings: '设置', phone: '电话', mail: '邮件', safari: 'Safari', music: '音乐', ipod: 'iPod',
    itunes: 'iTunes Store', appstore: 'App Store', reminders: '提醒事项', health: '健康', wallet: '钱包', contacts: '通讯录', facetime: 'FaceTime',
    files: '文件', tv: '视频', gamecenter: 'Game Center', compass: '指南针'
  };
  function appLists(osv, modern) {
    if (osv <= 1) return { grid: ['messages', 'calendar', 'photos', 'camera', 'youtube', 'stocks', 'maps', 'weather', 'clock', 'calc', 'notes', 'settings'], dock: ['phone', 'mail', 'safari', 'ipod'] };
    if (osv <= 3) return { grid: ['messages', 'calendar', 'photos', 'camera', 'youtube', 'stocks', 'maps', 'weather', 'clock', 'calc', 'notes', 'settings', 'itunes', 'appstore', 'compass', 'contacts'], dock: ['phone', 'mail', 'safari', 'ipod'] };
    if (osv <= 6) return { grid: ['messages', 'calendar', 'photos', 'camera', 'youtube', 'stocks', 'maps', 'weather', 'notes', 'clock', 'calc', 'settings', 'itunes', 'appstore', 'gamecenter', 'facetime', 'reminders', 'contacts', 'compass', 'tv'], dock: ['phone', 'mail', 'safari', 'music'] };
    if (!modern) return { grid: ['messages', 'calendar', 'photos', 'camera', 'weather', 'clock', 'maps', 'tv', 'notes', 'reminders', 'stocks', 'gamecenter', 'itunes', 'appstore', 'health', 'wallet', 'settings', 'calc', 'compass', 'contacts', 'facetime', 'files', 'mail', 'youtube'], dock: ['phone', 'mail', 'safari', 'music'] };
    return { grid: ['facetime', 'calendar', 'photos', 'camera', 'mail', 'clock', 'maps', 'weather', 'reminders', 'notes', 'stocks', 'tv', 'appstore', 'health', 'wallet', 'settings', 'calc', 'files', 'compass', 'contacts', 'itunes', 'gamecenter'], dock: ['phone', 'safari', 'messages', 'music'] };
  }

  class PhoneOS {
    constructor(d) {
      this.d = d;
      this.osv = d.osv;
      this.skeuo = d.osv < 7;
      this.hasHome = !!(d.front && d.front.home);
      this.touchID = !!d.touchID;
      this.notch = d.display.notch || null;
      this.glass = d.osv >= 26;
      this.sideTouchID = !!d.sideTouchID;
      this.disp = 'outer';
      this.applyDisplay(d.fold ? d.fold.outer : d.display);
      this.modern = !this.hasHome;
      this.lockStyle = this.skeuo ? 'slider' : (this.osv < 10 ? 'swipe' : (this.hasHome ? 'press' : 'faceid'));
      this.cv = document.createElement('canvas');
      this.cv.width = this.cv.height = 2;
      this.g = this.cv.getContext('2d');
      this.texture = new THREE.CanvasTexture(this.cv);
      this.texture.encoding = THREE.sRGBEncoding; this.texture.anisotropy = 8;
      this.state = 'off'; this.t0 = 0; this.t = 0;
      this.muted = false; this.vol = 0.5; this.hud = null; this.flashlight = false;
      this.drag = null; this.knob = 0; this.lockDX = 0; this.lockDY = 0;
      this.apps = appLists(this.osv, this.modern);
      this.calc = { disp: '0', acc: null, op: null, fresh: true };
      this.photos = []; this.dial = ''; this.playing = true; this.musicT = 0;
      this.lastDraw = -1; this.dirtyOff = true;
      this.accent = d.colors[0].back;
      this.layout();
      this.onFlash = null; this.onMute = null; this.onChange = null;
    }

    applyDisplay(c) {
      [this.W, this.H] = c.pts;
      this.island = c.island || null;
      this.hole = !!c.hole;
      this.cols = c.cols || 4;
      this.iconS = c.iconS || 0;
      this.aod = !!this.island;
      this.isl = this.island ? { w: this.island[0], h: this.island[1], tw: this.island[0], th: this.island[1], mode: null, until: 0 } : null;
    }
    // 折叠屏：切换到内屏 / 外屏，保留系统状态
    setDisplay(name) {
      if (!this.d.fold || this.disp === name) return;
      this.disp = name;
      this.applyDisplay(this.d.fold[name]);
      this.layout(); this.wallLock = null; this.dirtyOff = true; this.lastDraw = -1;
      if (this.state === 'app') this.appAnim = null;
      if (this.state === 'home') this.homeIntro = this.t;
    }

    // ---------- 公共接口 ----------
    isOn() { return !['off', 'sleep', 'shutdown'].includes(this.state); }
    brightness() {
      if (this.state === 'off') return 0;
      if (this.state === 'sleep') return this.aod ? 0.32 : 0;
      return 1;
    }
    setAccent(hex) { this.accent = hex; this.wallLock = null; }
    ensure() {
      // 首次点亮时才分配画布与壁纸，节省内存
      if (this.cv.width !== this.W * S) { this.cv.width = this.W * S; this.cv.height = this.H * S; this.texture.dispose(); }
      if (!this.wallLock) this.makeWallpaper();
    }
    emit() { this.onChange && this.onChange(this.state); }
    go(state) { this.state = state; this.t0 = this.t; this.drag = null; this.emit(); }

    powerShort() {
      if (this.state === 'off') return this.go('boot');
      if (this.state === 'boot' || this.state === 'shutdown') return;
      if (this.state === 'sleep') { this.go('lock'); this.lockDX = this.lockDY = this.knob = 0; if (this.sideTouchID) this.pendingUnlock = this.t + 0.6; return; }
      if (this.state === 'powermenu') return this.go(this.prev || 'lock');
      this.closeAppNow();
      this.go('sleep');
    }
    powerLong() {
      if (!this.isOn() || this.state === 'boot' || this.state === 'powermenu') return;
      this.prev = this.state === 'app' ? 'app' : this.state;
      this.pmKnob = 0;
      this.go('powermenu');
    }
    home() {
      if (this.state === 'sleep') { this.go('lock'); return; }
      if (!this.hasHome) return;
      if (this.state === 'lock') {
        if (this.touchID && this.osv >= 10) return this.unlock();
        if (this.touchID) { this.hint = this.t; return; }
        return;
      }
      if (this.state === 'app') return this.closeApp();
      if (this.state === 'powermenu') return this.go(this.prev);
    }
    goHome() {
      if (this.state === 'app') return this.closeApp();
      if (this.state === 'lock') return this.unlock();
      if (this.state === 'sleep') return this.go('lock');
    }
    quickUnlock() { if (this.state === 'sleep') this.go('lock'); if (this.state === 'lock') this.unlock(); }
    volume(dir) {
      if (!this.isOn() && this.state !== 'sleep') return;
      this.vol = clamp(this.vol + dir / 16, 0, 1);
      this.hud = { type: 'vol', t0: this.t };
    }
    toggleMute() {
      this.muted = !this.muted;
      this.onMute && this.onMute(this.muted);
      if (!this.isOn()) return;
      this.hud = { type: 'mute', t0: this.t };
      if (this.isl) this.islandShow('mute', 1.8);
    }
    action() {
      if (!this.isOn()) return;
      this.toggleMute();
    }
    cameraControl() {
      if (this.state === 'sleep') this.go('lock');
      if (!this.isOn() || this.state === 'boot' || this.state === 'powermenu') return;
      if (this.state === 'app' && this.app === 'camera') return this.shutter();
      this.openApp('camera', null, this.state === 'lock' ? 'lock' : 'home');
    }
    setFlashlight(on) { this.flashlight = on; this.onFlash && this.onFlash(on); if (this.isl && on) this.islandShow('flash', 1.4); }

    unlock() {
      if (this.isl) this.islandShow('unlock', 0.9);
      this.lockDX = this.lockDY = this.knob = 0;
      this.go('home'); this.homeIntro = this.t;
    }
    openApp(key, rect, back) {
      this.app = key; this.appBack = back || 'home';
      const W = this.W, H = this.H;
      this.appRect = rect || { x: W / 2 - 30, y: H / 2 - 30, w: 60, h: 60 };
      this.appAnim = { dir: 1, t0: this.t };
      if (key === 'camera') this.camT = this.t;
      this.go('app');
    }
    closeApp() {
      if (this.state !== 'app' || (this.appAnim && this.appAnim.dir < 0)) return;
      this.appAnim = { dir: -1, t0: this.t };
    }
    closeAppNow() { if (this.state === 'app') { this.state = this.appBack; this.appAnim = null; } }
    islandShow(mode, dur) {
      if (this.hole) return;
      const [iw, ih] = this.island;
      const sizes = { unlock: [iw + 36, ih], mute: [Math.min(this.W - 60, 230), ih + 4], flash: [iw + 70, ih], vol: [iw + 90, ih] };
      this.isl.mode = mode; this.isl.until = this.t + dur; this.isl.modeT = this.t;
      [this.isl.tw, this.isl.th] = sizes[mode] || [iw, ih];
    }

    // ---------- 指针 ----------
    pointer(type, x, y) {
      const W = this.W, H = this.H;
      if (type === 'down') {
        this.ptr = { x0: x, y0: y, x, y, t0: this.t };
        const st = this.state;
        if (st === 'lock') {
          if (this.lockStyle === 'slider') {
            const k = this.knobRect();
            this.drag = (x >= k.x - 6 && x <= k.x + k.w + 6 && y >= k.y - 10 && y <= k.y + k.h + 10) ? 'knob' : null;
          } else if (this.lockStyle === 'swipe') this.drag = 'swipeR';
          else if (this.lockStyle === 'faceid') this.drag = 'swipeUp';
          else this.drag = 'tapLock';
        } else if (st === 'powermenu') {
          const k = this.pmKnobRect();
          this.drag = (x >= k.x - 8 && x <= k.x + k.w + 8 && y >= k.y - 8 && y <= k.y + k.h + 8) ? 'pm' : 'pmTap';
        } else if (st === 'app') {
          this.drag = (!this.hasHome && y > H - 40) ? 'homeBar' : 'appTap';
        } else if (st === 'home') {
          this.drag = (!this.hasHome && y > H - 30) ? 'homeBar' : 'homeTap';
        } else this.drag = null;
        return;
      }
      if (!this.ptr) return;
      const dx = x - this.ptr.x0, dy = y - this.ptr.y0;
      if (type === 'move') {
        this.ptr.x = x; this.ptr.y = y;
        if (this.drag === 'knob') this.knob = clamp(dx / this.knobMax(), 0, 1);
        if (this.drag === 'swipeR') this.lockDX = Math.max(0, dx);
        if (this.drag === 'swipeUp' && this.ptr.y0 > H * 0.25) this.lockDY = Math.min(0, dy);
        if (this.drag === 'pm') this.pmKnob = clamp(dx / (this.W - 40 - 64), 0, 1);
        if (this.drag === 'homeBar' && this.state === 'app') this.appPull = Math.min(0, dy);
        return;
      }
      if (type === 'up') {
        const tap = Math.hypot(dx, dy) < 9;
        const d = this.drag; this.drag = null; this.ptr = null;
        if (d === 'knob') { if (this.knob > 0.92) this.unlock(); else this.knobBack = this.t; }
        else if (d === 'swipeR') { if (this.lockDX > W * 0.35) this.unlock(); else this.lockDX = 0; if (tap) this.hint = this.t; }
        else if (d === 'swipeUp') {
          if (this.lockDY < -H * 0.12) return this.unlock();
          this.lockDY = 0;
          if (tap) this.lockTap(x, y);
        }
        else if (d === 'tapLock') { this.hint = this.t; }
        else if (d === 'pm') { if (this.pmKnob > 0.92) this.go('shutdown'); else this.pmKnob = 0; }
        else if (d === 'pmTap') { const c = this.pmCancelRect(); if (tap && y >= c.y && y <= c.y + c.h && x >= c.x && x <= c.x + c.w) this.go(this.prev); }
        else if (d === 'homeBar') { if (this.state === 'app' && dy < -40) this.closeApp(); this.appPull = 0; }
        else if (d === 'homeTap' && tap) this.homeTap(x, y);
        else if (d === 'appTap' && tap) this.appTap(x, y);
      }
    }
    lockTap(x, y) {
      const b = this.lockButtons();
      if (b) {
        if (Math.hypot(x - b.fx, y - b.y) < 26) return this.setFlashlight(!this.flashlight);
        if (Math.hypot(x - b.cx, y - b.y) < 26) return this.openApp('camera', { x: b.cx - 25, y: b.y - 25, w: 50, h: 50 }, 'lock');
      }
      this.hint = this.t;
    }

    // ---------- 布局 ----------
    layout() {
      const W = this.W, H = this.H, L = {};
      L.statusH = this.skeuo || this.hasHome ? 20 : (this.island ? 54 : (this.notch ? 44 : 34));
      const cols = this.cols;
      L.s = this.iconS || (this.skeuo ? 57 : (W <= 320 ? 60 : Math.round(W * 0.157)));
      L.gap = (W - cols * L.s) / (cols + 1);
      L.top = L.statusH + (this.skeuo ? 9 : 22);
      L.rowH = this.skeuo || this.hasHome ? 88 : Math.round(L.s * 1.58);
      L.dockH = this.skeuo ? 92 : (this.hasHome ? 96 : 92);
      L.dockTop = H - L.dockH - (this.modern ? 12 : 0);
      L.rows = Math.min(6, Math.floor((L.dockTop - 24 - L.top) / L.rowH));
      L.icons = [];
      const grid = this.apps.grid.slice(0, L.rows * cols);
      grid.forEach((k, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        L.icons.push({ k, x: L.gap + c * (L.s + L.gap), y: L.top + r * L.rowH, s: L.s, label: true });
      });
      const dg = cols > 4 ? L.s * 0.45 : L.gap, dw = 4 * L.s + 3 * dg;
      L.dockX = cols > 4 ? (W - dw) / 2 - dg : 10; L.dockW = cols > 4 ? dw + 2 * dg : W - 20;
      this.apps.dock.forEach((k, i) => {
        const y = L.dockTop + (L.dockH - L.s) / 2 - (this.modern ? 0 : 8);
        L.icons.push({ k, x: (cols > 4 ? (W - dw) / 2 : L.gap) + i * (L.s + dg), y, s: L.s, label: !this.modern, dock: true });
      });
      this.L = L;
    }
    knobMax() { return this.W - 40 - 8 - this.knobRect().w; }
    knobRect() { const H = this.H; return { x: 24 + this.knob * (this.W - 40 - 8 - 76), y: H - 66, w: 76, h: 40 }; }
    pmKnobRect() { const top = this.skeuo ? 30 : (this.modern ? 70 : 60); return { x: 24 + this.pmKnob * (this.W - 40 - 64), y: top + 4, w: 56, h: 56 }; }
    pmCancelRect() { const W = this.W, H = this.H; return this.skeuo ? { x: 20, y: H - 70, w: W - 40, h: 46 } : { x: W / 2 - 34, y: H - 120, w: 68, h: 68 }; }
    lockButtons() { if (this.lockStyle !== 'faceid') return null; return { fx: 52, cx: this.W - 52, y: this.H - 88 }; }

    // ---------- 壁纸 ----------
    makeWallpaper() {
      const W = this.W, H = this.H;
      const mk = () => { const c = document.createElement('canvas'); c.width = W * S; c.height = H * S; const g = c.getContext('2d'); g.scale(S, S); return [c, g]; };
      const [c, g] = mk();
      const ac = new THREE.Color(this.accent); const hsl = {}; ac.getHSL(hsl);
      const hue = Math.round(hsl.h * 360);
      const blob = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
      if (this.osv <= 3) {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#02060f'); gr.addColorStop(1, '#0b1f3a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // 地球
        const R = W * 0.9, cx = W * 0.5, cy = H * 1.02;
        const eg = g.createRadialGradient(cx - R * 0.2, cy - R * 0.6, R * 0.1, cx, cy, R);
        eg.addColorStop(0, '#5aa6e8'); eg.addColorStop(0.55, '#1f5fa8'); eg.addColorStop(1, '#06162c');
        g.fillStyle = eg; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 0.5; g.fillStyle = '#4c8d3e';
        for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(cx - R * 0.6 + i * 26, cy - R * 0.72 + Math.sin(i) * 18, 22 + (i % 3) * 8, 10, i, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 0.6; g.strokeStyle = '#8fc6ff'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R + 1, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.globalAlpha = 1;
        for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`; g.fillRect(Math.random() * W, Math.random() * H * 0.6, 0.8, 0.8); }
        this.wallLock = c;
        const [c2, g2] = mk(); g2.fillStyle = '#000'; g2.fillRect(0, 0, W, H); this.wallHome = c2;
        return;
      }
      if (this.osv <= 6) {
        const gr = g.createLinearGradient(0, 0, W * 0.3, H); gr.addColorStop(0, '#0a3a6b'); gr.addColorStop(0.5, '#1b74b8'); gr.addColorStop(1, '#0b2c52'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        for (let i = 0; i < 60; i++) {
          const x = rnd() * W, y = rnd() * H, r = 3 + rnd() * 16;
          const dg = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
          dg.addColorStop(0, 'rgba(255,255,255,0.75)'); dg.addColorStop(0.4, 'rgba(160,210,255,0.25)'); dg.addColorStop(1, 'rgba(0,30,60,0.35)');
          g.fillStyle = dg; g.beginPath(); g.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2); g.fill();
        }
        this.wallLock = this.wallHome = c; return;
      }
      if (this.hasHome) {
        const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1d6fd8'); gr.addColorStop(0.5, '#6a4fd0'); gr.addColorStop(1, '#e45a8c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        blob(W * 0.2, H * 0.25, W * 0.8, 'rgba(80,220,255,0.55)'); blob(W * 0.9, H * 0.7, W * 0.9, 'rgba(255,140,80,0.45)'); blob(W * 0.4, H * 0.9, W * 0.7, 'rgba(120,60,200,0.5)');
        this.wallLock = this.wallHome = c; return;
      }
      if (!this.glass) {
        g.fillStyle = `hsl(${hue},45%,10%)`; g.fillRect(0, 0, W, H);
        blob(W * 0.15, H * 0.2, W * 1.0, `hsla(${hue},85%,55%,0.85)`);
        blob(W * 0.95, H * 0.45, W * 0.9, `hsla(${(hue + 50) % 360},85%,55%,0.7)`);
        blob(W * 0.3, H * 0.85, W * 1.1, `hsla(${(hue + 300) % 360},80%,45%,0.8)`);
        this.wallLock = this.wallHome = c; return;
      }
      // 液态玻璃
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `hsl(${hue},70%,62%)`); gr.addColorStop(1, `hsl(${(hue + 330) % 360},65%,30%)`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) {
        g.save(); g.globalAlpha = 0.35; g.fillStyle = `hsl(${(hue + i * 25) % 360},90%,${70 - i * 8}%)`;
        g.beginPath(); g.moveTo(0, H * (0.35 + i * 0.12));
        for (let x = 0; x <= W; x += 10) g.lineTo(x, H * (0.35 + i * 0.12) + Math.sin(x / W * Math.PI * 2 + i) * 40);
        g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill(); g.restore();
      }
      blob(W * 0.8, H * 0.15, W * 0.7, 'rgba(255,255,255,0.35)');
      this.wallLock = this.wallHome = c;
    }

    // ---------- 主循环 ----------
    tick(nowMs) {
      this.t = nowMs / 1000;
      const st = this.state;
      if (this.pendingUnlock && this.t > this.pendingUnlock) { this.pendingUnlock = 0; if (this.state === 'lock') this.unlock(); }
      if (st === 'boot' && this.t - this.t0 > 3.6) { this.go('lock'); this.lockDX = this.lockDY = this.knob = 0; }
      if (st === 'shutdown' && this.t - this.t0 > 1.8) { this.go('off'); this.flashlight && this.setFlashlight(false); }
      if (st === 'app' && this.appAnim && this.appAnim.dir < 0 && this.t - this.appAnim.t0 > 0.32) { this.appAnim = null; this.state = this.appBack; this.t0 = this.t; this.emit(); }
      if (this.knobBack !== undefined && this.drag !== 'knob') { this.knob *= 0.8; if (this.knob < 0.01) { this.knob = 0; this.knobBack = undefined; } }
      if (this.lockStyle !== 'slider' && !this.drag) { this.lockDX *= 0.75; this.lockDY *= 0.75; }
      if (this.isl) {
        if (this.isl.mode && this.t > this.isl.until) { this.isl.mode = null; [this.isl.tw, this.isl.th] = this.island; }
        this.isl.w += (this.isl.tw - this.isl.w) * 0.22; this.isl.h += (this.isl.th - this.isl.h) * 0.22;
      }
      // 关屏时只绘制一次
      const visible = this.brightness() > 0;
      if (!visible) {
        if (!this.dirtyOff) return false;
        this.dirtyOff = false;
        if (this.cv.width === 2) return false;
        const g = this.g; g.fillStyle = '#000'; g.fillRect(0, 0, this.cv.width, this.cv.height);
        this.texture.needsUpdate = true; return true;
      }
      this.dirtyOff = true;
      this.ensure();
      if (nowMs - this.lastDraw < 30) return false;
      this.lastDraw = nowMs;
      this.draw();
      this.texture.needsUpdate = true;
      return true;
    }

    draw() {
      const g = this.g, W = this.W, H = this.H, t = this.t;
      g.save(); g.setTransform(S, 0, 0, S, 0, 0);
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const st = this.state;
      if (st === 'boot') this.drawBoot(g);
      else if (st === 'shutdown') this.drawShutdown(g);
      else if (st === 'sleep') { this.drawLock(g, true); }
      else {
        const base = st === 'powermenu' ? this.prev : st;
        if (base === 'lock') this.drawLock(g);
        if (base === 'home' || base === 'app') {
          if (base === 'app' && this.appBack === 'lock') this.drawLock(g); else this.drawHome(g);
        }
        if (base === 'app') this.drawAppLayer(g);
        if (this.hud) this.drawHUD(g);
        if (st === 'powermenu') this.drawPowerMenu(g);
      }
      if (st !== 'boot' && st !== 'shutdown') this.drawCutout(g);
      g.restore();
    }

    // ---------- 组件 ----------
    timeStr() { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; }
    dateStr() { const d = new Date(); return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`; }

    drawBoot(g) {
      const W = this.W, H = this.H, e = this.t - this.t0;
      const white = this.osv >= 7 && this.colorFrontWhite;
      g.fillStyle = white ? '#fff' : '#000'; g.fillRect(0, 0, W, H);
      const a = clamp((e - 0.25) / 0.5, 0, 1) * clamp((3.5 - e) / 0.4, 0, 1);
      g.globalAlpha = a;
      window.drawApple(g, W / 2, H / 2 - 4, this.skeuo ? 80 : 74, white ? '#111' : '#f2f2f2');
      if (this.osv >= 7 && e > 1.2) {
        const p = clamp((e - 1.2) / 2.0, 0, 1);
        g.fillStyle = white ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'; rr(g, W / 2 - 70, H / 2 + 80, 140, 4, 2); g.fill();
        g.fillStyle = white ? '#111' : '#fff'; rr(g, W / 2 - 70, H / 2 + 80, 140 * p, 4, 2); g.fill();
      }
      g.globalAlpha = 1;
    }
    drawShutdown(g) {
      const W = this.W, H = this.H, e = this.t - this.t0;
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      g.globalAlpha = clamp(1 - (e - 1.2) / 0.5, 0, 1);
      this.spinner(g, W / 2, H / 2, 14, '#fff');
      g.globalAlpha = 1;
    }
    spinner(g, x, y, r, col) {
      const n = 12, k = Math.floor(this.t * 12) % n;
      g.save(); g.translate(x, y); g.lineCap = 'round'; g.lineWidth = r * 0.22;
      for (let i = 0; i < n; i++) {
        g.strokeStyle = col; g.globalAlpha *= 1; const a = ((i - k + n) % n) / n;
        g.save(); g.globalAlpha = 0.15 + 0.85 * (1 - a); g.rotate(i / n * Math.PI * 2); g.beginPath(); g.moveTo(0, -r * 0.55); g.lineTo(0, -r); g.stroke(); g.restore();
      }
      g.restore();
    }

    statusBar(g, color, ctx) {
      const W = this.W, t = this.timeStr();
      g.save(); g.fillStyle = color; g.strokeStyle = color;
      const battery = (x, y, w, h) => {
        g.lineWidth = 1; g.globalAlpha = 0.45; rr(g, x, y, w, h, h * 0.3); g.stroke(); g.globalAlpha = 1;
        rr(g, x + 1.6, y + 1.6, (w - 3.2) * 0.8, h - 3.2, h * 0.2); g.fill();
        g.globalAlpha = 0.45; rr(g, x + w + 1, y + h * 0.33, 1.6, h * 0.34, 0.8); g.fill(); g.globalAlpha = 1;
      };
      const wifi = (x, y, s) => {
        g.lineWidth = s * 0.16; g.lineCap = 'round';
        for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(x, y, s * i / 3, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }
        g.beginPath(); g.arc(x, y, s * 0.08, 0, 7); g.fill();
      };
      if (this.skeuo || this.hasHome) {
        if (this.skeuo) { g.fillStyle = ctx === 'lock' ? 'rgba(0,0,0,0.45)' : (ctx === 'app' ? '#0b0b0c' : '#000'); g.fillRect(0, 0, W, 20); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; }
        // 信号
        if (this.skeuo) for (let i = 0; i < 5; i++) g.fillRect(5 + i * 3.5, 14 - i * 1.8, 2.3, 2 + i * 1.8);
        else for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(8 + i * 6.5, 10, 2.6, 0, 7); g.fill(); }
        g.font = F(this.skeuo ? 600 : 400, 12); g.textBaseline = 'middle'; g.textAlign = 'left';
        const carrier = this.osv <= 2 ? 'AT&T' : (this.osv <= 6 ? '中国联通' : '中国移动');
        const cx = this.skeuo ? 25 : 42; g.fillText(carrier, cx, 10);
        wifi(cx + g.measureText(carrier).width + 12, 15, 9);
        g.textAlign = 'center'; g.font = F(600, 12);
        if (!(this.skeuo && ctx === 'lock')) g.fillText(t, W / 2, 10);
        else this.padlock(g, W / 2, 10, 5, false);
        if (!this.skeuo) { g.textAlign = 'right'; g.font = F(400, 12); g.fillText('80%', W - 34, 10); }
        battery(W - 30, 5, 24, 11);
      } else {
        const y = this.island ? this.island[2] + this.island[1] / 2 : 17;
        const leftC = this.island ? (W - this.island[0]) / 4 : (this.notch ? (W - this.notch[0]) / 4 + 4 : 44);
        g.font = F(600, 16); g.textAlign = 'center'; g.textBaseline = 'middle';
        if (!(ctx === 'lock' && this.notch)) g.fillText(t, leftC, y + 1);
        const rx = W - Math.max(leftC, 52);
        for (let i = 0; i < 4; i++) { g.globalAlpha = i < 3 ? 1 : 0.4; rr(g, rx - 30 + i * 4.6, y + 4 - (i + 1) * 2.6, 3, (i + 1) * 2.6, 0.8); g.fill(); }
        g.globalAlpha = 1;
        wifi(rx + 0.5, y + 5, 10);
        battery(rx + 12, y - 6, 24, 12);
      }
      g.restore();
    }

    padlock(g, x, y, s, open) {
      g.save(); g.lineWidth = s * 0.35;
      rr(g, x - s, y - s * 0.2, s * 2, s * 1.6, s * 0.3); g.fill();
      g.beginPath(); g.arc(x + (open ? s * 1.6 : 0), y - s * 0.2, s * 0.65, Math.PI, 0); g.lineTo(x + (open ? s * 1.6 : 0) + s * 0.65, y - s * 0.2); g.stroke();
      g.restore();
    }

    drawWall(g, home) {
      g.drawImage(home ? this.wallHome : this.wallLock, 0, 0, this.W, this.H);
    }

    drawLock(g, dim) {
      const W = this.W, H = this.H, t = this.t, e = t - this.t0;
      if (dim) {
        // 全天候显示（AOD）
        this.drawWall(g, false); g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 0, W, H);
      } else this.drawWall(g, false);
      const fade = dim ? 1 : clamp(e / 0.35, 0, 1);
      g.save(); g.globalAlpha = fade;
      const time = this.timeStr(), date = this.dateStr();
      g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
      if (this.lockStyle === 'slider') {
        // 拟物化锁屏
        const tg = g.createLinearGradient(0, 20, 0, 116); tg.addColorStop(0, 'rgba(60,60,60,0.75)'); tg.addColorStop(0.5, 'rgba(20,20,20,0.72)'); tg.addColorStop(1, 'rgba(0,0,0,0.7)');
        g.fillStyle = tg; g.fillRect(0, 20, W, 96); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, 20, W, 1);
        g.fillStyle = '#fff'; g.font = F(200, 64); g.fillText(time, W / 2, 86);
        g.font = F(400, 16); g.fillText(date, W / 2, 106);
        const bg = g.createLinearGradient(0, H - 96, 0, H); bg.addColorStop(0, 'rgba(50,50,50,0.75)'); bg.addColorStop(1, 'rgba(0,0,0,0.8)');
        g.fillStyle = bg; g.fillRect(0, H - 96, W, 96); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, H - 96, W, 1);
        const tr = { x: 20, y: H - 70, w: W - 40, h: 48 };
        const tgr = g.createLinearGradient(0, tr.y, 0, tr.y + tr.h); tgr.addColorStop(0, '#0a0a0a'); tgr.addColorStop(1, '#2a2a2a');
        g.fillStyle = tgr; rr(g, tr.x, tr.y, tr.w, tr.h, 10); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.stroke();
        const k = this.knobRect();
        // 闪光文字
        g.save(); rr(g, tr.x, tr.y, tr.w, tr.h, 10); g.clip();
        g.font = F(400, 21); g.textBaseline = 'middle';
        const sx = ((t * 160) % (W + 200)) - 100;
        const sg = g.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'rgba(255,255,255,0.35)'); sg.addColorStop(0.5, 'rgba(255,255,255,1)'); sg.addColorStop(1, 'rgba(255,255,255,0.35)');
        g.fillStyle = sg; g.globalAlpha = fade * (1 - this.knob * 1.5);
        g.fillText('滑动来解锁', W / 2 + 34, tr.y + tr.h / 2 + 1); g.restore();
        const kg = g.createLinearGradient(0, k.y, 0, k.y + k.h); kg.addColorStop(0, '#fdfdfd'); kg.addColorStop(0.5, '#d6d6d6'); kg.addColorStop(0.51, '#c4c4c4'); kg.addColorStop(1, '#e8e8e8');
        g.fillStyle = kg; rr(g, k.x, k.y, k.w, k.h, 8); g.fill();
        g.fillStyle = '#7a7a7a'; g.beginPath(); const ax = k.x + k.w / 2, ay = k.y + k.h / 2;
        g.moveTo(ax - 14, ay - 4); g.lineTo(ax + 2, ay - 4); g.lineTo(ax + 2, ay - 11); g.lineTo(ax + 16, ay); g.lineTo(ax + 2, ay + 11); g.lineTo(ax + 2, ay + 4); g.lineTo(ax - 14, ay + 4); g.closePath(); g.fill();
      } else if (this.lockStyle === 'swipe' || this.lockStyle === 'press') {
        g.translate(this.lockDX, 0);
        g.font = F(100, this.osv >= 10 ? 82 : 78); g.fillText(time, W / 2, H * 0.2 + 28);
        g.font = F(400, 18); g.fillText(date, W / 2, H * 0.2 + 56);
        g.font = F(400, this.osv >= 10 ? 15 : 21); g.textBaseline = 'middle';
        const sx = ((t * 180) % (W + 240)) - 120;
        const sg = g.createLinearGradient(sx - 70, 0, sx + 70, 0); sg.addColorStop(0, 'rgba(255,255,255,0.45)'); sg.addColorStop(0.5, 'rgba(255,255,255,1)'); sg.addColorStop(1, 'rgba(255,255,255,0.45)');
        g.fillStyle = sg;
        const hint = this.hint && t - this.hint < 1.2 ? Math.sin((t - this.hint) * 18) * 8 * (1 - (t - this.hint) / 1.2) : 0;
        g.fillText(this.lockStyle === 'swipe' ? '›  滑动来解锁' : (this.touchID ? '按下主屏幕按钮以解锁' : '按下主屏幕按钮以解锁'), W / 2 + hint, H - (this.lockStyle === 'swipe' ? 64 : 38));
        g.fillStyle = 'rgba(255,255,255,0.8)'; rr(g, W / 2 - 18, H - 14, 36, 4, 2);
        if (this.lockStyle === 'swipe') { g.fill(); }
      } else {
        // Face ID 锁屏
        g.translate(0, this.lockDY);
        const big = this.osv >= 16;
        const lockY = this.island ? this.island[2] + this.island[1] + 22 : (this.notch ? 62 : 48);
        if (!this.isl) this.padlock(g, W / 2, lockY, 7, this.lockDY < -30);
        if (big) {
          g.font = F(600, 19); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillText(date, W / 2, lockY + 32);
          g.font = F(this.glass ? 700 : 600, this.glass ? 108 : 92); g.fillStyle = this.glass ? 'rgba(255,255,255,0.92)' : '#fff';
          if (this.glass) { g.save(); g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 12; g.fillText(time, W / 2, lockY + 132); g.restore(); g.save(); g.globalCompositeOperation = 'overlay'; g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillText(time, W / 2, lockY + 128); g.restore(); }
          else g.fillText(time, W / 2, lockY + 122);
          if (!dim) {
            // 小组件
            const wy = lockY + 152;
            for (let i = 0; i < 3; i++) {
              const x = W / 2 - 96 + i * 66;
              g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(x + 30, wy + 28, 26, 0, 7); g.fill();
              g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(x + 30, wy + 28, 20, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * [0.8, 0.55, 0.3][i])); g.stroke();
              g.fillStyle = '#fff'; g.font = F(600, 13); g.textBaseline = 'middle'; g.fillText(['80', '22°', '6k'][i], x + 30, wy + 29); g.textBaseline = 'alphabetic';
            }
          }
        } else {
          g.font = F(200, 84); g.fillText(time, W / 2, lockY + 100);
          g.font = F(400, 19); g.fillText(date, W / 2, lockY + 128);
        }
        if (!dim) {
          const b = this.lockButtons();
          [[b.fx, 'flash'], [b.cx, 'camera']].forEach(([x, k]) => {
            const on = k === 'flash' && this.flashlight;
            g.fillStyle = on ? 'rgba(255,255,255,0.95)' : (this.glass ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.35)');
            g.beginPath(); g.arc(x, b.y, 25, 0, 7); g.fill();
            if (this.glass) { g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1; g.stroke(); }
            g.fillStyle = on ? '#000' : '#fff'; g.strokeStyle = g.fillStyle;
            if (k === 'flash') { rr(g, x - 4.5, b.y - 2, 9, 13, 2); g.fill(); g.beginPath(); g.moveTo(x - 7, b.y - 12); g.lineTo(x + 7, b.y - 12); g.lineTo(x + 4.5, b.y - 3); g.lineTo(x - 4.5, b.y - 3); g.closePath(); g.fill(); }
            else { rr(g, x - 11, b.y - 7, 22, 16, 3); g.fill(); g.fillRect(x - 4, b.y - 10, 8, 3); g.fillStyle = on ? '#fff' : 'rgba(0,0,0,0.6)'; g.beginPath(); g.arc(x, b.y + 1, 4.5, 0, 7); g.fill(); }
          });
          const hint = this.hint && t - this.hint < 1.4;
          g.fillStyle = '#fff'; g.font = F(400, 14); g.textBaseline = 'middle';
          g.globalAlpha = fade * (hint ? 1 : 0.0 + 0.5 + 0.5 * Math.sin(t * 2.4));
          g.fillText('上滑以打开', W / 2, H - 34 + (hint ? Math.sin((t - this.hint) * 12) * 3 : 0));
          g.globalAlpha = fade;
        }
        g.fillStyle = '#fff'; rr(g, W / 2 - 67, H - 13, 134, 5, 2.5); g.fill();
      }
      g.restore();
      this.statusBar(g, '#fff', 'lock');
    }

    drawHome(g) {
      const W = this.W, H = this.H, L = this.L, t = this.t;
      this.drawWall(g, true);
      const ie = this.homeIntro !== undefined ? ease((t - this.homeIntro) / 0.5) : 1;
      // 程序坞
      g.save();
      if (this.skeuo && this.osv < 4) {
        const dg = g.createLinearGradient(0, L.dockTop, 0, H); dg.addColorStop(0, 'rgba(255,255,255,0.32)'); dg.addColorStop(0.5, 'rgba(255,255,255,0.12)'); dg.addColorStop(0.51, 'rgba(255,255,255,0.05)'); dg.addColorStop(1, 'rgba(255,255,255,0.12)');
        g.fillStyle = dg; g.fillRect(0, L.dockTop, W, L.dockH); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(0, L.dockTop, W, 1);
      } else if (this.skeuo) {
        const y = L.dockTop + 22;
        const dg = g.createLinearGradient(0, y, 0, H); dg.addColorStop(0, 'rgba(230,240,255,0.55)'); dg.addColorStop(0.4, 'rgba(150,170,190,0.45)'); dg.addColorStop(1, 'rgba(40,50,60,0.55)');
        g.fillStyle = dg; g.beginPath(); g.moveTo(14, y); g.lineTo(W - 14, y); g.lineTo(W, H - 20); g.lineTo(0, H - 20); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(14, y, W - 28, 1);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, H - 20, W, 20);
      } else if (this.hasHome) {
        g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, L.dockTop, W, L.dockH + 2);
      } else {
        const x = L.dockX, y = L.dockTop, w = L.dockW, h = L.dockH;
        g.fillStyle = this.glass ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.26)'; rr(g, x, y, w, h, this.glass ? 36 : 30); g.fill();
        if (this.glass) { const hg = g.createLinearGradient(0, y, 0, y + h); hg.addColorStop(0, 'rgba(255,255,255,0.7)'); hg.addColorStop(0.5, 'rgba(255,255,255,0.1)'); hg.addColorStop(1, 'rgba(255,255,255,0.4)'); g.strokeStyle = hg; g.lineWidth = 1.2; g.stroke(); }
      }
      g.restore();
      // 页面指示 / 搜索
      if (!this.skeuo) {
        const y = L.dockTop - 18;
        if (this.osv >= 16) {
          g.fillStyle = 'rgba(255,255,255,0.25)'; rr(g, W / 2 - 36, y - 11, 72, 24, 12); g.fill();
          g.fillStyle = '#fff'; g.font = F(500, 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔍 搜索', W / 2, y + 1);
        } else for (let i = 0; i < 3; i++) { g.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,0.4)'; g.beginPath(); g.arc(W / 2 - 9 + i * 9, y, 3, 0, 7); g.fill(); }
      } else {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2 - 4, L.dockTop - 8, 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.arc(W / 2 + 6, L.dockTop - 8, 3, 0, 7); g.fill();
      }
      // 图标
      for (const ic of L.icons) {
        const sc = 1 + (1 - ie) * (ic.dock ? 0.15 : 0.6);
        const cx = ic.x + ic.s / 2, cy = ic.y + ic.s / 2;
        const ox = (cx - W / 2) * (sc - 1), oy = (cy - H / 2) * (sc - 1);
        g.save(); g.globalAlpha = ie; g.translate(cx + ox, cy + oy); g.scale(sc, sc); g.translate(-ic.s / 2, -ic.s / 2);
        if (this.skeuo && this.osv >= 4 && ic.dock) { g.save(); g.globalAlpha = 0.25 * ie; g.translate(0, ic.s * 2 + 4); g.scale(1, -1); this.icon(g, ic.k, ic.s); g.restore(); }
        this.icon(g, ic.k, ic.s);
        if (ic.label) {
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'top';
          g.font = F(this.skeuo ? 600 : 400, this.skeuo ? 11 : 12);
          g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = this.skeuo ? 2 : 3; g.shadowOffsetY = this.skeuo ? 1 : 0;
          g.fillText(NAMES[ic.k] || ic.k, ic.s / 2, ic.s + (this.skeuo ? 3 : 5));
        }
        g.restore();
      }
      this.statusBar(g, '#fff', 'home');
    }

    homeTap(x, y) {
      for (const ic of this.L.icons) {
        if (x >= ic.x && x <= ic.x + ic.s && y >= ic.y && y <= ic.y + ic.s + 14) {
          return this.openApp(ic.k, { x: ic.x, y: ic.y, w: ic.s, h: ic.s }, 'home');
        }
      }
    }

    // ---------- 图标 ----------
    icon(g, k, s) {
      const r = s * (this.skeuo ? 0.17 : 0.225);
      g.save();
      if (this.skeuo) { g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5; }
      rr(g, 0, 0, s, s, r); g.fillStyle = '#000'; g.fill();
      g.shadowColor = 'transparent';
      g.clip();
      const bg = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, s); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, s, s); };
      const W = '#fff', c = s / 2;
      g.lineCap = 'round'; g.lineJoin = 'round';
      switch (k) {
        case 'messages': bg('#6ce86f', '#22c13a'); g.fillStyle = W; g.beginPath(); g.ellipse(c, c - s * 0.02, s * 0.34, s * 0.28, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(c - s * 0.2, c + s * 0.18); g.quadraticCurveTo(c - s * 0.24, c + s * 0.32, c - s * 0.32, c + s * 0.33); g.quadraticCurveTo(c - s * 0.12, c + s * 0.32, c - s * 0.02, c + s * 0.22); g.fill(); break;
        case 'facetime': bg('#6ce86f', '#22c13a'); g.fillStyle = W; rr(g, s * 0.18, s * 0.33, s * 0.42, s * 0.34, s * 0.07); g.fill(); g.beginPath(); g.moveTo(s * 0.62, s * 0.45); g.lineTo(s * 0.82, s * 0.33); g.lineTo(s * 0.82, s * 0.67); g.lineTo(s * 0.62, s * 0.55); g.fill(); break;
        case 'phone': bg('#6ce86f', '#22c13a'); g.strokeStyle = W; g.lineWidth = s * 0.13; g.beginPath(); g.arc(c + s * 0.08, c - s * 0.08, s * 0.24, Math.PI * 0.62, Math.PI * 1.38); g.stroke(); g.fillStyle = W; g.save(); g.translate(c + s * 0.08, c - s * 0.08); [0.62, 1.38].forEach(a => { g.save(); g.rotate(Math.PI * a); g.fillRect(s * 0.17, -s * 0.09, s * 0.14, s * 0.18); g.restore(); }); g.restore(); break;
        case 'mail': bg('#4fb8ff', '#1a6ef0'); g.fillStyle = W; rr(g, s * 0.16, s * 0.28, s * 0.68, s * 0.46, s * 0.05); g.fill(); g.strokeStyle = '#2a86f5'; g.lineWidth = s * 0.04; g.beginPath(); g.moveTo(s * 0.18, s * 0.31); g.lineTo(c, s * 0.53); g.lineTo(s * 0.82, s * 0.31); g.stroke(); break;
        case 'safari': bg('#ffffff', '#dfe6ee'); { const cg = g.createLinearGradient(0, s * 0.12, 0, s * 0.88); cg.addColorStop(0, '#1ad1ff'); cg.addColorStop(1, '#1366e8'); g.fillStyle = cg; g.beginPath(); g.arc(c, c, s * 0.38, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * s * 0.3, c + Math.sin(a) * s * 0.3); g.lineTo(c + Math.cos(a) * s * 0.35, c + Math.sin(a) * s * 0.35); g.stroke(); } g.save(); g.translate(c, c); g.rotate(Math.PI / 4); g.fillStyle = '#ff3b30'; g.beginPath(); g.moveTo(0, -s * 0.3); g.lineTo(s * 0.06, 0); g.lineTo(-s * 0.06, 0); g.fill(); g.fillStyle = W; g.beginPath(); g.moveTo(0, s * 0.3); g.lineTo(s * 0.06, 0); g.lineTo(-s * 0.06, 0); g.fill(); g.restore(); } break;
        case 'music': case 'ipod': case 'itunes': {
          if (k === 'ipod') bg('#ff9a3c', '#e2580c'); else if (k === 'itunes') bg('#e568f2', '#9a35d6'); else bg(this.osv >= 7 ? '#ff6178' : '#ff9a3c', this.osv >= 7 ? '#f8233f' : '#e2580c');
          g.fillStyle = W; g.strokeStyle = W; g.lineWidth = s * 0.06; g.beginPath(); g.moveTo(s * 0.4, s * 0.68); g.lineTo(s * 0.4, s * 0.27); g.lineTo(s * 0.7, s * 0.21); g.lineTo(s * 0.7, s * 0.6); g.stroke();
          g.beginPath(); g.ellipse(s * 0.34, s * 0.69, s * 0.09, s * 0.07, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(s * 0.64, s * 0.61, s * 0.09, s * 0.07, -0.3, 0, 7); g.fill();
          if (k === 'itunes') { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(c, c, s * 0.4, 0, 7); g.stroke(); }
          break;
        }
        case 'calendar': { bg('#ffffff', '#f2f2f2'); const d = new Date(); g.fillStyle = '#ff3b30'; g.textAlign = 'center'; g.textBaseline = 'middle';
          if (this.skeuo) { g.fillStyle = '#d33'; g.fillRect(0, 0, s, s * 0.28); g.fillStyle = W; g.font = F(600, s * 0.16); g.fillText(WEEK[d.getDay()], c, s * 0.15); }
          else { g.font = F(500, s * 0.15); g.fillText(WEEK[d.getDay()], c, s * 0.22); }
          g.fillStyle = '#111'; g.font = F(this.skeuo ? 700 : 300, s * 0.5); g.fillText(d.getDate(), c, s * 0.62); break; }
        case 'photos': { if (this.skeuo) { bg('#7ab9e8', '#2e75b8'); g.fillStyle = '#fbd84a'; g.beginPath(); g.arc(c, c, s * 0.15, 0, 7); g.fill(); for (let i = 0; i < 12; i++) { g.save(); g.translate(c, c); g.rotate(i / 12 * Math.PI * 2); g.fillStyle = '#ffe36a'; g.beginPath(); g.ellipse(0, -s * 0.25, s * 0.07, s * 0.12, 0, 0, 7); g.fill(); g.restore(); } break; }
          bg('#ffffff', '#f4f4f4'); const cols = ['#fbbc2c', '#f57c20', '#e8384f', '#b745c9', '#6157d6', '#2f8bf0', '#3fbf6d', '#a9d13b'];
          g.globalCompositeOperation = 'multiply'; cols.forEach((col, i) => { g.save(); g.translate(c, c); g.rotate(i / 8 * Math.PI * 2); g.globalAlpha = 0.85; g.fillStyle = col; rr(g, -s * 0.09, -s * 0.38, s * 0.18, s * 0.3, s * 0.09); g.fill(); g.restore(); }); g.globalCompositeOperation = 'source-over'; break; }
        case 'camera': bg('#e6e6ea', '#9b9ba3'); g.fillStyle = '#2b2b2e'; rr(g, s * 0.15, s * 0.3, s * 0.7, s * 0.46, s * 0.08); g.fill(); g.fillRect(s * 0.38, s * 0.24, s * 0.24, s * 0.08); g.fillStyle = '#5a5a60'; g.beginPath(); g.arc(c, s * 0.53, s * 0.16, 0, 7); g.fill(); g.fillStyle = '#121214'; g.beginPath(); g.arc(c, s * 0.53, s * 0.1, 0, 7); g.fill(); break;
        case 'weather': bg('#4fb6ff', '#1867de'); g.fillStyle = '#ffd43b'; g.beginPath(); g.arc(s * 0.38, s * 0.38, s * 0.17, 0, 7); g.fill(); g.fillStyle = W; g.beginPath(); g.arc(s * 0.45, s * 0.64, s * 0.12, 0, 7); g.arc(s * 0.6, s * 0.56, s * 0.15, 0, 7); g.arc(s * 0.74, s * 0.66, s * 0.1, 0, 7); g.fill(); g.fillRect(s * 0.45, s * 0.64, s * 0.3, s * 0.12); break;
        case 'clock': { bg(this.skeuo ? '#ffffff' : '#111111', this.skeuo ? '#cfcfcf' : '#000'); const d = new Date(); g.fillStyle = W; g.beginPath(); g.arc(c, c, s * 0.4, 0, 7); g.fill();
          g.fillStyle = '#111'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.arc(c + Math.sin(a) * s * 0.33, c - Math.cos(a) * s * 0.33, s * 0.012, 0, 7); g.fill(); }
          const hand = (a, l, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.sin(a) * l, c - Math.cos(a) * l); g.stroke(); };
          hand((d.getHours() % 12 + d.getMinutes() / 60) / 12 * Math.PI * 2, s * 0.2, s * 0.05, '#111'); hand(d.getMinutes() / 60 * Math.PI * 2, s * 0.3, s * 0.035, '#111'); hand((d.getSeconds() + d.getMilliseconds() / 1000) / 60 * Math.PI * 2, s * 0.33, s * 0.015, '#ff9500'); break; }
        case 'maps': bg('#d8f3c4', '#f5efdc'); g.strokeStyle = '#fbc93d'; g.lineWidth = s * 0.09; g.beginPath(); g.moveTo(-5, s * 0.75); g.lineTo(s * 0.5, s * 0.4); g.lineTo(s + 5, s * 0.45); g.stroke(); g.strokeStyle = '#7fb3ea'; g.lineWidth = s * 0.06; g.beginPath(); g.moveTo(s * 0.3, -5); g.lineTo(s * 0.62, s + 5); g.stroke(); g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(s * 0.68, s * 0.28, s * 0.09, 0, 7); g.fill(); break;
        case 'notes': bg(this.skeuo ? '#fff6a8' : '#ffffff', this.skeuo ? '#f5e46c' : '#f6f6f6'); if (!this.skeuo) { g.fillStyle = '#fcd34d'; g.fillRect(0, 0, s, s * 0.26); } g.strokeStyle = this.skeuo ? 'rgba(160,120,60,0.45)' : '#ddd'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(s * 0.12, s * (0.4 + i * 0.12)); g.lineTo(s * 0.88, s * (0.4 + i * 0.12)); g.stroke(); } break;
        case 'calc': bg(this.skeuo ? '#555' : '#333', this.skeuo ? '#222' : '#1a1a1a'); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = j === 3 ? '#ff9500' : (i === 0 ? '#a5a5a5' : '#5b5b5d'); g.beginPath(); g.arc(s * (0.2 + j * 0.2), s * (0.2 + i * 0.2), s * 0.075, 0, 7); g.fill(); } break;
        case 'settings': { bg('#b3b3b8', '#6e6e74'); g.save(); g.translate(c, c); g.fillStyle = '#d6d6da'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.fillRect(-s * 0.04, -s * 0.36, s * 0.08, s * 0.12); } g.beginPath(); g.arc(0, 0, s * 0.27, 0, 7); g.fill(); g.fillStyle = '#7a7a80'; g.beginPath(); g.arc(0, 0, s * 0.18, 0, 7); g.fill(); g.fillStyle = '#d6d6da'; g.beginPath(); g.arc(0, 0, s * 0.08, 0, 7); g.fill(); g.restore(); break; }
        case 'appstore': bg('#3fc5ff', '#1270f2'); g.strokeStyle = W; g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(s * 0.32, s * 0.72); g.lineTo(s * 0.52, s * 0.28); g.moveTo(s * 0.68, s * 0.72); g.lineTo(s * 0.48, s * 0.28); g.moveTo(s * 0.26, s * 0.58); g.lineTo(s * 0.74, s * 0.58); g.stroke(); break;
        case 'stocks': bg('#1c1c1e', '#000'); g.strokeStyle = '#34c759'; g.lineWidth = s * 0.05; g.beginPath(); g.moveTo(s * 0.12, s * 0.7); g.lineTo(s * 0.32, s * 0.5); g.lineTo(s * 0.48, s * 0.6); g.lineTo(s * 0.68, s * 0.32); g.lineTo(s * 0.88, s * 0.38); g.stroke(); break;
        case 'youtube': bg('#f2f2f2', '#c9c9c9'); g.fillStyle = '#e62117'; rr(g, s * 0.16, s * 0.3, s * 0.68, s * 0.4, s * 0.1); g.fill(); g.fillStyle = W; g.beginPath(); g.moveTo(s * 0.44, s * 0.4); g.lineTo(s * 0.6, s * 0.5); g.lineTo(s * 0.44, s * 0.6); g.fill(); break;
        case 'reminders': bg('#ffffff', '#f2f2f2'); ['#ff9500', '#007aff', '#ff3b30'].forEach((col, i) => { g.strokeStyle = col; g.lineWidth = s * 0.04; g.beginPath(); g.arc(s * 0.25, s * (0.3 + i * 0.2), s * 0.06, 0, 7); g.stroke(); g.fillStyle = '#ccc'; g.fillRect(s * 0.38, s * (0.29 + i * 0.2), s * 0.42, s * 0.025); }); break;
        case 'health': bg('#ffffff', '#f4f4f4'); g.fillStyle = '#ff2d55'; g.beginPath(); g.moveTo(c, s * 0.76); g.bezierCurveTo(s * 0.1, s * 0.45, s * 0.3, s * 0.15, c, s * 0.35); g.bezierCurveTo(s * 0.7, s * 0.15, s * 0.9, s * 0.45, c, s * 0.76); g.fill(); break;
        case 'wallet': bg('#1c1c1e', '#000'); ['#34c759', '#ffcc00', '#ff9500', '#ff3b30'].forEach((col, i) => { g.fillStyle = col; rr(g, s * 0.16, s * (0.22 + i * 0.08), s * 0.68, s * 0.2, s * 0.04); g.fill(); }); g.fillStyle = '#e5e5ea'; rr(g, s * 0.16, s * 0.5, s * 0.68, s * 0.28, s * 0.05); g.fill(); break;
        case 'contacts': bg('#d9d9de', '#a7a7ae'); g.fillStyle = '#8e8e93'; g.beginPath(); g.arc(c, s * 0.4, s * 0.14, 0, 7); g.fill(); g.beginPath(); g.ellipse(c, s * 0.78, s * 0.28, s * 0.2, 0, Math.PI, 0); g.fill(); break;
        case 'files': bg('#ffffff', '#f2f2f2'); g.fillStyle = '#1a8cff'; rr(g, s * 0.16, s * 0.28, s * 0.68, s * 0.48, s * 0.06); g.fill(); g.fillStyle = '#56adff'; rr(g, s * 0.16, s * 0.24, s * 0.3, s * 0.12, s * 0.04); g.fill(); break;
        case 'tv': bg('#1c1c1e', '#000'); g.fillStyle = W; g.font = F(700, s * 0.26); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('tv', c + s * 0.08, c + s * 0.02); window.drawApple(g, c - s * 0.16, c - s * 0.02, s * 0.24, W); break;
        case 'gamecenter': bg('#f2f2f2', '#d9d9d9'); [['#ff2d55', 0.38, 0.38, 0.2], ['#5856d6', 0.62, 0.36, 0.17], ['#34c759', 0.45, 0.64, 0.16], ['#ffcc00', 0.68, 0.62, 0.13]].forEach(([col, x, y, r]) => { g.fillStyle = col; g.globalAlpha = 0.85; g.beginPath(); g.arc(s * x, s * y, s * r, 0, 7); g.fill(); }); g.globalAlpha = 1; break;
        case 'compass': bg('#1c1c1e', '#000'); g.strokeStyle = W; g.lineWidth = 1.2; g.beginPath(); g.arc(c, c, s * 0.34, 0, 7); g.stroke(); g.fillStyle = '#ff3b30'; g.beginPath(); g.moveTo(c, s * 0.2); g.lineTo(c + s * 0.07, c); g.lineTo(c - s * 0.07, c); g.fill(); g.fillStyle = W; g.beginPath(); g.moveTo(c, s * 0.8); g.lineTo(c + s * 0.07, c); g.lineTo(c - s * 0.07, c); g.fill(); break;
        default: bg('#888', '#555'); g.fillStyle = W; g.font = F(600, s * 0.4); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((NAMES[k] || k)[0], c, c);
      }
      if (this.skeuo) {
        // 高光
        const hg = g.createLinearGradient(0, 0, 0, s * 0.5); hg.addColorStop(0, 'rgba(255,255,255,0.6)'); hg.addColorStop(1, 'rgba(255,255,255,0.08)');
        g.fillStyle = hg; g.beginPath(); g.moveTo(0, 0); g.lineTo(s, 0); g.lineTo(s, s * 0.42); g.quadraticCurveTo(c, s * 0.56, 0, s * 0.42); g.closePath(); g.fill();
      }
      if (this.glass) {
        const hg = g.createLinearGradient(0, 0, s, s); hg.addColorStop(0, 'rgba(255,255,255,0.45)'); hg.addColorStop(0.45, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(255,255,255,0.18)');
        g.fillStyle = hg; g.fillRect(0, 0, s, s);
        g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; rr(g, 0.75, 0.75, s - 1.5, s - 1.5, r); g.stroke();
      }
      g.restore();
    }

    // ---------- App ----------
    drawAppLayer(g) {
      const W = this.W, H = this.H, t = this.t, a = this.appAnim;
      let p = 1;
      if (a) { p = ease((t - a.t0) / 0.32); if (a.dir < 0) p = 1 - p; else if (p >= 1) this.appAnim = null; }
      const pull = this.appPull || 0, pk = clamp(1 + pull / H, 0.6, 1);
      const R = this.appRect, rx = R.x + (0 - R.x) * p, ry = R.y + (0 - R.y) * p, rw = R.w + (W - R.w) * p, rh = R.h + (H - R.h) * p;
      g.save();
      g.translate(W / 2, H / 2 + pull * 0.4); g.scale(pk, pk); g.translate(-W / 2, -H / 2);
      const rad = (this.modern ? 44 : 0) * p + R.w * 0.22 * (1 - p) + (pk < 1 ? 30 : 0);
      rr(g, rx, ry, rw, rh, rad); g.clip();
      if (p < 0.999) { g.save(); g.translate(rx, ry); g.scale(rw / W, rh / H); this.drawApp(g, this.app); g.restore(); g.globalAlpha = 1 - clamp(p * 2.5, 0, 1); g.save(); g.translate(rx, ry); g.scale(rw / R.w, rh / R.h); this.icon(g, this.app, R.w); g.restore(); g.globalAlpha = 1; }
      else this.drawApp(g, this.app);
      g.restore();
      if (!this.hasHome) { g.fillStyle = this.appDark() ? '#fff' : '#000'; rr(g, W / 2 - 67, H - 13, 134, 5, 2.5); g.fill(); }
    }
    appDark() { return ['clock', 'calc', 'camera', 'stocks', 'music', 'compass', 'wallet', 'tv'].includes(this.app); }

    navBar(g, title, dark) {
      const W = this.W, top = this.L.statusH;
      if (this.skeuo) {
        const gr = g.createLinearGradient(0, top, 0, top + 44); gr.addColorStop(0, '#b0bccd'); gr.addColorStop(0.5, '#8a9bb3'); gr.addColorStop(0.51, '#7c8ea8'); gr.addColorStop(1, '#6d7f9c');
        g.fillStyle = gr; g.fillRect(0, top, W, 44); g.fillStyle = '#2e3d52'; g.fillRect(0, top + 43, W, 1);
        g.fillStyle = '#fff'; g.font = F(700, 20); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowOffsetY = -1; g.fillText(title, W / 2, top + 22); g.shadowColor = 'transparent';
        return top + 44;
      }
      if (this.osv >= 11) {
        g.fillStyle = dark ? '#fff' : '#000'; g.font = F(700, 34); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(title, 16, top + 52);
        return top + 66;
      }
      g.fillStyle = dark ? '#111' : '#f7f7f7'; g.fillRect(0, top - 20, W, 64); g.fillStyle = dark ? '#333' : '#d0d0d0'; g.fillRect(0, top + 43, W, 0.5);
      g.fillStyle = dark ? '#fff' : '#000'; g.font = F(600, 17); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, W / 2, top + 22);
      return top + 44;
    }

    wrap(g, text, x, y, maxW, lh, maxLines) {
      let line = '', n = 0;
      for (const ch of text) {
        const test = line + ch;
        if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y + n * lh); line = ch; n++; if (maxLines && n >= maxLines) return n; }
        else line = test;
      }
      if (line) { g.fillText(line, x, y + n * lh); n++; }
      return n;
    }

    drawApp(g, k) {
      const W = this.W, H = this.H, t = this.t, d = this.d;
      const dark = this.appDark();
      g.fillStyle = dark ? '#000' : (this.skeuo ? '#ffffff' : '#f2f2f7'); g.fillRect(0, 0, W, H);
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      if (k === 'clock') {
        const now = new Date(), cx = W / 2, cy = H * 0.38, R = Math.min(W * 0.36, H * 0.25);
        g.fillStyle = '#1c1c1e'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = F(400, R * 0.15);
        for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; g.fillText(i, cx + Math.sin(a) * R * 0.8, cy - Math.cos(a) * R * 0.8); }
        g.lineCap = 'round';
        const hand = (a, l, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); g.stroke(); };
        hand((now.getHours() % 12 + now.getMinutes() / 60) / 12 * Math.PI * 2, R * 0.5, 6, '#fff');
        hand((now.getMinutes() + now.getSeconds() / 60) / 60 * Math.PI * 2, R * 0.72, 4, '#fff');
        hand((now.getSeconds() + now.getMilliseconds() / 1000) / 60 * Math.PI * 2, R * 0.8, 1.5, '#ff9f0a');
        g.fillStyle = '#ff9f0a'; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.font = F(200, 52); g.fillText(now.toTimeString().slice(0, 8), cx, H * 0.7);
        g.font = F(400, 16); g.fillStyle = '#8e8e93'; g.fillText('北京 · 今天', cx, H * 0.7 + 40);
        this.tabBar(g, ['世界时钟', '闹钟', '秒表', '计时器'], 0, true);
      } else if (k === 'calc') this.drawCalc(g);
      else if (k === 'camera') this.drawCamera(g);
      else if (k === 'photos') {
        const y0 = this.navBar(g, '照片', false), n = W > 600 ? 8 : 4, s = (W - (n + 1) * 2) / n;
        const shots = this.photos.concat(Array.from({ length: 24 }, (_, i) => ({ h: (i * 47) % 360, l: 40 + (i * 13) % 30 })));
        shots.slice(0, 24).forEach((p, i) => {
          const x = 2 + (i % n) * (s + 2), y = y0 + 4 + Math.floor(i / n) * (s + 2);
          const gr = g.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, `hsl(${p.h},70%,${p.l + 15}%)`); gr.addColorStop(1, `hsl(${(p.h + 40) % 360},60%,${p.l - 10}%)`);
          g.fillStyle = gr; g.fillRect(x, y, s, s);
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x + s * 0.7, y + s * 0.3, s * 0.12, 0, 7); g.fill();
          g.fillStyle = `hsla(${(p.h + 180) % 360},40%,25%,0.6)`; g.beginPath(); g.moveTo(x, y + s); g.lineTo(x + s * 0.4, y + s * 0.55); g.lineTo(x + s * 0.7, y + s * 0.8); g.lineTo(x + s, y + s * 0.6); g.lineTo(x + s, y + s); g.fill();
        });
      } else if (k === 'settings') {
        let y = this.navBar(g, this.skeuo ? '关于本机' : '关于本机', false) + 18;
        const rows = [['名称', 'iPhone'], ['型号名称', d.name], ['软件版本', d.os.replace('iPhone OS', 'iPhone OS')], ['容量', d.storage.split('/')[0].trim().replace(' 起', '')], ['芯片', d.chip.split('（')[0]], ['上市日期', d.date], ['屏幕', d.display.inch + ' 英寸'], ['序列号', 'F' + d.id.length + 'K' + d.year + 'MUSEUM']];
        g.fillStyle = '#fff'; rr(g, this.skeuo ? 10 : (this.osv >= 11 ? 16 : 0), y, W - (this.skeuo ? 20 : this.osv >= 11 ? 32 : 0), rows.length * 44, this.skeuo ? 10 : (this.osv >= 11 ? 10 : 0)); g.fill();
        if (this.skeuo) { g.strokeStyle = '#bbb'; g.lineWidth = 1; g.stroke(); }
        rows.forEach(([a, b], i) => {
          const ry = y + i * 44 + 27;
          g.fillStyle = '#000'; g.font = F(this.skeuo ? 700 : 400, 16); g.textAlign = 'left'; g.fillText(a, 30, ry);
          g.fillStyle = this.skeuo ? '#385487' : '#8e8e93'; g.font = F(400, 15); g.textAlign = 'right'; g.fillText(b, W - 30, ry);
          if (i < rows.length - 1) { g.fillStyle = '#e0e0e0'; g.fillRect(30, y + (i + 1) * 44, W - 46, 0.6); }
        });
      } else if (k === 'notes') {
        if (this.skeuo) { g.fillStyle = '#fdf6b4'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(160,120,60,0.35)'; for (let y = 100; y < H; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.strokeStyle = 'rgba(200,80,80,0.4)'; g.beginPath(); g.moveTo(26, 64); g.lineTo(26, H); g.stroke(); }
        const y0 = this.navBar(g, '备忘录', false);
        g.fillStyle = this.skeuo ? '#3b2a12' : '#111'; g.font = F(700, 20); g.textAlign = 'left'; g.fillText(d.name + ' 展品笔记', 32, y0 + 32);
        g.font = F(400, 15); g.fillStyle = this.skeuo ? '#4a3618' : '#333';
        let y = y0 + 64; d.intro.forEach(p => { y += this.wrap(g, p, 32, y, W - 56, 26, 9) * 26 + 10; });
      } else if (k === 'weather') {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2f7fe0'); gr.addColorStop(1, '#79c2ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = F(400, 30); g.fillText('库比蒂诺', W / 2, H * 0.17);
        g.font = F(100, 96); g.fillText('22°', W / 2 + 12, H * 0.17 + 100); g.font = F(500, 18); g.fillText('晴  最高 26° 最低 14°', W / 2, H * 0.17 + 134);
        g.fillStyle = 'rgba(255,255,255,0.2)'; rr(g, 16, H * 0.45, W - 32, 120, 14); g.fill();
        for (let i = 0; i < 6; i++) { const x = 16 + (W - 32) / 6 * (i + 0.5); g.fillStyle = '#fff'; g.font = F(500, 14); g.fillText(i === 0 ? '现在' : ((new Date().getHours() + i) % 24) + '时', x, H * 0.45 + 30); g.fillStyle = '#ffd43b'; g.beginPath(); g.arc(x, H * 0.45 + 60, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillText(22 + (i < 3 ? i : 5 - i) + '°', x, H * 0.45 + 98); }
      } else if (k === 'messages') {
        const y0 = this.navBar(g, '信息', false);
        const blue = this.osv >= 5 ? '#0a84ff' : '#6ed05a';
        const msgs = [[0, '这就是传说中的 ' + d.name + ' 吗？'], [1, '没错！' + d.year + ' 年发布。'], [0, d.tagline.replace(/[“”]/g, '')], [1, '亮点：' + d.highlights.slice(0, 2).join('、')], [0, '太酷了 😎']];
        let y = y0 + 20; g.font = F(400, 15);
        msgs.forEach(([me, s]) => {
          const maxW = W * 0.62; let lines = [], line = '';
          for (const ch of s) { if (g.measureText(line + ch).width > maxW) { lines.push(line); line = ch; } else line += ch; }
          lines.push(line);
          const w = Math.max(...lines.map(l => g.measureText(l).width)) + 24, h = lines.length * 20 + 14;
          const x = me ? W - w - 12 : 12;
          g.fillStyle = me ? blue : (this.skeuo ? '#e5e5ea' : '#e9e9eb'); rr(g, x, y, w, h, 17); g.fill();
          g.fillStyle = me ? '#fff' : '#000'; g.textAlign = 'left'; lines.forEach((l, i) => g.fillText(l, x + 12, y + 22 + i * 20));
          y += h + 10;
        });
      } else if (k === 'phone') {
        const y0 = this.L.statusH + 40;
        g.fillStyle = '#000'; g.textAlign = 'center'; g.font = F(300, 34); g.fillText(this.dial || ' ', W / 2, y0 + 50);
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], sub = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ', '', '+', ''];
        const r = Math.min(38, W * 0.1, (H - 230) / 12), gx = W / 2, top = y0 + 110;
        keys.forEach((kk, i) => {
          const x = gx + ((i % 3) - 1) * r * 2.6, y = top + Math.floor(i / 3) * r * 2.4;
          g.fillStyle = this.skeuo ? '#d5d8de' : '#e5e5ea'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
          g.fillStyle = '#000'; g.font = F(400, r * 0.9); g.textBaseline = 'middle'; g.fillText(kk, x, y - (sub[i] ? 5 : 0)); g.font = F(600, 9); g.fillText(sub[i], x, y + r * 0.45); g.textBaseline = 'alphabetic';
        });
        const cy = top + 4 * r * 2.4; g.fillStyle = '#34c759'; g.beginPath(); g.arc(gx, cy, r, 0, 7); g.fill();
        g.save(); g.translate(gx - 30, cy - 30); this.iconGlyphPhone(g); g.restore();
        this.phoneKeys = { keys, r, gx, top, cy };
      } else if (k === 'music' || k === 'ipod') {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a2a4a'); gr.addColorStop(1, '#0a0a0f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const s = Math.min(W - 80, H * 0.42), x = (W - s) / 2, y = this.L.statusH + 50;
        const ag = g.createLinearGradient(x, y, x + s, y + s); ag.addColorStop(0, '#ff5f6d'); ag.addColorStop(1, '#5b3df5'); g.fillStyle = ag; rr(g, x, y, s, s, 12); g.fill();
        window.drawApple(g, W / 2, y + s / 2, s * 0.4, 'rgba(255,255,255,0.85)');
        g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = F(700, 20); g.fillText('Think Different', x, y + s + 44);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = F(400, 16); g.fillText('iPhone 博物馆 · ' + d.year, x, y + s + 68);
        if (this.playing) this.musicT += 0.03;
        const pr = (this.musicT % 200) / 200;
        g.fillStyle = 'rgba(255,255,255,0.25)'; rr(g, x, y + s + 92, s, 5, 2.5); g.fill(); g.fillStyle = '#fff'; rr(g, x, y + s + 92, s * pr, 5, 2.5); g.fill();
        const by = y + s + 150; g.fillStyle = '#fff';
        if (this.playing) { g.fillRect(W / 2 - 12, by - 16, 8, 32); g.fillRect(W / 2 + 4, by - 16, 8, 32); }
        else { g.beginPath(); g.moveTo(W / 2 - 10, by - 18); g.lineTo(W / 2 + 16, by); g.lineTo(W / 2 - 10, by + 18); g.fill(); }
        [-1, 1].forEach(sd => { g.save(); g.translate(W / 2 + sd * 90, by); g.scale(sd, 1); g.beginPath(); g.moveTo(-12, -12); g.lineTo(2, 0); g.lineTo(-12, 12); g.moveTo(2, -12); g.lineTo(16, 0); g.lineTo(2, 12); g.fill(); g.restore(); });
        this.musicBtn = { x: W / 2, y: by };
      } else if (k === 'safari') {
        const top = this.L.statusH;
        g.fillStyle = this.skeuo ? '#8b9db4' : '#f7f7f7'; g.fillRect(0, 0, W, top + 46);
        g.fillStyle = '#fff'; rr(g, 10, top + 8, W - 20, 30, this.skeuo ? 6 : 10); g.fill();
        g.fillStyle = '#555'; g.font = F(400, 14); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔒 apple.com.cn', W / 2, top + 23);
        g.fillStyle = '#fff'; g.fillRect(0, top + 46, W, H); g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
        g.font = F(700, 32); g.fillText(d.name, W / 2, top + 130); g.font = F(400, 16); g.fillStyle = '#6e6e73'; this.wrap(g, d.tagline, W / 2, top + 160, W - 40, 22); g.textAlign = 'center';
        g.fillStyle = '#0071e3'; g.font = F(400, 15); g.fillText('进一步了解 ›     购买 ›', W / 2, top + 210);
        const ac = new THREE.Color(this.accent).getStyle();
        const pw = Math.min(W * 0.4, H * 0.3);
        g.fillStyle = ac; rr(g, W / 2 - pw / 2, top + 240, pw, pw * 2, 24); g.fill(); g.fillStyle = '#111'; rr(g, W / 2 - pw / 2 + 6, top + 246, pw - 12, pw * 2 - 12, 18); g.fill();
      } else if (k === 'maps') {
        g.fillStyle = '#f2efe6'; g.fillRect(0, 0, W, H);
        g.strokeStyle = '#fff'; g.lineWidth = 8; for (let i = -2; i < 12; i++) { g.beginPath(); g.moveTo(i * 60, 0); g.lineTo(i * 60 + 200, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 80); g.lineTo(W, i * 80 - 120); g.stroke(); }
        g.fillStyle = '#c6e8b6'; g.beginPath(); g.ellipse(W * 0.7, H * 0.3, 70, 50, 0.3, 0, 7); g.fill();
        g.fillStyle = '#a9d4f5'; g.beginPath(); g.ellipse(W * 0.2, H * 0.7, 90, 40, -0.4, 0, 7); g.fill();
        g.strokeStyle = '#f9c74f'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, H * 0.55); g.bezierCurveTo(W * 0.3, H * 0.45, W * 0.6, H * 0.65, W, H * 0.5); g.stroke();
        const pulse = (t * 1.2) % 1; g.fillStyle = `rgba(0,122,255,${0.35 * (1 - pulse)})`; g.beginPath(); g.arc(W / 2, H / 2, 10 + pulse * 30, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, H / 2, 10, 0, 7); g.fill(); g.fillStyle = '#007aff'; g.beginPath(); g.arc(W / 2, H / 2, 7, 0, 7); g.fill();
        g.fillStyle = '#333'; g.font = F(600, 13); g.textAlign = 'center'; g.fillText('Apple Park', W * 0.7, H * 0.3 + 4);
      } else {
        const y0 = this.navBar(g, NAMES[k] || k, dark);
        g.save(); g.translate(W / 2 - 40, H * 0.36); this.icon(g, k, 80); g.restore();
        g.fillStyle = dark ? '#fff' : '#000'; g.textAlign = 'center'; g.font = F(600, 20); g.fillText(NAMES[k] || k, W / 2, H * 0.36 + 116);
        g.fillStyle = '#8e8e93'; g.font = F(400, 14); g.fillText('博物馆展品 · 此 App 仅展示界面', W / 2, H * 0.36 + 142);
      }
      // 状态栏（App 内）
      if (k !== 'camera') this.statusBar(g, dark || k === 'weather' || k === 'music' || k === 'ipod' ? '#fff' : '#000', 'app');
    }
    iconGlyphPhone(g) { g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(32, 28, 13, Math.PI * 0.62, Math.PI * 1.38); g.stroke(); }
    tabBar(g, items, sel, dark) {
      const W = this.W, H = this.H, y = H - (this.hasHome ? 50 : 84);
      g.fillStyle = dark ? '#121212' : '#f7f7f7'; g.fillRect(0, y, W, H - y);
      items.forEach((s, i) => { g.fillStyle = i === sel ? '#ff9f0a' : '#8e8e93'; g.font = F(500, 11); g.textAlign = 'center'; g.fillText(s, W / items.length * (i + 0.5), y + 34); g.beginPath(); g.arc(W / items.length * (i + 0.5), y + 16, 7, 0, 7); g.fill(); });
    }

    calcKeys() {
      const W = this.W, H = this.H, gap = Math.min(W * 0.04, 14), s = Math.min((W - gap * 5) / 4, H * 0.62 / 5 - gap), x0 = (W - 4 * s - 3 * gap) / 2;
      const rows = [['C', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '.', '=']];
      const bottom = H - (this.hasHome ? 18 : 40), keys = [];
      rows.forEach((row, ri) => {
        const y = bottom - (rows.length - ri) * (s + gap) + gap;
        let x = x0;
        row.forEach(k => { const w = k === '0' ? s * 2 + gap : s; keys.push({ k, x, y, w, h: s }); x += w + gap; });
      });
      return keys;
    }
    drawCalc(g) {
      const W = this.W, keys = this.calcKeys();
      const top = keys[0].y;
      g.fillStyle = '#fff'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
      let disp = this.calc.disp; let fs = 86; g.font = F(200, fs); while (g.measureText(disp).width > W - 40 && fs > 30) { fs -= 4; g.font = F(200, fs); }
      g.fillText(disp, W - 22, top - 16);
      for (const b of keys) {
        const op = '÷×−+='.includes(b.k), fn = 'C±%'.includes(b.k);
        const active = op && this.calc.op === b.k && this.calc.fresh;
        g.fillStyle = active ? '#fff' : op ? '#ff9f0a' : fn ? '#a5a5a5' : '#333';
        if (this.skeuo) { const gr = g.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, op ? '#ffb340' : fn ? '#c8c8c8' : '#5a5a5a'); gr.addColorStop(1, op ? '#e07b00' : fn ? '#8a8a8a' : '#2a2a2a'); g.fillStyle = gr; rr(g, b.x, b.y, b.w, b.h, 8); }
        else rr(g, b.x, b.y, b.w, b.h, b.h / 2);
        g.fill();
        g.fillStyle = active ? '#ff9f0a' : fn ? '#000' : '#fff'; g.font = F(400, b.h * 0.42); g.textAlign = b.k === '0' ? 'left' : 'center'; g.textBaseline = 'middle';
        g.fillText(b.k === 'C' && this.calc.disp === '0' ? 'AC' : b.k, b.k === '0' ? b.x + b.h * 0.38 : b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
    }
    calcPress(k) {
      const c = this.calc, num = parseFloat(c.disp);
      const apply = (a, b, op) => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === '÷' ? (b === 0 ? NaN : a / b) : b;
      const fmt = v => { if (!isFinite(v)) return '错误'; const s = parseFloat(v.toPrecision(10)).toString(); return s.length > 11 ? v.toExponential(4) : s; };
      if (/[0-9]/.test(k)) { c.disp = c.fresh || c.disp === '0' ? k : (c.disp.length < 10 ? c.disp + k : c.disp); c.fresh = false; }
      else if (k === '.') { if (c.fresh) { c.disp = '0.'; c.fresh = false; } else if (!c.disp.includes('.')) c.disp += '.'; }
      else if (k === 'C') { if (c.disp === '0') { c.acc = null; c.op = null; } c.disp = '0'; c.fresh = true; }
      else if (k === '±') c.disp = fmt(-num);
      else if (k === '%') c.disp = fmt(num / 100);
      else if (k === '=') { if (c.op !== null && c.acc !== null) { c.disp = fmt(apply(c.acc, num, c.op)); c.acc = null; c.op = null; c.fresh = true; } }
      else { if (c.op && !c.fresh && c.acc !== null) c.disp = fmt(apply(c.acc, num, c.op)); c.acc = parseFloat(c.disp); c.op = k; c.fresh = true; }
    }

    drawCamera(g) {
      const W = this.W, H = this.H, t = this.t;
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const top = this.modern ? Math.min(100, H * 0.12) : 44, vh = this.modern ? Math.min(W * 4 / 3, H - top - 150) : H - top - 96;
      // 取景画面：一个缓慢移动的风景
      g.save(); g.beginPath(); g.rect(0, top, W, vh); g.clip();
      const sky = g.createLinearGradient(0, top, 0, top + vh); sky.addColorStop(0, '#5aa9ff'); sky.addColorStop(0.6, '#cfe8ff'); sky.addColorStop(1, '#ffe7c2'); g.fillStyle = sky; g.fillRect(0, top, W, vh);
      const sway = Math.sin(t * 0.6) * 12;
      g.fillStyle = '#fff6c9'; g.beginPath(); g.arc(W * 0.72 + sway * 0.3, top + vh * 0.25, 26, 0, 7); g.fill();
      g.fillStyle = '#6f8fb8'; g.beginPath(); g.moveTo(-20, top + vh * 0.7); g.lineTo(W * 0.3 + sway, top + vh * 0.42); g.lineTo(W * 0.6 + sway, top + vh * 0.62); g.lineTo(W * 0.85 + sway, top + vh * 0.48); g.lineTo(W + 20, top + vh * 0.7); g.lineTo(W + 20, top + vh); g.lineTo(-20, top + vh); g.fill();
      g.fillStyle = '#3f7d4a'; g.beginPath(); g.moveTo(-20, top + vh * 0.8); g.quadraticCurveTo(W * 0.5 + sway * 2, top + vh * 0.62, W + 20, top + vh * 0.82); g.lineTo(W + 20, top + vh); g.lineTo(-20, top + vh); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 0.8;
      for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(W * i / 3, top); g.lineTo(W * i / 3, top + vh); g.stroke(); g.beginPath(); g.moveTo(0, top + vh * i / 3); g.lineTo(W, top + vh * i / 3); g.stroke(); }
      if (this.shot && t - this.shot < 0.25) { g.fillStyle = `rgba(255,255,255,${1 - (t - this.shot) / 0.25})`; g.fillRect(0, top, W, vh); }
      g.restore();
      // 控件
      g.fillStyle = '#ffd60a'; g.font = F(600, 13); g.textAlign = 'center'; g.textBaseline = 'middle';
      const modes = ['延时摄影', '视频', '照片', '人像', '全景'];
      const my = top + vh + 22; modes.forEach((m, i) => { g.fillStyle = i === 2 ? '#ffd60a' : '#fff'; g.fillText(m, W / 2 + (i - 2) * 64, my); });
      if (this.modern) { g.fillStyle = 'rgba(255,255,255,0.15)'; rr(g, W / 2 - 66, top + vh - 46, 132, 32, 16); g.fill(); g.fillStyle = '#fff'; g.font = F(600, 12); ['.5', '1×', '2', '4'].forEach((z, i) => { g.fillStyle = i === 1 ? '#ffd60a' : '#fff'; g.fillText(z, W / 2 - 48 + i * 32, top + vh - 30); }); }
      const sy = H - (this.modern ? 100 : 52);
      g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(W / 2, sy, 33, 0, 7); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, sy, 27, 0, 7); g.fill();
      const last = this.photos[0];
      if (last) { g.fillStyle = `hsl(${last.h},60%,55%)`; rr(g, 34, sy - 22, 44, 44, 8); g.fill(); } else { g.strokeStyle = '#555'; g.lineWidth = 1; rr(g, 34, sy - 22, 44, 44, 8); g.stroke(); }
      this.shutterPos = { x: W / 2, y: sy };
      if (this.modern) this.statusBar(g, '#fff', 'app');
      else { g.fillStyle = '#fff'; g.font = F(600, 14); g.fillText('⚡ 自动', 44, 32); }
    }
    shutter() { this.shot = this.t; this.photos.unshift({ h: Math.floor(Math.random() * 360), l: 50 }); }

    appTap(x, y) {
      const k = this.app;
      if (k === 'calc') { for (const b of this.calcKeys()) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) this.calcPress(b.k); }
      else if (k === 'camera' && this.shutterPos && Math.hypot(x - this.shutterPos.x, y - this.shutterPos.y) < 38) this.shutter();
      else if (k === 'phone' && this.phoneKeys) {
        const p = this.phoneKeys;
        p.keys.forEach((kk, i) => { const bx = p.gx + ((i % 3) - 1) * p.r * 2.6, by = p.top + Math.floor(i / 3) * p.r * 2.4; if (Math.hypot(x - bx, y - by) < p.r) this.dial = (this.dial + kk).slice(-13); });
        if (Math.hypot(x - p.gx, y - p.cy) < p.r) this.dial = this.dial ? '' : '10086';
      } else if ((k === 'music' || k === 'ipod') && this.musicBtn && Math.hypot(x - this.musicBtn.x, y - this.musicBtn.y) < 30) this.playing = !this.playing;
    }

    // ---------- HUD ----------
    drawHUD(g) {
      const W = this.W, H = this.H, h = this.hud, e = this.t - h.t0;
      if (e > 1.6) { this.hud = null; return; }
      const a = clamp(e / 0.12, 0, 1) * clamp((1.6 - e) / 0.3, 0, 1);
      g.save(); g.globalAlpha = a;
      if (this.isl && h.type === 'mute') { g.restore(); return; }
      if (this.osv >= 13) {
        if (h.type === 'vol') {
          const x = 10, y = H * 0.18, w = 44 * 0 + 12, hh = 150;
          g.fillStyle = 'rgba(40,40,40,0.55)'; rr(g, x, y, w, hh, 6); g.fill();
          g.fillStyle = '#fff'; rr(g, x, y + hh * (1 - this.vol), w, hh * this.vol, 6); g.fill();
        } else {
          const w = 170, x = W / 2 - w / 2, y = this.notch ? 44 : 30;
          g.fillStyle = 'rgba(30,30,30,0.85)'; rr(g, x, y, w, 40, 20); g.fill();
          g.fillStyle = this.muted ? '#ff453a' : '#fff'; g.font = F(600, 14); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(this.muted ? '🔕 静音模式 开' : '🔔 响铃', W / 2, y + 20);
        }
      } else {
        const s = 154, x = W / 2 - s / 2, y = H / 2 - s / 2 - 20;
        g.fillStyle = this.skeuo ? 'rgba(0,0,0,0.55)' : 'rgba(235,235,235,0.92)'; rr(g, x, y, s, s, 14); g.fill();
        const fg = this.skeuo ? '#fff' : '#333';
        g.fillStyle = fg; g.strokeStyle = fg;
        if (h.type === 'vol' || (h.type === 'mute' && !this.muted)) {
          // 喇叭/铃铛
          g.beginPath(); g.moveTo(W / 2 - 22, y + 50); g.lineTo(W / 2 - 12, y + 50); g.lineTo(W / 2 + 4, y + 36); g.lineTo(W / 2 + 4, y + 84); g.lineTo(W / 2 - 12, y + 70); g.lineTo(W / 2 - 22, y + 70); g.fill();
          g.lineWidth = 3; g.beginPath(); g.arc(W / 2 + 6, y + 60, 12, -0.8, 0.8); g.stroke(); g.beginPath(); g.arc(W / 2 + 6, y + 60, 20, -0.8, 0.8); g.stroke();
        } else {
          g.beginPath(); g.moveTo(W / 2 - 20, y + 74); g.quadraticCurveTo(W / 2 - 18, y + 36, W / 2, y + 36); g.quadraticCurveTo(W / 2 + 18, y + 36, W / 2 + 20, y + 74); g.closePath(); g.fill();
          g.strokeStyle = '#ff3b30'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2 - 28, y + 30); g.lineTo(W / 2 + 28, y + 86); g.stroke();
        }
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = F(600, 14); g.fillStyle = fg;
        if (h.type === 'vol') {
          g.fillText('铃声', W / 2, y + 112);
          const n = 16, bw = (s - 32) / n;
          for (let i = 0; i < n; i++) { g.globalAlpha = a * (i < Math.round(this.vol * n) ? 1 : 0.25); g.fillRect(x + 16 + i * bw, y + 128, bw - 1.5, 6); }
        } else g.fillText(this.muted ? '静音' : '响铃', W / 2, y + 118);
      }
      g.restore();
    }

    drawPowerMenu(g) {
      const W = this.W, H = this.H;
      g.fillStyle = 'rgba(0,0,0,0.62)'; g.fillRect(0, 0, W, H);
      const k = this.pmKnobRect(), ty = k.y - 4, tw = W - 40;
      g.fillStyle = this.skeuo ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.22)'; rr(g, 20, ty, tw, 64, this.skeuo ? 10 : 32); g.fill();
      g.fillStyle = '#fff'; g.font = F(400, 18); g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = 1 - this.pmKnob;
      g.fillText('滑动来关机', W / 2 + 26, ty + 32); g.globalAlpha = 1;
      if (this.skeuo) { const gr = g.createLinearGradient(0, k.y, 0, k.y + k.h); gr.addColorStop(0, '#ff6a5c'); gr.addColorStop(1, '#c4180c'); g.fillStyle = gr; rr(g, k.x, k.y, k.w, k.h, 8); g.fill(); }
      else { g.fillStyle = '#fff'; g.beginPath(); g.arc(k.x + k.w / 2, k.y + k.h / 2, k.w / 2, 0, 7); g.fill(); }
      g.strokeStyle = this.skeuo ? '#fff' : '#ff3b30'; g.lineWidth = 3; g.lineCap = 'round';
      const cx = k.x + k.w / 2, cy = k.y + k.h / 2; g.beginPath(); g.arc(cx, cy + 1, 11, -Math.PI * 0.32, Math.PI * 1.32); g.stroke(); g.beginPath(); g.moveTo(cx, cy - 13); g.lineTo(cx, cy - 2); g.stroke();
      const c = this.pmCancelRect();
      if (this.skeuo) { const gr = g.createLinearGradient(0, c.y, 0, c.y + c.h); gr.addColorStop(0, '#6a6a6a'); gr.addColorStop(1, '#2a2a2a'); g.fillStyle = gr; rr(g, c.x, c.y, c.w, c.h, 10); g.fill(); g.fillStyle = '#fff'; g.font = F(700, 18); g.fillText('取消', W / 2, c.y + c.h / 2); }
      else { g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.arc(W / 2, c.y + c.h / 2, c.w / 2, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(W / 2 - 9, c.y + c.h / 2 - 9); g.lineTo(W / 2 + 9, c.y + c.h / 2 + 9); g.moveTo(W / 2 + 9, c.y + c.h / 2 - 9); g.lineTo(W / 2 - 9, c.y + c.h / 2 + 9); g.stroke(); g.fillStyle = '#fff'; g.font = F(400, 14); g.fillText('取消', W / 2, c.y + c.h + 16); }
    }

    // ---------- 刘海 / 灵动岛 ----------
    drawCutout(g) {
      const W = this.W;
      if (this.notch) {
        const [nw, nh] = this.notch, x0 = (W - nw) / 2, x1 = (W + nw) / 2;
        g.fillStyle = '#000'; g.beginPath();
        g.moveTo(x0 - 6, 0); g.quadraticCurveTo(x0, 0, x0, 6); g.lineTo(x0, nh - 20); g.quadraticCurveTo(x0, nh, x0 + 20, nh);
        g.lineTo(x1 - 20, nh); g.quadraticCurveTo(x1, nh, x1, nh - 20); g.lineTo(x1, 6); g.quadraticCurveTo(x1, 0, x1 + 6, 0); g.closePath(); g.fill();
      }
      if (this.isl) {
        const I = this.isl, top = this.island[2], x = W / 2 - I.w / 2;
        g.fillStyle = '#000'; rr(g, x, top, I.w, I.h, I.h / 2); g.fill();
        // 摄像头镜片反光
        g.fillStyle = '#0d1020'; g.beginPath(); g.arc(W / 2 + this.island[0] / 2 - this.island[1] / 2, top + this.island[1] / 2, this.island[1] * 0.2, 0, 7); g.fill();
        const e = this.t - (I.modeT || 0);
        if (I.mode && I.w > this.island[0] + 20) {
          g.save(); g.globalAlpha = clamp(e / 0.25, 0, 1); g.textBaseline = 'middle';
          const cy = top + I.h / 2;
          if (I.mode === 'unlock') { g.fillStyle = '#fff'; this.padlock(g, x + 22, cy, 5.5, e > 0.3); }
          if (I.mode === 'mute') {
            g.fillStyle = this.muted ? '#ff453a' : '#fff'; g.beginPath(); g.arc(x + 24, cy, 12, 0, 7); g.globalAlpha *= 0.25; g.fill(); g.globalAlpha = clamp(e / 0.25, 0, 1);
            g.font = F(600, 13); g.textAlign = 'center'; g.fillText(this.muted ? '🔕' : '🔔', x + 24, cy + 1);
            g.textAlign = 'right'; g.fillStyle = this.muted ? '#ff453a' : '#fff'; g.fillText(this.muted ? '静音模式' : '响铃', x + I.w - 18, cy + 1);
          }
          if (I.mode === 'flash') { g.fillStyle = '#ffd60a'; g.font = F(600, 13); g.textAlign = 'left'; g.fillText('🔦 手电筒' + (this.flashlight ? '已打开' : ''), x + 16, cy + 1); }
          g.restore();
        }
      }
    }
  }

  window.PhoneOS = PhoneOS;
})();

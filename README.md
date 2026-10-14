# 📱 iPhone 博物馆

一个纯前端的 **iPhone 3D 交互博物馆**：从 2007 年的初代 iPhone 到 2026 年的最新机型，共 **27 件展品**，全部在浏览器里**实时程序化建模**，机身比例与真机一致。你可以旋转每一台手机、按下它的电源键、滑动解锁，甚至用屏幕里的计算器算数、用相机拍照。

无需安装、无需构建、无需任何后端 —— 克隆下来直接用浏览器打开即可。

## ✨ 功能亮点

- **3D 实时建模**：所有机身（圆角轮廓、边框截面、镜头、按键、接口、Logo）均由代码按毫米级真实尺寸生成，不依赖任何模型文件。
- **可交互的模拟系统**：开机动画、锁屏、主屏幕、App 全都有 —— 计算器能计算、相机能拍照、电话能拨号、音乐能暂停。
- **还原各代解锁方式**：iOS 1–6 拖动滑块、iOS 7–9 向右滑、iPhone 7/8 按主屏幕按钮（Touch ID）、全面屏机型底部上滑（Face ID）。
- **实体按键全部可用**：电源键、主屏幕按钮、音量键、静音拨片（真的会拨动）、操作按钮、相机控制。
- **全家福 · 尺寸对比模式**：27 台手机一字排开，滚轮/拖动浏览，直观对比历代尺寸变化。
- **多视角观察**：正面 / 背面 / 侧面 / 斜视 / 底部，空闲时自动旋转。
- **折叠屏 iPhone Duo**：支持展开/合上，界面在 5.4 英寸外屏与 7.6 英寸内屏之间自动切换。
- **翔实的展品资料**：每台机型附有发布故事、核心亮点、芯片/内存/存储/相机/售价等完整规格。

## 🖥️ 快速开始

本项目是纯静态网站，无需构建：

```bash
git clone https://github.com/ns2250225/iphones.git
cd iphones
```

然后任选一种方式打开：

- **直接双击 `index.html`**（推荐 Chrome / Edge）；
- 或启动一个本地服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

访问 `http://localhost:8080` 即可入馆。

> ⚠️ 页面通过 CDN 加载 Three.js（three@0.147.0），首次打开需要联网。

## 🎮 操作说明

| 操作 | 方式 |
| --- | --- |
| 旋转 / 缩放 | 鼠标拖动旋转，滚轮缩放 |
| 切换视角 | 右上角按钮：正面 / 背面 / 侧面 / 斜视 / 底部 |
| 开机 | 点击 3D 机身上的电源键（老机型在顶部，iPhone 6 起在右侧），或点下方「电源键」 |
| 锁屏 / 关机 | 再次单击电源键锁屏；**长按**弹出「滑动来关机」 |
| 解锁 | 与真机一致：拖滑块（iOS 1–6）/ 右滑（iOS 7–9）/ 按 Home 键（Touch ID）/ 底部上滑（Face ID） |
| 操作屏幕 | 开机后可直接点按、滑动 3D 屏幕 |
| 切换展品 | 左侧时间轴，或键盘 `←` `→` |
| 展开折叠屏 | 「展开」按钮或键盘 `F` |

**键盘快捷键**：`←` `→` 切换展品 · `P` 电源键 · `H` 主屏幕 · `F` 开合折叠屏

## 🗂️ 项目结构

```
iphones/
├── index.html        # 页面入口
├── css/
│   └── style.css     # 展馆界面样式
└── js/
    ├── data.js       # 27 台机型的展品数据（尺寸、规格、配色、文案）
    ├── model.js      # 程序化 3D 建模（机身、按键、镜头、Logo 等）
    ├── os.js         # 屏幕系统模拟（开机/锁屏/主屏幕/App）
    └── app.js        # 场景、灯光、交互与界面逻辑
```

## 🏛️ 展品清单

| 年代 | 展品 |
| --- | --- |
| 2007–2009 | iPhone · iPhone 3G · iPhone 3GS |
| 2010–2013 | iPhone 4 · iPhone 4S · iPhone 5 · iPhone 5c · iPhone 5s |
| 2014–2016 | iPhone 6 · iPhone 6s · iPhone SE（一代）· iPhone 7 · iPhone 8 |
| 2017–2019 | iPhone X · iPhone XR · iPhone XS · iPhone 11 · iPhone 11 Pro |
| 2020–2022 | iPhone 12 · iPhone 13 · iPhone 14 Pro · iPhone 15 Pro |
| 2023–2026 | iPhone 16 Pro · iPhone 17 Pro · iPhone Air · iPhone 18 Pro · iPhone Duo（折叠屏） |

## 🛠️ 技术栈

- [Three.js](https://threejs.org/)（WebGL 渲染、OrbitControls 轨道控制、RoomEnvironment 环境光照）
- 原生 JavaScript / Canvas 2D（屏幕系统逐帧绘制为纹理）
- 纯静态，零依赖、零构建

## 📚 数据来源

所有机型的尺寸、重量、屏幕、芯片等参数均整理自公开资料：Apple 官方技术规格、Wikipedia、GSMArena 等。项目仅用于学习与展示，Apple、iPhone 为 Apple Inc. 的商标。

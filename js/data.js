/*
 * iPhone 博物馆 —— 展品数据
 * 尺寸/重量参考 Apple 官方技术规格、Wikipedia 与 GSMArena 等公开资料。
 * 建模参数单位均为毫米(mm)。
 * 背面坐标(rear)以"从背面看"的左上角为原点：x 向右，y 向下。
 * 侧键位置(buttons)以"距离顶部"的毫米数表示。
 */
window.PHONES = [
  {
    id: 'iphone', name: 'iPhone', nick: '初代 iPhone', year: 2007, date: '2007-06-29',
    tagline: '“今天，Apple 重新发明了手机。”',
    dims: [115, 61, 11.6], weight: 135,
    display: { inch: 3.5, pts: [320, 480], res: '480 × 320', ppi: 163, tech: 'LCD 多点触控', r: 0, y: 0.6 },
    corner: 9, exp: 2, profile: 'pillow', pillow: { back: 4.2, z: 1.7 },
    front: { home: 'square', homeD: 11, ear: [12, 1.3], cam: null },
    rear: { lenses: [{ x: 8.5, y: 8.5, d: 5, flush: true }] },
    buttons: { power: 'top', powerX: 13, powerLen: 10, mute: 'switch', muteY: 14, vol: 'rocker', volY: [26, 33] },
    port: '30pin', jack: 'top-recessed',
    back: { style: '2007', logoY: 0.36, text: true },
    frameMat: 'aluminum', backMat: 'aluminum', bezel: true,
    os: 'iPhone OS 1.0', osv: 1,
    colors: [{ name: '银色铝金属', frame: '#c4c6c9', back: '#c9cbce', front: 'black' }],
    chip: 'Samsung S5L8900（ARM11 412 MHz）', ram: '128 MB', storage: '4 / 8 / 16 GB',
    camera: '200 万像素', frontCamera: '无', material: '阳极氧化铝背壳 + 黑色塑料底盖', connector: '30 针基座接口', network: 'GSM / EDGE（2G）',
    price: '$499 起',
    intro: [
      '2007 年 1 月 9 日，史蒂夫·乔布斯在 Macworld 大会上说要发布“一台宽屏 iPod、一部革命性的手机和一台突破性的互联网通信设备”，随后揭晓这三者其实是同一台设备，也就是 iPhone。',
      '它去掉了当时智能手机上的全键盘和手写笔，用一块 3.5 英寸多点触控屏和一枚主屏幕按钮完成所有操作。“滑动来解锁”、双指缩放、惯性滚动这些交互，后来成了所有智能手机的基本语言。',
      '初代 iPhone 只支持 2G 网络，不能安装第三方应用，也不能录像，但它定义了此后十几年手机的样子。背面上部是铝金属，底部的黑色塑料则是为了让天线信号通过。'
    ],
    highlights: ['多点触控 + 主屏幕按钮的全新交互', '完整网页的 Safari 浏览器', '可视语音信箱', '“滑动来解锁”']
  },
  {
    id: 'iphone-3g', name: 'iPhone 3G', year: 2008, date: '2008-07-11',
    tagline: '速度翻倍，价格减半。',
    dims: [115.5, 62.1, 12.3], weight: 133,
    display: { inch: 3.5, pts: [320, 480], res: '480 × 320', ppi: 163, tech: 'LCD 多点触控', r: 0, y: 0.6 },
    corner: 9.5, exp: 2, profile: 'pillow', pillow: { back: 6.8, z: 1.5 },
    front: { home: 'square', homeD: 11, ear: [12, 1.3], cam: null },
    rear: { lenses: [{ x: 9.5, y: 9.5, d: 5.5, flush: true }] },
    buttons: { power: 'top', powerX: 13, powerLen: 10, mute: 'switch', muteY: 14, vol: 'round2', volY: [25, 34] },
    port: '30pin', jack: 'top',
    back: { style: 'plastic', logoY: 0.38, text: true, logoColor: '#bdbdbd' },
    frameMat: 'chrome', backMat: 'plasticGloss', bezel: true,
    os: 'iPhone OS 2.0', osv: 2,
    colors: [
      { name: '黑色', frame: '#1a1a1a', back: '#121214', front: 'black' },
      { name: '白色', frame: '#f2f2f2', back: '#f4f4f2', front: 'black' }
    ],
    chip: 'Samsung S5L8900（ARM11 412 MHz）', ram: '128 MB', storage: '8 / 16 GB',
    camera: '200 万像素', frontCamera: '无', material: '聚碳酸酯塑料背壳', connector: '30 针基座接口', network: '3G (UMTS/HSDPA)',
    price: '$199 起（合约）',
    intro: [
      '第二代 iPhone 加入了 3G 网络和 GPS，背壳从铝换成了更利于信号的弧面塑料，有黑白两种颜色。',
      '真正改变历史的是同期上线的 App Store。最初只有 500 个应用，上线三天下载量就突破 1000 万。从此手机变成了一个可以无限扩展的平台，“移动应用开发者”也成了一个行业。',
      '2009 年 10 月，中国联通将 iPhone 3G 与 3GS 正式引入中国大陆。'
    ],
    highlights: ['App Store 上线', '3G 网络与 A-GPS', '黑白双色弧面塑料机身', '合约价 $199']
  },
  {
    id: 'iphone-3gs', name: 'iPhone 3GS', year: 2009, date: '2009-06-19',
    tagline: '“S” 代表 Speed。',
    dims: [115.5, 62.1, 12.3], weight: 135,
    display: { inch: 3.5, pts: [320, 480], res: '480 × 320', ppi: 163, tech: 'LCD（防油污涂层）', r: 0, y: 0.6 },
    corner: 9.5, exp: 2, profile: 'pillow', pillow: { back: 6.8, z: 1.5 },
    front: { home: 'square', homeD: 11, ear: [12, 1.3], cam: null },
    rear: { lenses: [{ x: 9.5, y: 9.5, d: 5.5, flush: true }] },
    buttons: { power: 'top', powerX: 13, powerLen: 10, mute: 'switch', muteY: 14, vol: 'round2', volY: [25, 34] },
    port: '30pin', jack: 'top',
    back: { style: 'plastic', logoY: 0.38, text: true, logoColor: '#d8d8d8', shinyText: true },
    frameMat: 'chrome', backMat: 'plasticGloss', bezel: true,
    os: 'iPhone OS 3.0', osv: 3,
    colors: [
      { name: '黑色', frame: '#1a1a1a', back: '#0f0f11', front: 'black' },
      { name: '白色', frame: '#f2f2f2', back: '#f6f6f4', front: 'black' }
    ],
    chip: 'Samsung S5PC100（Cortex-A8 600 MHz）', ram: '256 MB', storage: '8 / 16 / 32 GB',
    camera: '300 万像素自动对焦，可录制 VGA 视频', frontCamera: '无', material: '聚碳酸酯塑料背壳', connector: '30 针基座接口', network: '3G (HSDPA 7.2 Mbps)',
    price: '$199 起（合约）',
    intro: [
      'iPhone 3GS 外观几乎与 3G 一样，背面的 Apple 标志和文字换成了更亮的镀铬色，变化都在内部。Cortex-A8 处理器和翻倍的内存让应用启动速度大约快了一倍，“S”就是 Speed 的意思。',
      '它第一次让 iPhone 能拍视频、语音控制和使用电子罗盘，还支持复制粘贴和彩信（iPhone OS 3.0）。',
      '3GS 一直卖到 2012 年，是在售时间最长的 iPhone 之一。'
    ],
    highlights: ['首款支持视频录制的 iPhone', '自动对焦相机', '语音控制与数字罗盘', '性能约为 3G 的两倍']
  },
  {
    id: 'iphone-4', name: 'iPhone 4', year: 2010, date: '2010-06-24',
    tagline: '这将再次改变一切。',
    dims: [115.2, 58.6, 9.3], weight: 137,
    display: { inch: 3.5, pts: [320, 480], res: '960 × 640', ppi: 326, tech: 'Retina 视网膜 IPS LCD', r: 0, y: 0.3 },
    corner: 8.6, exp: 2, profile: 'flat4',
    front: { home: 'square', homeD: 10.5, ear: [11, 1.3], cam: { x: -9, y: 0 } },
    rear: { lenses: [{ x: 8, y: 8, d: 6, flush: true }], flash: [{ x: 16.5, y: 8, d: 3.6 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: '30pin', jack: 'top',
    back: { style: 'glass4', logoY: 0.38, text: true },
    frameMat: 'steel', backMat: 'glass', bandGaps: [['top', -12], ['bottom', -16], ['bottom', 16]],
    os: 'iOS 4.0', osv: 4,
    colors: [
      { name: '黑色', frame: '#bcbec0', back: '#0b0b0d', front: 'black' },
      { name: '白色', frame: '#c4c6c8', back: '#f4f4f2', front: 'white' }
    ],
    chip: 'Apple A4', ram: '512 MB', storage: '8 / 16 / 32 GB',
    camera: '500 万像素，720p 视频，LED 闪光灯', frontCamera: 'VGA（FaceTime）', material: '铝硅酸盐玻璃 + 不锈钢边框', connector: '30 针基座接口', network: '3G (HSUPA)',
    price: '$199 起（合约）',
    intro: [
      '前后两块玻璃夹着一圈不锈钢边框，这套“三明治”设计出自乔纳森·艾维团队，至今仍被许多人认为是最漂亮的 iPhone。',
      '它首次采用 326 ppi 的 Retina 显示屏，在正常距离下人眼分辨不出单个像素。第一次搭载 Apple 自研的 A4 芯片，第一次有前置摄像头和 FaceTime 视频通话。',
      '不锈钢边框本身就是天线，手握某个位置会导致信号下降，这就是著名的“天线门”，Apple 后来向用户免费赠送了保护边框。'
    ],
    highlights: ['Retina 视网膜显示屏', '首款 Apple 自研芯片 A4', 'FaceTime 视频通话', '不锈钢天线边框']
  },
  {
    id: 'iphone-4s', name: 'iPhone 4S', year: 2011, date: '2011-10-14',
    tagline: '你好，Siri。',
    dims: [115.2, 58.6, 9.3], weight: 140,
    display: { inch: 3.5, pts: [320, 480], res: '960 × 640', ppi: 326, tech: 'Retina 视网膜 IPS LCD', r: 0, y: 0.3 },
    corner: 8.6, exp: 2, profile: 'flat4',
    front: { home: 'square', homeD: 10.5, ear: [11, 1.3], cam: { x: -9, y: 0 } },
    rear: { lenses: [{ x: 8, y: 8, d: 6.4, flush: true }], flash: [{ x: 16.5, y: 8, d: 3.6 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: '30pin', jack: 'top',
    back: { style: 'glass4', logoY: 0.38, text: true },
    frameMat: 'steel', backMat: 'glass', bandGaps: [['left', 46], ['right', 46], ['bottom', -16], ['bottom', 16]],
    os: 'iOS 5.0', osv: 5,
    colors: [
      { name: '黑色', frame: '#bcbec0', back: '#0b0b0d', front: 'black' },
      { name: '白色', frame: '#c4c6c8', back: '#f4f4f2', front: 'white' }
    ],
    chip: 'Apple A5（双核）', ram: '512 MB', storage: '8 / 16 / 32 / 64 GB',
    camera: '800 万像素，1080p 视频', frontCamera: 'VGA', material: '玻璃 + 不锈钢边框', connector: '30 针基座接口', network: '3G (HSPA+ 14.4 Mbps)',
    price: '$199 起（合约）',
    intro: [
      'iPhone 4S 外观延续 iPhone 4，内部换成双核 A5 芯片，相机升级到 800 万像素，并改进了天线设计，可以在两组天线之间自动切换。',
      '最重要的新功能是语音助手 Siri。用户第一次可以用自然语言让手机定闹钟、查天气、发短信。',
      '它在 2011 年 10 月 4 日发布，第二天史蒂夫·乔布斯去世。坊间常把“4S”解读为“for Steve”。'
    ],
    highlights: ['Siri 语音助手', '双核 A5 芯片', '800 万像素 + 1080p 录像', '首发 iCloud 与 iOS 5']
  },
  {
    id: 'iphone-5', name: 'iPhone 5', year: 2012, date: '2012-09-21',
    tagline: 'iPhone 问世以来最大的变化。',
    dims: [123.8, 58.6, 7.6], weight: 112,
    display: { inch: 4, pts: [320, 568], res: '1136 × 640', ppi: 326, tech: 'Retina（In-Cell 触控）', r: 0, y: 0 },
    corner: 8.6, exp: 2, profile: 'chamfer',
    front: { home: 'square', homeD: 10.5, ear: [10, 1.2], cam: { x: 0, y: 3.4 } },
    rear: { lenses: [{ x: 8.3, y: 8.3, d: 6.6, flush: true }], flash: [{ x: 19.5, y: 8.3, d: 4 }], mic: [{ x: 14.2, y: 8.3 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: 'lightning', jack: 'bottom',
    back: { style: 'two-tone', logoY: 0.38, text: true, strips: [16.5, 14] },
    frameMat: 'aluminum', backMat: 'aluminum',
    os: 'iOS 6.0', osv: 6,
    colors: [
      { name: '黑色与石板色', frame: '#3b3b3e', back: '#38383b', strip: '#141416', front: 'black', chamfer: '#7a7b80' },
      { name: '白色与银色', frame: '#d4d5d8', back: '#d6d7da', strip: '#f2f2f0', front: 'white', chamfer: '#eceef0' }
    ],
    chip: 'Apple A6', ram: '1 GB', storage: '16 / 32 / 64 GB',
    camera: '800 万像素，蓝宝石镜头保护', frontCamera: '120 万像素 720p', material: '一体成型铝合金 + 钻石切割倒角', connector: 'Lightning', network: '4G LTE',
    price: '$199 起（合约）',
    intro: [
      'iPhone 5 第一次把屏幕加长到 4 英寸，主屏幕多出一排图标。机身厚 7.6 毫米、重 112 克，在当时是最轻薄的 iPhone。',
      '铝合金机身边缘做了钻石切割的倒角，背面上下两块玻璃饰条是为了让天线信号通过。它首次支持 4G LTE，还用正反都能插的 Lightning 接口替换了用了将近十年的 30 针接口。',
      '同期推出的 EarPods 耳机，以及首发时饱受批评的 Apple 地图，也都出自这一年。'
    ],
    highlights: ['4 英寸 16:9 屏幕', 'Lightning 接口', '4G LTE', '钻石切割倒角工艺']
  },
  {
    id: 'iphone-5c', name: 'iPhone 5c', year: 2013, date: '2013-09-20',
    tagline: '为色彩而生。',
    dims: [124.4, 59.2, 8.97], weight: 132,
    display: { inch: 4, pts: [320, 568], res: '1136 × 640', ppi: 326, tech: 'Retina', r: 0, y: 0 },
    corner: 9.5, exp: 2, profile: 'plastic',
    front: { home: 'square', homeD: 10.5, ear: [10, 1.2], cam: { x: 0, y: 3.4 } },
    rear: { lenses: [{ x: 8.6, y: 8.6, d: 6.8, flush: true }], flash: [{ x: 19, y: 8.6, d: 4 }], mic: [{ x: 14, y: 8.6 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: 'lightning', jack: 'bottom',
    back: { style: 'plastic', logoY: 0.36, text: true, matchText: true },
    frameMat: 'plasticGloss', backMat: 'plasticGloss',
    os: 'iOS 7.0', osv: 7,
    colors: [
      { name: '蓝色', frame: '#46a5e5', back: '#46a5e5', front: 'black' },
      { name: '绿色', frame: '#9fd66b', back: '#9fd66b', front: 'black' },
      { name: '粉色', frame: '#f5868a', back: '#f5868a', front: 'black' },
      { name: '黄色', frame: '#f6e26a', back: '#f6e26a', front: 'black' },
      { name: '白色', frame: '#f4f4f0', back: '#f4f4f0', front: 'black' }
    ],
    chip: 'Apple A6', ram: '1 GB', storage: '8 / 16 / 32 GB',
    camera: '800 万像素', frontCamera: '120 万像素 FaceTime HD', material: '一体成型硬质聚碳酸酯 + 钢质加强框架', connector: 'Lightning', network: '4G LTE',
    price: '$99 起（合约）',
    intro: [
      'iPhone 5c 用硬质聚碳酸酯整体成型，内部有一层钢质加强结构，有蓝、绿、粉、黄、白五种鲜艳颜色。这是 Apple 第一次在同一年发布两款新 iPhone。',
      '它和同期发布的 iOS 7 一起登场。iOS 7 抛弃了沿用六年的拟物化设计，改用扁平、半透明的视觉语言，和 5c 的多彩机身很搭。',
      '5c 的销量没有达到预期，但它确立的“多彩机身”路线后来在 iPhone XR、11、12 上延续了下来。'
    ],
    highlights: ['五种机身颜色', '一体成型聚碳酸酯', '随 iOS 7 一起推出', '首次一年两款新机']
  },
  {
    id: 'iphone-5s', name: 'iPhone 5s', year: 2013, date: '2013-09-20',
    tagline: '超前，超越前。',
    dims: [123.8, 58.6, 7.6], weight: 112,
    display: { inch: 4, pts: [320, 568], res: '1136 × 640', ppi: 326, tech: 'Retina', r: 0, y: 0 },
    corner: 8.6, exp: 2, profile: 'chamfer',
    front: { home: 'ring', homeD: 10.5, ear: [10, 1.2], cam: { x: 0, y: 3.4 } },
    rear: { lenses: [{ x: 8.3, y: 8.3, d: 7.2, flush: true }], flash: [{ x: 19.8, y: 8.3, w: 4, h: 6.6 }], mic: [{ x: 14.5, y: 8.3 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: 'lightning', jack: 'bottom',
    back: { style: 'two-tone', logoY: 0.38, text: true, strips: [16.5, 14] },
    frameMat: 'aluminum', backMat: 'aluminum', touchID: true,
    os: 'iOS 7.0', osv: 7,
    colors: [
      { name: '金色', frame: '#e3d3b6', back: '#e6d6ba', strip: '#f3efe6', front: 'white', chamfer: '#f5ecd8' },
      { name: '银色', frame: '#d6d7da', back: '#d8d9dc', strip: '#f2f2f0', front: 'white', chamfer: '#eef0f2' },
      { name: '深空灰色', frame: '#4c4c50', back: '#505055', strip: '#1a1a1c', front: 'black', chamfer: '#8a8b90' }
    ],
    chip: 'Apple A7（首款 64 位）+ M7 协处理器', ram: '1 GB', storage: '16 / 32 / 64 GB',
    camera: '800 万像素 ƒ/2.2，True Tone 双色闪光灯，120fps 慢动作', frontCamera: '120 万像素', material: '铝合金 + 蓝宝石水晶主屏幕按钮', connector: 'Lightning', network: '4G LTE',
    price: '$199 起（合约）',
    intro: [
      'iPhone 5s 的主屏幕按钮里集成了 Touch ID 指纹识别，外圈一枚不锈钢环负责感应手指，盖板是蓝宝石水晶。从此解锁和付款只要按一下手指。',
      'A7 是全球第一款用在智能手机上的 64 位处理器，当时让整个行业都感到意外。另外搭配了专门处理运动数据的 M7 协处理器。',
      '金色款在中国大受欢迎，被网友称为“土豪金”。'
    ],
    highlights: ['Touch ID 指纹识别', '首款 64 位手机芯片 A7', 'True Tone 双色温闪光灯', '“土豪金”配色']
  },
  {
    id: 'iphone-6', name: 'iPhone 6', year: 2014, date: '2014-09-19',
    tagline: '岂止于大。',
    dims: [138.1, 67.0, 6.9], weight: 129,
    display: { inch: 4.7, pts: [375, 667], res: '1334 × 750', ppi: 326, tech: 'Retina HD', r: 0, y: 0 },
    corner: 10, exp: 2.1, profile: 'round', round: { f: 1.9, b: 2.3, n: 2.3 },
    front: { home: 'ring', homeD: 11, ear: [10, 1.3], cam: { x: -8.5, y: 0 } },
    rear: { lenses: [{ x: 9.6, y: 9.6, d: 7.2, ring: 9, bump: 0.75 }], flash: [{ x: 20.5, y: 9.6, w: 4, h: 6.8 }], mic: [{ x: 15.5, y: 9.6 }] },
    buttons: { power: 'side', powerY: 36, powerLen: 11, mute: 'switch', muteY: 18, vol: 'pill', volY: [33, 46], volLen: 9 },
    port: 'lightning', jack: 'bottom',
    back: { style: 'alu6', logoY: 0.4, text: true, antenna: 'band' },
    frameMat: 'aluminum', backMat: 'aluminum', touchID: true,
    os: 'iOS 8.0', osv: 8,
    colors: [
      { name: '深空灰色', frame: '#5c5d61', back: '#5f6065', front: 'black', strip: '#3e3f43' },
      { name: '银色', frame: '#d7d8db', back: '#dadbde', front: 'white', strip: '#f0f0f0' },
      { name: '金色', frame: '#e0cfb2', back: '#e3d2b5', front: 'white', strip: '#f2ece0' }
    ],
    chip: 'Apple A8 + M8', ram: '1 GB', storage: '16 / 64 / 128 GB',
    camera: '800 万像素，Focus Pixels 相位对焦，240fps 慢动作', frontCamera: '120 万像素', material: '6000 系列阳极氧化铝 + 2.5D 弧面玻璃', connector: 'Lightning', network: '4G LTE（VoLTE）',
    price: '$199 起（合约）/ $649 起（无锁）',
    intro: [
      'iPhone 6 和 6 Plus 一次性把屏幕放大到 4.7 英寸和 5.5 英寸，回应了用户对大屏的强烈需求，口号是“岂止于大”。',
      '机身改用 6.9 毫米厚的圆润铝合金，屏幕玻璃边缘带 2.5D 弧度，和金属边框自然衔接。背面的塑料注塑条是天线的位置，电源键也从顶部移到了右侧。',
      'iPhone 6 系列是史上最畅销的 iPhone，总销量超过 2 亿部。它首发 NFC 和 Apple Pay，但 6 Plus 也带来了“弯曲门”的争议。'
    ],
    highlights: ['4.7 / 5.5 英寸大屏', '史上最畅销的 iPhone', 'Apple Pay（NFC）', '电源键移至右侧']
  },
  {
    id: 'iphone-6s', name: 'iPhone 6s', year: 2015, date: '2015-09-25',
    tagline: '唯一的不同，是处处都不同。',
    dims: [138.3, 67.1, 7.1], weight: 143,
    display: { inch: 4.7, pts: [375, 667], res: '1334 × 750', ppi: 326, tech: 'Retina HD + 3D Touch', r: 0, y: 0 },
    corner: 10, exp: 2.1, profile: 'round', round: { f: 1.9, b: 2.3, n: 2.3 },
    front: { home: 'ring', homeD: 11, ear: [10, 1.3], cam: { x: -8.5, y: 0 } },
    rear: { lenses: [{ x: 9.6, y: 9.6, d: 7.4, ring: 9.2, bump: 0.8 }], flash: [{ x: 20.5, y: 9.6, w: 4, h: 6.8 }], mic: [{ x: 15.5, y: 9.6 }] },
    buttons: { power: 'side', powerY: 36, powerLen: 11, mute: 'switch', muteY: 18, vol: 'pill', volY: [33, 46], volLen: 9 },
    port: 'lightning', jack: 'bottom',
    back: { style: 'alu6', logoY: 0.4, text: true, antenna: 'band', mark: 'S' },
    frameMat: 'aluminum', backMat: 'aluminum', touchID: true,
    os: 'iOS 9.0', osv: 9,
    colors: [
      { name: '玫瑰金色', frame: '#e6bfb3', back: '#e8c3b7', front: 'white', strip: '#f3e5df' },
      { name: '金色', frame: '#e0cfb2', back: '#e3d2b5', front: 'white', strip: '#f2ece0' },
      { name: '银色', frame: '#d7d8db', back: '#dadbde', front: 'white', strip: '#f0f0f0' },
      { name: '深空灰色', frame: '#5c5d61', back: '#5f6065', front: 'black', strip: '#3e3f43' }
    ],
    chip: 'Apple A9', ram: '2 GB', storage: '16 / 32 / 64 / 128 GB',
    camera: '1200 万像素，4K 视频，Live Photos', frontCamera: '500 万像素 + 视网膜闪光灯', material: '7000 系列铝合金', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$649 起',
    intro: [
      'iPhone 6s 外观与 6 几乎一样，背面多了一个“S”标识。机身换成强度更高的 7000 系列航空铝合金，回应了上一代的“弯曲门”。',
      '新增的 3D Touch 能感知按压力度，轻压预览、重压打开。Live Photos 会在照片前后各录下 1.5 秒的动态画面。相机升级到 1200 万像素并支持 4K 视频。',
      '这一代还带来了玫瑰金配色。它的性能和续航都很耐用，许多人一用就是五六年，一直支持到 iOS 15。'
    ],
    highlights: ['3D Touch 压力触控', 'Live Photos 实况照片', '1200 万像素 + 4K', '玫瑰金配色']
  },
  {
    id: 'iphone-se', name: 'iPhone SE', nick: 'iPhone SE（第一代）', year: 2016, date: '2016-03-31',
    tagline: '小身材，大能量。',
    dims: [123.8, 58.6, 7.6], weight: 113,
    display: { inch: 4, pts: [320, 568], res: '1136 × 640', ppi: 326, tech: 'Retina', r: 0, y: 0 },
    corner: 8.6, exp: 2, profile: 'chamfer', matteChamfer: true,
    front: { home: 'ring', homeD: 10.5, ear: [10, 1.2], cam: { x: 0, y: 3.4 } },
    rear: { lenses: [{ x: 8.3, y: 8.3, d: 7.2, flush: true }], flash: [{ x: 19.8, y: 8.3, w: 4, h: 6.6 }], mic: [{ x: 14.5, y: 8.3 }] },
    buttons: { power: 'top', powerX: 12, powerLen: 9, mute: 'switch', muteY: 13, vol: 'round', volY: [24, 33] },
    port: 'lightning', jack: 'bottom',
    back: { style: 'two-tone', logoY: 0.38, text: true, strips: [16.5, 14], textSE: true },
    frameMat: 'aluminum', backMat: 'aluminum', touchID: true,
    os: 'iOS 9.3', osv: 9,
    colors: [
      { name: '玫瑰金色', frame: '#e6bfb3', back: '#e8c3b7', strip: '#f3e5df', front: 'white', chamfer: '#e9c7bd' },
      { name: '金色', frame: '#e3d3b6', back: '#e6d6ba', strip: '#f3efe6', front: 'white', chamfer: '#e8dac0' },
      { name: '银色', frame: '#d6d7da', back: '#d8d9dc', strip: '#f2f2f0', front: 'white', chamfer: '#dcdde0' },
      { name: '深空灰色', frame: '#4c4c50', back: '#505055', strip: '#1a1a1c', front: 'black', chamfer: '#58585c' }
    ],
    chip: 'Apple A9 + M9', ram: '2 GB', storage: '16 / 32 / 64 / 128 GB',
    camera: '1200 万像素，4K 视频，Live Photos', frontCamera: '120 万像素', material: '铝合金 + 磨砂倒角', connector: 'Lightning', network: '4G LTE',
    price: '$399 起',
    intro: [
      '在大屏成为主流之后，仍有很多人喜欢单手可握的 4 英寸手机。iPhone SE 沿用 5s 的外观，把倒角改成了哑光处理，同时增加了玫瑰金配色。',
      '它装进了与 iPhone 6s 相同的 A9 芯片、1200 万像素相机、4K 录像、Live Photos 和 Apple Pay。399 美元的起售价让它成为当时最划算的 iPhone。',
      '“SE”意为 Special Edition。后来 SE 系列又推出了基于 iPhone 8 外观的第二代和第三代。'
    ],
    highlights: ['4 英寸小屏旗舰性能', '$399 起售', '哑光倒角', '与 6s 同款 A9 芯片']
  },
  {
    id: 'iphone-7', name: 'iPhone 7', year: 2016, date: '2016-09-16',
    tagline: '7 在此。',
    dims: [138.3, 67.1, 7.1], weight: 138,
    display: { inch: 4.7, pts: [375, 667], res: '1334 × 750', ppi: 326, tech: 'Retina HD（广色域 P3）', r: 0, y: 0 },
    corner: 10, exp: 2.1, profile: 'round', round: { f: 1.9, b: 2.3, n: 2.3 },
    front: { home: 'ring', homeD: 11, ear: [10, 1.3], cam: { x: -8.5, y: 0 }, solidHome: true },
    rear: { lenses: [{ x: 10.8, y: 10.8, d: 7.6, ring: 11.2, bump: 0.9, bodyRing: true }], flash: [{ x: 22.5, y: 11, d: 5.6, quad: true }], mic: [{ x: 17.6, y: 10.8 }] },
    buttons: { power: 'side', powerY: 36, powerLen: 11, mute: 'switch', muteY: 18, vol: 'pill', volY: [33, 46], volLen: 9 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'alu6', logoY: 0.4, text: true, antenna: 'edge' },
    frameMat: 'aluminum', backMat: 'aluminum', touchID: true,
    os: 'iOS 10.0', osv: 10,
    colors: [
      { name: '亮黑色', frame: '#0b0b0c', back: '#0b0b0c', front: 'black', strip: '#0b0b0c', jet: true },
      { name: '黑色', frame: '#232325', back: '#252527', front: 'black', strip: '#1c1c1e', matte: true },
      { name: '银色', frame: '#d7d8db', back: '#dadbde', front: 'white', strip: '#e6e6e6' },
      { name: '金色', frame: '#e0cfb2', back: '#e3d2b5', front: 'white', strip: '#ece4d5' },
      { name: '玫瑰金色', frame: '#e6bfb3', back: '#e8c3b7', front: 'white', strip: '#efdcd5' },
      { name: '(PRODUCT)RED', frame: '#b10f26', back: '#b31228', front: 'white', strip: '#c24252' }
    ],
    chip: 'Apple A10 Fusion（四核）', ram: '2 GB', storage: '32 / 128 / 256 GB',
    camera: '1200 万像素 ƒ/1.8 光学防抖', frontCamera: '700 万像素', material: '7000 系列铝合金（亮黑色为 9 道阳极氧化抛光）', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$649 起',
    intro: [
      'iPhone 7 取消了 3.5 毫米耳机孔，Apple 称之为一种“勇气”。随后推出的 AirPods 让无线耳机迅速普及。',
      '主屏幕按钮改成不能按下的压感式按钮，按压的“咔嗒”感由 Taptic Engine 振动模拟出来。机身首次支持 IP67 防水，并加入了立体声扬声器。',
      '亮黑色经过九道阳极氧化和抛光工序，看起来像一块黑曜石。同年的 7 Plus 首次采用广角 + 长焦双摄，带来了人像模式。'
    ],
    highlights: ['取消 3.5mm 耳机孔', '压感式固态主屏幕按钮', 'IP67 防水防尘', '亮黑色工艺']
  },
  {
    id: 'iphone-8', name: 'iPhone 8', year: 2017, date: '2017-09-22',
    tagline: '新一代 iPhone，玻璃之美。',
    dims: [138.4, 67.3, 7.3], weight: 148,
    display: { inch: 4.7, pts: [375, 667], res: '1334 × 750', ppi: 326, tech: 'Retina HD + 原彩显示', r: 0, y: 0 },
    corner: 10, exp: 2.1, profile: 'round', round: { f: 1.9, b: 1.9, n: 2.4, glassBack: true },
    front: { home: 'ring', homeD: 11, ear: [10, 1.3], cam: { x: -8.5, y: 0 }, solidHome: true },
    rear: { lenses: [{ x: 10.8, y: 10.8, d: 7.6, ring: 11.2, bump: 0.95 }], flash: [{ x: 22.5, y: 11, d: 5.6, quad: true }], mic: [{ x: 17.6, y: 10.8 }] },
    buttons: { power: 'side', powerY: 36, powerLen: 11, mute: 'switch', muteY: 18, vol: 'pill', volY: [33, 46], volLen: 9 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.4, text: true },
    frameMat: 'aluminum', backMat: 'glass',
    os: 'iOS 11.0', osv: 11,
    colors: [
      { name: '深空灰色', frame: '#5a5b5f', back: '#2a2a2c', front: 'black' },
      { name: '银色', frame: '#d6d7d9', back: '#f1f1ef', front: 'white' },
      { name: '金色', frame: '#e2cdb0', back: '#f3e3d3', front: 'white' },
      { name: '(PRODUCT)RED', frame: '#a50e1f', back: '#a30f22', front: 'black' }
    ],
    chip: 'Apple A11 Bionic（六核 + 神经网络引擎）', ram: '2 GB', storage: '64 / 128 / 256 GB',
    camera: '1200 万像素 ƒ/1.8，4K 60fps', frontCamera: '700 万像素', material: '玻璃背板 + 航空级铝金属边框', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$699 起',
    intro: [
      'iPhone 8 时隔多年重新用上玻璃背板，Apple 称之为“智能手机上最耐用的玻璃”，玻璃背板让无线充电成为可能，它与 8 Plus 是首批支持 Qi 无线充电的 iPhone。',
      'A11 Bionic 首次加入神经网络引擎，屏幕也支持随环境光调节色温的原彩显示（True Tone）。',
      '它是经典“主屏幕按钮 + 上下边框”设计的最后一代旗舰。2020 年和 2022 年的 iPhone SE 也沿用了它的外观。'
    ],
    highlights: ['玻璃背板 + 无线充电', 'A11 Bionic 神经网络引擎', '原彩显示 True Tone', '经典设计的最后一代旗舰']
  },
  {
    id: 'iphone-x', name: 'iPhone X', year: 2017, date: '2017-11-03',
    tagline: '你好，未来。',
    dims: [143.6, 70.9, 7.7], weight: 174,
    display: { inch: 5.8, pts: [375, 812], res: '2436 × 1125', ppi: 458, tech: 'Super Retina OLED', r: 39, y: 0, notch: [209, 30] },
    corner: 10.6, exp: 2.6, profile: 'round', round: { f: 1.3, b: 1.3, n: 3.2, glassBack: true },
    front: { home: null },
    rear: { pill: { x: 10.6, y: 16.8, w: 11.8, h: 26.6, bump: 1.1 }, lenses: [{ x: 10.6, y: 9.9, d: 8.4 }, { x: 10.6, y: 23.7, d: 8.4 }], flash: [{ x: 10.6, y: 16.8, d: 3.6, onPill: true }], mic: [{ x: 18.5, y: 16.8 }] },
    buttons: { power: 'side', powerY: 38, powerLen: 19, mute: 'switch', muteY: 20, vol: 'pill', volY: [34, 47], volLen: 9 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.4, text: true },
    frameMat: 'steel', backMat: 'glass',
    os: 'iOS 11.1', osv: 11,
    colors: [
      { name: '深空灰色', frame: '#6c6e72', back: '#2c2d30', front: 'black' },
      { name: '银色', frame: '#d8d9db', back: '#efefed', front: 'black' }
    ],
    chip: 'Apple A11 Bionic', ram: '3 GB', storage: '64 / 256 GB',
    camera: '双 1200 万像素（广角 + 长焦，均有光学防抖）', frontCamera: '700 万像素 TrueDepth（Face ID）', material: '医用级不锈钢边框 + 前后玻璃', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$999 起',
    intro: [
      'iPhone 诞生十周年之际，Apple 推出 iPhone X（读作“ten”）。它去掉了主屏幕按钮，用一块 5.8 英寸 OLED 屏覆盖整个正面，从此“全面屏 + 刘海”成为整个行业的设计风向。',
      '顶部“刘海”里塞进了 TrueDepth 原深感摄像头系统，它会向面部投射 30000 多个不可见光点，实现 Face ID 面容识别，还能生成跟随表情的动话表情（Animoji）。',
      '主屏幕按钮的功能变成了手势：从底部上滑回到主屏幕，停顿进入多任务。这套交互一直沿用到今天。'
    ],
    highlights: ['全面屏 + 刘海设计', 'Face ID 面容识别', '首款 OLED 屏 iPhone', '手势操作取代主屏幕按钮']
  },
  {
    id: 'iphone-xr', name: 'iPhone XR', year: 2018, date: '2018-10-26',
    tagline: '绚丽，在每一面。',
    dims: [150.9, 75.7, 8.3], weight: 194,
    display: { inch: 6.1, pts: [414, 896], res: '1792 × 828', ppi: 326, tech: 'Liquid Retina LCD', r: 41.5, y: 0, notch: [230, 33] },
    corner: 11.2, exp: 2.6, profile: 'round', round: { f: 1.4, b: 1.4, n: 3.2, glassBack: true },
    front: { home: null },
    rear: { lenses: [{ x: 11.2, y: 11.2, d: 8.6, ring: 12, bump: 1.0 }], flash: [{ x: 21.5, y: 8.6, d: 3.6 }], mic: [{ x: 21.5, y: 14.2 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 20, mute: 'switch', muteY: 21, vol: 'pill', volY: [36, 50], volLen: 10 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.4, text: true },
    frameMat: 'aluminum', backMat: 'glass',
    os: 'iOS 12.0', osv: 12,
    colors: [
      { name: '珊瑚色', frame: '#f9806e', back: '#fa8673', front: 'black' },
      { name: '黄色', frame: '#f8cf43', back: '#f9d24a', front: 'black' },
      { name: '蓝色', frame: '#4a8fd6', back: '#5aa0dd', front: 'black' },
      { name: '白色', frame: '#ecece8', back: '#f3f3ef', front: 'black' },
      { name: '黑色', frame: '#232324', back: '#1d1d1f', front: 'black' },
      { name: '(PRODUCT)RED', frame: '#b00d20', back: '#b3101f', front: 'black' }
    ],
    chip: 'Apple A12 Bionic（7nm）', ram: '3 GB', storage: '64 / 128 / 256 GB',
    camera: '1200 万像素 ƒ/1.8（软件人像模式）', frontCamera: '700 万像素 TrueDepth', material: '航空级铝金属边框 + 玻璃背板', connector: 'Lightning', network: '4G LTE Advanced（双卡）',
    price: '$749 起',
    intro: [
      'iPhone XR 把 Face ID 和全面屏带到了更亲民的价位。6.1 英寸 Liquid Retina LCD 屏的边框比 X 略宽，机身有六种颜色。',
      '后置只有一枚广角镜头，人像模式靠 A12 Bionic 的神经网络引擎用软件实现。3D Touch 被长按加触感反馈的“触感触控”取代。',
      'XR 凭借出色的续航和价格成为 2019 年全球最畅销的智能手机。'
    ],
    highlights: ['六种配色', '7nm A12 Bionic', '2019 年全球最畅销手机', '超长续航']
  },
  {
    id: 'iphone-xs', name: 'iPhone XS', year: 2018, date: '2018-09-21',
    tagline: '欢迎来到大屏 iPhone 的世界。',
    dims: [143.6, 70.9, 7.7], weight: 177,
    display: { inch: 5.8, pts: [375, 812], res: '2436 × 1125', ppi: 458, tech: 'Super Retina HD OLED（HDR）', r: 39, y: 0, notch: [209, 30] },
    corner: 10.6, exp: 2.6, profile: 'round', round: { f: 1.3, b: 1.3, n: 3.2, glassBack: true },
    front: { home: null },
    rear: { pill: { x: 10.6, y: 16.8, w: 11.8, h: 26.6, bump: 1.15 }, lenses: [{ x: 10.6, y: 9.9, d: 8.6 }, { x: 10.6, y: 23.7, d: 8.6 }], flash: [{ x: 10.6, y: 16.8, d: 3.6, onPill: true }], mic: [{ x: 18.5, y: 16.8 }] },
    buttons: { power: 'side', powerY: 38, powerLen: 19, mute: 'switch', muteY: 20, vol: 'pill', volY: [34, 47], volLen: 9 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.4, text: true },
    frameMat: 'steel', backMat: 'glass',
    os: 'iOS 12.0', osv: 12,
    colors: [
      { name: '金色', frame: '#e1c49c', back: '#f6e2cd', front: 'black' },
      { name: '银色', frame: '#d8d9db', back: '#efefed', front: 'black' },
      { name: '深空灰色', frame: '#6c6e72', back: '#2c2d30', front: 'black' }
    ],
    chip: 'Apple A12 Bionic（首款 7nm）', ram: '4 GB', storage: '64 / 256 / 512 GB',
    camera: '双 1200 万像素（广角 + 长焦），智能 HDR', frontCamera: '700 万像素 TrueDepth', material: '医用级不锈钢 + 前后玻璃', connector: 'Lightning', network: '4G LTE Advanced（双卡）',
    price: '$999 起',
    intro: [
      'iPhone XS 外观延续 iPhone X，新增了金色。同期推出的 6.5 英寸 XS Max 是当时屏幕最大的 iPhone。',
      'A12 Bionic 是业界最早量产的 7 纳米手机芯片之一。相机加入智能 HDR，景深控制可以在拍完后再调节背景虚化。',
      '这一代首次支持双卡双待，在中国大陆销售的 XS Max 还采用了双实体 SIM 卡槽。'
    ],
    highlights: ['7nm A12 Bionic', '智能 HDR 与景深调节', '双卡双待', '新增金色不锈钢']
  },
  {
    id: 'iphone-11', name: 'iPhone 11', year: 2019, date: '2019-09-20',
    tagline: '样样都刚刚好。',
    dims: [150.9, 75.7, 8.3], weight: 194,
    display: { inch: 6.1, pts: [414, 896], res: '1792 × 828', ppi: 326, tech: 'Liquid Retina HD LCD', r: 41.5, y: 0, notch: [230, 33] },
    corner: 11.2, exp: 2.6, profile: 'round', round: { f: 1.4, b: 1.4, n: 3.2, glassBack: true },
    front: { home: null },
    rear: { square: { x: 19.4, y: 19.4, s: 28.4, r: 7.4, bump: 0.9 }, lenses: [{ x: 13.4, y: 13.4, d: 10.6 }, { x: 13.4, y: 25.4, d: 10.6 }], flash: [{ x: 25.6, y: 13.2, d: 3.8 }], mic: [{ x: 25.6, y: 25.6 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 20, mute: 'switch', muteY: 21, vol: 'pill', volY: [36, 50], volLen: 10 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false },
    frameMat: 'aluminum', backMat: 'glass',
    os: 'iOS 13.0', osv: 13,
    colors: [
      { name: '紫色', frame: '#cec8e4', back: '#d5d0e8', front: 'black' },
      { name: '绿色', frame: '#a9dcc6', back: '#b0e2cd', front: 'black' },
      { name: '黄色', frame: '#f8e283', back: '#fbe78f', front: 'black' },
      { name: '黑色', frame: '#232324', back: '#1f1f21', front: 'black' },
      { name: '白色', frame: '#eeece8', back: '#f6f4ef', front: 'black' },
      { name: '(PRODUCT)RED', frame: '#b40b2b', back: '#ba0c2e', front: 'black' }
    ],
    chip: 'Apple A13 Bionic', ram: '4 GB', storage: '64 / 128 / 256 GB',
    camera: '双 1200 万像素（广角 + 超广角），夜间模式', frontCamera: '1200 万像素 TrueDepth（4K、慢动作自拍）', material: '铝金属边框 + 玻璃背板', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$699 起',
    intro: [
      'iPhone 11 是 XR 的继任者，起售价降到 699 美元。背面方形相机模组里加入了一枚 120° 超广角镜头，镜头视野一下宽了很多。',
      '夜间模式能在极暗的环境里自动多帧合成，拍出明亮干净的夜景。前置摄像头可以拍 4K 视频和慢动作自拍（被戏称为“Slofie”）。',
      '从这一代开始，背面的 Apple 标志移到了正中央，“iPhone”字样也被去掉了。'
    ],
    highlights: ['超广角镜头', '夜间模式', 'Apple 标志居中', '$699 起售']
  },
  {
    id: 'iphone-11-pro', name: 'iPhone 11 Pro', year: 2019, date: '2019-09-20',
    tagline: '强得，很 Pro。',
    dims: [144.0, 71.4, 8.1], weight: 188,
    display: { inch: 5.8, pts: [375, 812], res: '2436 × 1125', ppi: 458, tech: 'Super Retina XDR OLED', r: 39, y: 0, notch: [209, 30] },
    corner: 10.6, exp: 2.6, profile: 'round', round: { f: 1.3, b: 1.3, n: 3.2, glassBack: true },
    front: { home: null },
    rear: { square: { x: 19.6, y: 19.6, s: 29, r: 7.6, bump: 0.95 }, lenses: [{ x: 12.8, y: 12.8, d: 10.4 }, { x: 12.8, y: 26.4, d: 10.4 }, { x: 25.2, y: 19.6, d: 10.4 }], flash: [{ x: 26.4, y: 11.2, d: 3.6 }], mic: [{ x: 26.4, y: 28 }] },
    buttons: { power: 'side', powerY: 38, powerLen: 19, mute: 'switch', muteY: 20, vol: 'pill', volY: [34, 47], volLen: 9 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false, matte: true },
    frameMat: 'steel', backMat: 'glassMatte',
    os: 'iOS 13.0', osv: 13,
    colors: [
      { name: '暗夜绿色', frame: '#4a5952', back: '#4e5851', front: 'black' },
      { name: '深空灰色', frame: '#5d5d5f', back: '#535150', front: 'black' },
      { name: '银色', frame: '#d9d9d9', back: '#ebebe3', front: 'black' },
      { name: '金色', frame: '#e6c89e', back: '#f7e3c6', front: 'black' }
    ],
    chip: 'Apple A13 Bionic', ram: '4 GB', storage: '64 / 256 / 512 GB',
    camera: '三 1200 万像素（广角 + 超广角 + 长焦），Deep Fusion', frontCamera: '1200 万像素 TrueDepth', material: '不锈钢 + 一体式磨砂质感玻璃背板', connector: 'Lightning', network: '4G LTE Advanced',
    price: '$999 起',
    intro: [
      'iPhone 11 Pro 是第一款冠以“Pro”的 iPhone。背面是一整块磨砂质感玻璃，相机模组的凸起也是从同一块玻璃上打磨出来的。',
      '超广角、广角、长焦三颗镜头呈三角形排列，中国网友根据它的样子起了个外号叫“浴霸”。Deep Fusion 技术可以逐像素合成多帧照片，在中低光下保留更多纹理。',
      '暗夜绿色是这一代的标志配色。Super Retina XDR 屏幕的峰值亮度达到 1200 尼特。'
    ],
    highlights: ['首款 Pro 系列', '三摄“浴霸”', '磨砂质感玻璃背板', '暗夜绿色']
  },
  {
    id: 'iphone-12', name: 'iPhone 12', year: 2020, date: '2020-10-23',
    tagline: '5G 速度，就是快。',
    dims: [146.7, 71.5, 7.4], weight: 162,
    display: { inch: 6.1, pts: [390, 844], res: '2532 × 1170', ppi: 460, tech: 'Super Retina XDR OLED', r: 47.3, y: 0, notch: [210, 32] },
    corner: 10.4, exp: 2.8, profile: 'flat',
    front: { home: null },
    rear: { square: { x: 18.4, y: 18.4, s: 26.6, r: 7.4, bump: 0.9 }, lenses: [{ x: 12.6, y: 12.6, d: 9.6 }, { x: 12.6, y: 24.2, d: 9.6 }], flash: [{ x: 24.2, y: 12.4, d: 3.8 }], mic: [{ x: 24.2, y: 24.6 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'switch', muteY: 21, vol: 'pill', volY: [36, 50], volLen: 10 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false },
    frameMat: 'aluminumMatte', backMat: 'glass',
    os: 'iOS 14.1', osv: 14,
    colors: [
      { name: '蓝色', frame: '#1c3f5f', back: '#123c63', front: 'black' },
      { name: '绿色', frame: '#cfe6cc', back: '#d8efd5', front: 'black' },
      { name: '紫色', frame: '#b5abd9', back: '#bcb3e3', front: 'black' },
      { name: '白色', frame: '#ececea', back: '#f6f2ee', front: 'black' },
      { name: '黑色', frame: '#2b2e31', back: '#25292c', front: 'black' },
      { name: '(PRODUCT)RED', frame: '#d1282d', back: '#d82e2e', front: 'black' }
    ],
    chip: 'Apple A14 Bionic（首款 5nm）', ram: '4 GB', storage: '64 / 128 / 256 GB',
    camera: '双 1200 万像素（广角 ƒ/1.6 + 超广角），杜比视界 HDR 录制', frontCamera: '1200 万像素 TrueDepth', material: '航空级铝金属直角边框 + 超瓷晶面板', connector: 'Lightning（MagSafe 磁吸）', network: '5G',
    price: '$799 起',
    intro: [
      'iPhone 12 回到了 iPhone 4 和 5 那样的直角边框，屏幕与边框平齐，整机比 11 更薄更小。标准版也第一次用上了 OLED 屏。',
      '这是第一代支持 5G 的 iPhone。正面采用含纳米陶瓷晶体的“超瓷晶面板”，抗跌落能力提升四倍。背面的 MagSafe 磁吸系统可以吸附充电器、卡包等配件。',
      '从这一代开始，包装盒里不再附送充电器和耳机。同期还推出了 5.4 英寸的 12 mini。'
    ],
    highlights: ['直角边框设计回归', '5G 网络', 'MagSafe 磁吸', '超瓷晶面板']
  },
  {
    id: 'iphone-13', name: 'iPhone 13', year: 2021, date: '2021-09-24',
    tagline: '你的新超能力。',
    dims: [146.7, 71.5, 7.65], weight: 173,
    display: { inch: 6.1, pts: [390, 844], res: '2532 × 1170', ppi: 460, tech: 'Super Retina XDR OLED（峰值亮度 800 尼特）', r: 47.3, y: 0, notch: [162, 33] },
    corner: 10.4, exp: 2.8, profile: 'flat',
    front: { home: null },
    rear: { square: { x: 19.2, y: 19.2, s: 28.2, r: 7.8, bump: 1.0 }, lenses: [{ x: 12.9, y: 12.9, d: 10.4 }, { x: 25.5, y: 25.5, d: 10.4 }], flash: [{ x: 25.6, y: 12.6, d: 3.8 }], mic: [{ x: 12.8, y: 25.6 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'switch', muteY: 21, vol: 'pill', volY: [36, 50], volLen: 10 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false },
    frameMat: 'aluminumMatte', backMat: 'glass',
    os: 'iOS 15.0', osv: 15,
    colors: [
      { name: '粉色', frame: '#f0c8cc', back: '#f9e0e2', front: 'black' },
      { name: '蓝色', frame: '#2a5f7f', back: '#276787', front: 'black' },
      { name: '午夜色', frame: '#2b3138', back: '#232a31', front: 'black' },
      { name: '星光色', frame: '#e6e0d6', back: '#faf6f2', front: 'black' },
      { name: '(PRODUCT)RED', frame: '#b5121b', back: '#bf0013', front: 'black' },
      { name: '绿色', frame: '#3d4f3c', back: '#394c38', front: 'black' }
    ],
    chip: 'Apple A15 Bionic（5nm）', ram: '4 GB', storage: '128 / 256 / 512 GB',
    camera: '双 1200 万像素（广角 ƒ/1.6 传感器位移光学防抖 + 超广角 ƒ/2.4），电影效果模式', frontCamera: '1200 万像素 TrueDepth', material: '航空级铝金属直角边框 + 超瓷晶面板', connector: 'Lightning（MagSafe 磁吸）', network: '5G',
    price: '$799 起',
    intro: [
      'iPhone 13 延续了 12 的直角边框设计，但正面的刘海比上一代窄了约 20%，屏幕峰值亮度也提升到 800 尼特。存储起步容量从 64GB 翻倍到 128GB。',
      '背面最明显的变化是两颗镜头改成了对角线排列。广角镜头用上了更大的传感器，还把原本只有 12 Pro Max 才有的传感器位移光学防抖带到了标准版。为了放下这套更大的相机系统，Apple 把镜头转了 45 度。',
      '这一代新增了“电影效果模式”，录视频时可以像电影一样自动在人物之间切换焦点。A15 Bionic 和更大的电池让续航比 12 最多长 2.5 小时。2022 年 3 月新增了绿色款。'
    ],
    highlights: ['对角线双摄', '刘海缩小约 20%', '传感器位移光学防抖', '电影效果模式', '128GB 起步']
  },
  {
    id: 'iphone-14-pro', name: 'iPhone 14 Pro', year: 2022, date: '2022-09-16',
    tagline: '灵动岛，有点意思。',
    dims: [147.5, 71.5, 7.85], weight: 206,
    display: { inch: 6.1, pts: [393, 852], res: '2556 × 1179', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion 120Hz，全天候显示）', r: 55, y: 0, island: [126, 37, 11] },
    corner: 11, exp: 2.8, profile: 'flat', flat: { polish: true },
    front: { home: null },
    rear: { square: { x: 21.8, y: 21.8, s: 35.4, r: 9.4, bump: 1.25 }, lenses: [{ x: 14.2, y: 14.2, d: 13.6, deep: true }, { x: 14.2, y: 29.6, d: 13.6, deep: true }, { x: 28.8, y: 21.9, d: 13.6, deep: true }], flash: [{ x: 29.6, y: 12.6, d: 4.4 }], lidar: { x: 29.6, y: 31.2, d: 4.6 }, mic: [{ x: 33.8, y: 21.9 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'switch', muteY: 21, vol: 'pill', volY: [36, 50], volLen: 10 },
    port: 'lightning', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false, matte: true },
    frameMat: 'steel', backMat: 'glassMatte',
    os: 'iOS 16.0', osv: 16,
    colors: [
      { name: '暗紫色', frame: '#4f4555', back: '#594f63', front: 'black' },
      { name: '金色', frame: '#e8d5b0', back: '#f4e8ce', front: 'black' },
      { name: '银色', frame: '#d5d7d9', back: '#f0f2f2', front: 'black' },
      { name: '深空黑色', frame: '#3b3a3a', back: '#403e3d', front: 'black' }
    ],
    chip: 'Apple A16 Bionic（4nm）', ram: '6 GB', storage: '128 GB / 256 GB / 512 GB / 1 TB',
    camera: '4800 万像素主摄 + 1200 万超广角 + 1200 万 3 倍长焦', frontCamera: '1200 万像素自动对焦 TrueDepth', material: '手术级不锈钢 + 磨砂质感玻璃', connector: 'Lightning', network: '5G + 卫星紧急求救',
    price: '$999 起',
    intro: [
      'iPhone 14 Pro 用一枚胶囊形的“灵动岛”取代了用了五年的刘海。软件会让它随音乐、计时器、通话、导航等实时活动伸缩变形，硬件开孔变成了一个交互元素。',
      '主摄首次升级到 4800 万像素，四合一像素合成让暗光画质明显提升。屏幕支持 1Hz 的全天候显示，户外峰值亮度可达 2000 尼特。',
      '它还带来了卫星紧急求救和车祸检测，可以在没有蜂窝网络的地方发出求救。'
    ],
    highlights: ['灵动岛 Dynamic Island', '4800 万像素主摄', '全天候显示', '卫星紧急求救']
  },
  {
    id: 'iphone-15-pro', name: 'iPhone 15 Pro', year: 2023, date: '2023-09-22',
    tagline: '钛金属。如此强悍，如此轻盈，如此 Pro。',
    dims: [146.6, 70.6, 8.25], weight: 187,
    display: { inch: 6.1, pts: [393, 852], res: '2556 × 1179', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion，全天候显示）', r: 55, y: 0, island: [126, 37, 11] },
    corner: 11.4, exp: 2.8, profile: 'flat', flat: { round: true },
    front: { home: null },
    rear: { square: { x: 21.6, y: 21.6, s: 35, r: 9.6, bump: 1.3 }, lenses: [{ x: 14.1, y: 14.1, d: 13.6, deep: true }, { x: 14.1, y: 29.3, d: 13.6, deep: true }, { x: 28.6, y: 21.7, d: 13.6, deep: true }], flash: [{ x: 29.4, y: 12.4, d: 4.4 }], lidar: { x: 29.4, y: 31, d: 4.6 }, mic: [{ x: 33.6, y: 21.7 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'action', muteY: 24, vol: 'pill', volY: [38, 51], volLen: 10 },
    port: 'usbc', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false, matte: true },
    frameMat: 'titanium', backMat: 'glassMatte',
    os: 'iOS 17.0', osv: 17,
    colors: [
      { name: '原色钛金属', frame: '#a8a297', back: '#bab4a9', front: 'black' },
      { name: '蓝色钛金属', frame: '#3d4955', back: '#2f4452', front: 'black' },
      { name: '白色钛金属', frame: '#d8d7d2', back: '#f2f1ed', front: 'black' },
      { name: '黑色钛金属', frame: '#3a3b3d', back: '#3b3b3d', front: 'black' }
    ],
    chip: 'Apple A17 Pro（首款 3nm）', ram: '8 GB', storage: '128 GB / 256 GB / 512 GB / 1 TB',
    camera: '4800 万像素主摄 + 1200 万超广角 + 1200 万 3 倍长焦', frontCamera: '1200 万像素 TrueDepth', material: '5 级钛金属边框（铝合金内框）+ 磨砂玻璃', connector: 'USB-C（USB 3，10Gb/s）', network: '5G',
    price: '$999 起',
    intro: [
      'iPhone 15 Pro 首次采用航天级 5 级钛金属边框，内部用热熔固相扩散工艺连接铝合金框架。整机比 14 Pro 轻了 19 克，边缘也做得更圆润，握持更舒适。',
      '用了十年的静音拨片换成了可自定义的“操作按钮”，可以设成手电筒、相机、快捷指令等。Lightning 接口换成了 USB-C，Pro 机型支持 USB 3 高速传输。',
      'A17 Pro 是首款 3 纳米手机芯片，加入了硬件光线追踪，可以运行《生化危机 4》这样的主机级游戏。'
    ],
    highlights: ['5 级钛金属边框', '操作按钮', 'USB-C 接口', '3nm A17 Pro']
  },
  {
    id: 'iphone-16-pro', name: 'iPhone 16 Pro', year: 2024, date: '2024-09-20',
    tagline: '为 Apple 智能而生。',
    dims: [149.6, 71.5, 8.25], weight: 199,
    display: { inch: 6.3, pts: [402, 874], res: '2622 × 1206', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion，全天候显示）', r: 62, y: 0, island: [126, 37, 11] },
    corner: 11.8, exp: 2.8, profile: 'flat', flat: { round: true },
    front: { home: null },
    rear: { square: { x: 22.2, y: 22.2, s: 36.4, r: 10, bump: 1.35 }, lenses: [{ x: 14.4, y: 14.4, d: 14.2, deep: true }, { x: 14.4, y: 30.2, d: 14.2, deep: true }, { x: 29.4, y: 22.3, d: 14.2, deep: true }], flash: [{ x: 30.2, y: 12.6, d: 4.4 }], lidar: { x: 30.2, y: 31.8, d: 4.6 }, mic: [{ x: 34.6, y: 22.3 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'action', muteY: 24, vol: 'pill', volY: [38, 51], volLen: 10, camCtrl: 102 },
    port: 'usbc', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.5, text: false, matte: true },
    frameMat: 'titanium', backMat: 'glassMatte',
    os: 'iOS 18.0', osv: 18,
    colors: [
      { name: '沙漠色钛金属', frame: '#b49b85', back: '#bfa48f', front: 'black' },
      { name: '原色钛金属', frame: '#aca69c', back: '#c2bcb2', front: 'black' },
      { name: '白色钛金属', frame: '#d9d8d3', back: '#f2f1ed', front: 'black' },
      { name: '黑色钛金属', frame: '#3a3b3d', back: '#3c3c3d', front: 'black' }
    ],
    chip: 'Apple A18 Pro（第二代 3nm）', ram: '8 GB', storage: '128 GB / 256 GB / 512 GB / 1 TB',
    camera: '4800 万融合主摄 + 4800 万超广角 + 1200 万 5 倍长焦，4K120 杜比视界', frontCamera: '1200 万像素 TrueDepth', material: '5 级钛金属 + 磨砂玻璃', connector: 'USB-C（USB 3）', network: '5G',
    price: '$999 起',
    intro: [
      'iPhone 16 Pro 的屏幕增大到 6.3 英寸，边框是当时 iPhone 上最窄的。小尺寸的 Pro 也第一次用上了 5 倍四棱镜长焦。',
      '机身右下方新增了“相机控制”按钮。它由蓝宝石水晶、压力传感器和电容传感器组成，按一下打开相机，轻按对焦，在上面滑动可以调节变焦和曝光。',
      '这一代是为 Apple 智能（Apple Intelligence）设计的首批 iPhone，支持 4K 120fps 杜比视界录制和“录音室级”四麦克风收音。'
    ],
    highlights: ['相机控制按钮', '6.3 英寸超窄边框', '5 倍长焦', 'Apple 智能']
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', year: 2025, date: '2025-09-19',
    tagline: '史上最强 Pro。',
    dims: [150.0, 71.9, 8.75], weight: 206,
    display: { inch: 6.3, pts: [402, 874], res: '2622 × 1206', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion，户外峰值 3000 尼特）', r: 62, y: 0, island: [126, 37, 11] },
    corner: 12, exp: 2.8, profile: 'unibody',
    front: { home: null },
    rear: { plateau: { y0: 2.4, h: 38.6, bump: 1.7 }, lenses: [{ x: 14.4, y: 13.2, d: 14.4, deep: true }, { x: 14.4, y: 29.6, d: 14.4, deep: true }, { x: 29.2, y: 21.4, d: 14.4, deep: true }], flash: [{ x: 61.4, y: 15.2, d: 4.6 }], lidar: { x: 61.4, y: 27.6, d: 4.6 }, mic: [{ x: 54.4, y: 21.4 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'action', muteY: 24, vol: 'pill', volY: [38, 51], volLen: 10, camCtrl: 103 },
    port: 'usbc', jack: null, speakerBoth: true,
    back: { style: 'unibody', logoY: 0.6, text: false, cutout: [44, 10] },
    frameMat: 'aluminumUni', backMat: 'aluminumUni',
    os: 'iOS 26', osv: 26,
    colors: [
      { name: '宇宙橙色', frame: '#ee7a32', back: '#f07b33', glass: '#f38a4c', front: 'black' },
      { name: '深蓝色', frame: '#2c3a56', back: '#2e3c5a', glass: '#34435f', front: 'black' },
      { name: '银色', frame: '#dcdddf', back: '#e1e2e4', glass: '#eeeeee', front: 'black' }
    ],
    chip: 'Apple A19 Pro（均热板散热）', ram: '12 GB', storage: '256 GB / 512 GB / 1 TB',
    camera: '三 4800 万像素融合相机（主摄 + 超广角 + 4 倍长焦，最高 8 倍光学品质变焦）', frontCamera: '1800 万像素人物居中相机', material: '热锻铝合金一体成型机身 + 超瓷晶背板窗口', connector: 'USB-C（USB 3）', network: '5G（N1 无线芯片）',
    price: '$1,099 起',
    intro: [
      'iPhone 17 Pro 放弃钛金属，改用热锻铝合金一体成型机身，整个背面的金属和边框是一个整体。横贯机身顶部的“相机高原”（Camera Plateau）里装着三颗 4800 万像素镜头、闪光灯和激光雷达。',
      '机身内部首次采用激光焊接的均热板散热，持续性能明显提升。背面中下部开了一扇超瓷晶玻璃窗口，让 MagSafe 和无线充电信号通过。',
      '前置换成了 1800 万像素正方形传感器的“人物居中”相机，竖着握手机也能拍横版自拍。它随 iOS 26 登场，系统界面全面采用“液态玻璃”（Liquid Glass）设计语言。宇宙橙色是这一代的标志配色。'
    ],
    highlights: ['铝合金一体成型机身', '横向相机高原', '均热板散热', '宇宙橙色', 'iOS 26 液态玻璃']
  },
  {
    id: 'iphone-air', name: 'iPhone Air', year: 2025, date: '2025-09-19',
    tagline: '轻薄的未来，现在。',
    dims: [156.2, 74.7, 5.64], weight: 165,
    display: { inch: 6.5, pts: [420, 912], res: '2736 × 1260', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion 120Hz）', r: 62, y: 0, island: [126, 37, 11] },
    corner: 12.4, exp: 2.8, profile: 'flat', flat: { thin: true, polish: true },
    front: { home: null },
    rear: { airPlateau: { x0: 3.2, y0: 3.4, h: 17.6, bump: 2.0 }, lenses: [{ x: 13.4, y: 12.2, d: 12.4, deep: true }], flash: [{ x: 26.6, y: 9.4, d: 3.8 }], mic: [{ x: 26.6, y: 15.4 }] },
    buttons: { power: 'side', powerY: 42, powerLen: 19, mute: 'action', muteY: 25, vol: 'pill', volY: [40, 53], volLen: 10, camCtrl: 108 },
    port: 'usbc', jack: null,
    back: { style: 'glass', logoY: 0.52, text: false, matte: true },
    frameMat: 'titaniumPolish', backMat: 'glassMatte',
    os: 'iOS 26', osv: 26,
    colors: [
      { name: '天蓝色', frame: '#c6d4e0', back: '#d3e2ef', front: 'black' },
      { name: '浅金色', frame: '#e6d3ad', back: '#efe2c8', front: 'black' },
      { name: '云白色', frame: '#e4e4e2', back: '#f5f5f2', front: 'black' },
      { name: '深空黑色', frame: '#2b2b2d', back: '#262628', front: 'black' }
    ],
    chip: 'Apple A19 Pro + C1X 调制解调器 + N1 无线芯片', ram: '12 GB', storage: '256 GB / 512 GB / 1 TB',
    camera: '4800 万像素融合主摄（2 倍光学品质长焦）', frontCamera: '1800 万像素人物居中相机', material: '5 级钛金属镜面抛光边框 + 前后超瓷晶面板', connector: 'USB-C', network: '5G（仅 eSIM）',
    price: '$999 起',
    intro: [
      'iPhone Air 机身只有 5.64 毫米厚，是有史以来最薄的 iPhone，重量 165 克，却装下了 6.5 英寸 ProMotion 屏幕。',
      '为了做到这么薄，Apple 把主板、A19 Pro 芯片、摄像头和扬声器全部集中到顶部那条胶囊形“相机高原”里，下方几乎全部留给电池。它首次在正反两面都使用超瓷晶面板，边框是镜面抛光的钛金属。',
      'iPhone Air 只支持 eSIM，搭载 Apple 自研的 C1X 调制解调器和 N1 无线网络芯片，在极致轻薄的同时保持了旗舰级性能。'
    ],
    highlights: ['5.64mm 史上最薄 iPhone', '胶囊形相机高原', '镜面钛金属边框', '仅 eSIM + 自研 C1X / N1']
  },
  {
    id: 'iphone-18-pro', name: 'iPhone 18 Pro', year: 2026, date: '2026-09-18',
    tagline: '更小的灵动岛，更大的可能。',
    dims: [150.0, 71.9, 8.75], weight: 211,
    display: { inch: 6.3, pts: [402, 874], res: '2622 × 1206', ppi: 460, tech: 'Super Retina XDR OLED（ProMotion，全天候显示）', r: 62, y: 0, island: [100, 34, 11] },
    corner: 12, exp: 2.8, profile: 'unibody',
    front: { home: null },
    rear: { plateau: { y0: 2.4, h: 38.6, bump: 2.2 }, lenses: [{ x: 14.4, y: 13.2, d: 14.6, deep: true }, { x: 14.4, y: 29.6, d: 14.6, deep: true }, { x: 29.2, y: 21.4, d: 14.6, deep: true }], flash: [{ x: 61.4, y: 15.2, d: 4.6 }], lidar: { x: 61.4, y: 27.6, d: 4.6 }, mic: [{ x: 54.4, y: 21.4 }] },
    buttons: { power: 'side', powerY: 40, powerLen: 19, mute: 'action', muteY: 24, vol: 'pill', volY: [38, 51], volLen: 10, camCtrl: 103 },
    port: 'usbc', jack: null, speakerBoth: true,
    back: { style: 'unibody', logoY: 0.6, text: false, cutout: [44, 10], matched: true },
    frameMat: 'aluminumUni', backMat: 'aluminumUni',
    os: 'iOS 27', osv: 27,
    colors: [
      { name: '勃艮第红色', frame: '#5c1f2b', back: '#5e1f2c', glass: '#62232f', front: 'black' },
      { name: '冰川蓝色', frame: '#c3d6e2', back: '#c9dbe6', glass: '#cbdde8', front: 'black' },
      { name: '银色', frame: '#dcdddf', back: '#e1e2e4', glass: '#e3e4e6', front: 'black' },
      { name: '黑色', frame: '#2a2a2c', back: '#2b2b2d', glass: '#2e2e30', front: 'black' }
    ],
    chip: 'Apple A20 Pro（首款 2nm）', ram: '—', storage: '256 GB 起',
    camera: '4800 万像素主摄（可变光圈，更大传感器）+ 4800 万超广角 + 4800 万长焦', frontCamera: '1800 万像素人物居中相机', material: '铝合金一体成型机身 + 同色超瓷晶窗口', connector: 'USB-C（USB 3）', network: '5G',
    price: '$1,199 起',
    intro: [
      'iPhone 18 Pro 于 2026 年 9 月 18 日上市，是本馆最新的展品。它延续 17 Pro 的铝合金一体机身和相机高原，尺寸完全相同。背面的超瓷晶窗口改成了与铝金属同色，解决了上一代“双色背板”的观感问题。',
      '正面的灵动岛自 14 Pro 以来第一次缩小，最多可以同时显示 3 个实时活动。主摄换成了更大的传感器并支持可变光圈，可以在拍摄时控制景深和进光量。',
      'A20 Pro 是 Apple 第一款 2 纳米手机芯片，GPU 性能比 A19 Pro 最高提升约 40%。它随 iOS 27 一同推出，带来了全新的 Siri。新增勃艮第红色和冰川蓝色。'
    ],
    highlights: ['缩小的灵动岛', '可变光圈主摄', '2nm A20 Pro', '同色背板窗口', '勃艮第红色']
  },
  {
    id: 'iphone-duo', name: 'iPhone Duo', year: 2026, date: '2026-10-23',
    tagline: '合上是手机，打开是大屏。',
    dims: [117.8, 84.1, 11.3], weight: 254,
    display: { inch: 5.4, pts: [466, 678], res: '2034 × 1398', ppi: 460, tech: 'Super Retina XDR OLED', r: 40, y: 0, island: [13, 13, 12], hole: true },
    fold: {
      open: [117.8, 164.6, 5.2], t: 5.2, hw: 81.9, gap: 0.4, delta: 0.45, spine: 1.8, hingeR: 3.2,
      outer: { inch: 5.4, pts: [466, 678], r: 40, island: [13, 13, 12], hole: true },
      inner: { inch: 7.6, pts: [920, 648], r: 30, cols: 8, iconS: 68 },
      rear: { airPlateau: { x0: 3.2, y0: 3.2, h: 19, bump: 1.8 }, lenses: [{ x: 13.6, y: 12.7, d: 12.4, deep: true }, { x: 29.4, y: 12.7, d: 12.4, deep: true }], flash: [{ x: 42.4, y: 9.6, d: 3.8 }], mic: [{ x: 42.4, y: 15.8 }] }
    },
    corner: 12.4, exp: 2.8, profile: 'flat', flat: { polish: true },
    front: { home: null }, touchID: true, sideTouchID: true,
    buttons: { power: 'side', powerY: 26, powerLen: 17, vol: 'top', volX: [18, 31], volLen: 10, mute: null, camCtrl: 82 },
    port: 'usbc', jack: null, speakerBoth: true,
    back: { style: 'glass', logoY: 0.56, text: false, matte: true },
    frameMat: 'titaniumPolish', backMat: 'glassMatte',
    os: 'iOS 27.1', osv: 27,
    colors: [
      { name: '星光白色', frame: '#e3e1dc', back: '#f2f0eb', front: 'black' },
      { name: '夜空色', frame: '#2b2d32', back: '#23262c', front: 'black' }
    ],
    chip: 'Apple A20 Pro + C2 调制解调器', ram: '12 GB', storage: '256 GB / 512 GB / 1 TB / 2 TB',
    camera: '4800 万像素融合主摄（26mm ƒ/1.6，传感器位移防抖）+ 4800 万像素超广角（13mm ƒ/2.2），无长焦', frontCamera: '外屏 1200 万像素人物居中相机 + 内屏屏下摄像头',
    material: '镜面抛光 5 级钛金属边框，正面超瓷晶面板 2，背面超瓷晶面板，IP68', connector: 'USB-C', network: '5G（C2 调制解调器，双 eSIM，无实体卡槽）',
    price: '$1,999 起',
    specOverride: {
      '上市日期': '2026 / 10 / 23（10 月 16 日开启预购）',
      '屏幕': '外屏 5.4 英寸 + 内屏 7.6 英寸可折叠 Super Retina XDR OLED（ProMotion 120Hz，全天候显示，户外峰值 3000 尼特，内屏纳米纹理）',
      '分辨率': '外屏 2034 × 1398，460 ppi；内屏 2670 × 1878，约 430 ppi',
      '尺寸': '合上 117.8 × 84.1 × 11.3 mm；展开 117.8 × 164.6 × 5.2 mm'
    },
    intro: [
      '2026 年 9 月 9 日，新任 CEO 约翰·特努斯（John Ternus）在他的首场发布会上揭晓了 iPhone Duo。这是 Apple 的第一款可折叠 iPhone，10 月 16 日开启预购，10 月 23 日正式发售。它采用书本式折叠：合上时是一台 5.4 英寸的小巧手机，打开后变成一块 7.6 英寸、接近方形的大屏。',
      '展开后机身只有 5.2 毫米厚，Apple 称它是展开状态下最薄的 iPhone。和 iPhone Air 一样，大量核心部件被集中到背面的相机高原里。边框是镜面抛光的 5 级钛金属，内屏折痕几乎看不见。内外屏的宽高比相同，开合时界面可以无缝衔接。',
      '机身太薄，放不下原深感摄像头系统，因此 iPhone Duo 没有面容 ID，改用集成在侧边按钮里的触控 ID。它还取消了操作按钮和实体 SIM 卡槽，但保留了相机控制。后置两颗 4800 万像素镜头，没有长焦。半折叠立在桌面上时，它能识别出大家摆好姿势后自动拍下合影。'
    ],
    highlights: ['首款可折叠 iPhone', '5.4 英寸外屏 + 7.6 英寸内屏', '展开仅 5.2mm', '侧边按钮触控 ID', '$1,999 起']
  }
];

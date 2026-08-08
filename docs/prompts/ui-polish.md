# feature/ui-polish — 实施提示 & QA 测试提示

---

## Part A: 实施提示 (Implementation Prompt)

### 任务目标
全面打磨 EmoBuddy 的 UI/UX，覆盖 10 大区块共 50+ 项升级，提升儿童友好度与视觉品质。

### 技术约束
- React + TypeScript + Tailwind CSS + shadcn/ui
- ASD 友善：无闪烁、低刺激、`prefers-reduced-motion`
- 主要目标：触摸屏手机/平板 + Desktop

---

### 实施清单

#### 1. WelcomeScreen 升级
- [ ] 标题"情绪碎片"改为手绘风格渐变文字（CSS `background-clip: text`）
- [ ] 添加可爱角色吉祥物插图（浮动轻动画，`reducedMotion` 时关闭）
- [ ] 背景改为柔和渐变（参考各关主题色）
- [ ] "开始探险"按钮：大圆角（`rounded-2xl`）+ 悬浮阴影 + 点击缩放回馈（`active:scale-95`）

#### 2. LevelIntro 升级
- [ ] 关卡名称使用主题色背景卡片包裹
- [ ] 目标图标添加 CSS 旋转动画（碎片）/ 摇摆动画（NPC）
- [ ] 背景显示关卡主题渐变
- [ ] "开始"按钮添加脉冲动画（`animate-pulse`），吸引点击

#### 3. GameBoard 升级
- [ ] 整体添加圆角边框 + 柔和阴影（`shadow-lg rounded-2xl`）
- [ ] 关卡标题栏：主题色背景条 + 碎片收集进度指示器
- [ ] 完成效果：粒子爆发动画（`animate-ping` + 多色扩散圆）+ 星星飞散

#### 4. DirectionPad 升级
- [ ] 按钮改为大圆角（`rounded-2xl`，min 48×48px）
- [ ] 按下回馈：`active:scale-90` + 加深色 + 触觉反馈（`navigator.vibrate`）
- [ ] 按钮使用主题色（非灰色）
- [ ] 整体十字布局保持居中

#### 5. RealWorldTask Modal 升级
- [ ] 弹窗背景：毛玻璃效果（`backdrop-blur-md bg-white/90`）
- [ ] 任务图标：手绘风格插画（或大号 Emoji/Lucide icon）
- [ ] 选项按钮：大圆角卡片 + 悬浮效果（`hover:shadow-md hover:-translate-y-0.5`）
- [ ] 已选状态：绿色边框发光 + 勾选动画
- [ ] "完成"按钮：彩虹渐变背景 + 脉冲动画

#### 6. ParentUnlock 升级
- [ ] 锁图标：使用 CSS 动画（轻微摇晃→开锁）
- [ ] 进度条改为圆环环绕进度（SVG circle stroke-dasharray）
- [ ] 提示文字加入手势插图（家长手指长按示意）
- [ ] 解锁成功：锁打开动画 + 彩带/纸屑粒子 + 成功音效

#### 7. LevelComplete 升级
- [ ] 星星图标：旋转 + 发光（CSS `filter: drop-shadow`）
- [ ] 完成消息：逐字打字机效果（CSS animation steps）
- [ ] 背景：庆祝主题（CSS 渐变 + 浮动气球/彩纸装饰 div）
- [ ] "下一关"按钮：箭头弹跳动画

#### 8. Certificate 升级
- [ ] 整体排版：证书风格布局（居中、对称、花边边框）
- [ ] 边框装饰：CSS 花边花纹（border-image 或伪元素装饰）
- [ ] 奖杯图标：3D 风格（多层阴影 + 金色渐变）
- [ ] 背景：纸面质感（`bg-amber-50` + 纹理）
- [ ] 关卡列表：图标 + 进度条 + 印章风格"完成"标记
- [ ] "下载"按钮：大圆角 + 下载中动画

#### 9. 全局 UI 主题升级
- [ ] 每关独立配色：通过 CSS 变量在 body 上切换
- [ ] 字体：考虑引入圆润儿童字体（如 CSS `font-family` 中添加 `"Mochiy Pop One"` 或系统圆体 fallback）
- [ ] 过场动画：页面切换 fade-in + slide-up（`animate-in` 类）
- [ ] 音效视觉化：移动时 brief scale bounce，收集时 ripple 扩散
- [ ] 可添加轻量加载画面（角色原地踏步 CSS sprite）

#### 10. 响应式与触控优化
- [ ] 手机布局：横屏/直屏自适应
- [ ] 按钮统一 ≥ 48×48px 触控区域
- [ ] Swipe 手势：支持上下左右滑动移动角色（可选 P1）
- [ ] 安全区处理：`env(safe-area-inset-*)` + `100dvh`
- [ ] 滚动锁定：DirectionPad 操作时禁止页面滚动

### 验收标准
- [ ] 10 大区块各完成 ≥ 3 项升级
- [ ] 所有动画在 `prefers-reduced-motion` 下关闭
- [ ] 触控按钮 ≥ 48px
- [ ] 三关完整流程风格统一
- [ ] Desktop + Mobile Chrome/Safari 正常渲染

---

## Part B: QA 测试提示 (QA Prompt)

### 视觉一致性
- [ ] Welcome Screen → Certificate 全程风格统一
- [ ] 主题色正确贯穿每关所有画面
- [ ] 字体在所有平台（iOS/Android/Desktop）可读且美观
- [ ] 毛玻璃效果在 Safari 不异常（WebKit backdrop-filter 兼容）
- [ ] 暗色模式（如系统设置）下颜色可辨（不强求完整 dark theme）

### 动画检查
- [ ] 所有动画 < 500ms 且柔和
- [ ] 无闪烁或高频颜色变化
- [ ] `prefers-reduced-motion` 开启时：所有 CSS animation/transition 关闭或极小化
- [ ] 粒子/纸屑不遮挡关键交互按钮
- [ ] 过场动画平滑（60fps 感知）

### 触控与响应式
- [ ] **手机竖屏**（375×812）：关键按钮不被裁切
- [ ] **手机横屏**（812×375）：布局合理
- [ ] **平板横屏**（1024×768）：正常
- [ ] **Desktop**（1280×800+）：正常
- [ ] Swipe 手势（如实现）：方向正确，不误触发滚动
- [ ] `navigator.vibrate` 在支持的设备上触发（不支持的静默降级）

### ASD 友善审查
- [ ] 无自动播放音效（首次交互后才播放）
- [ ] 庆祝动画 ≤ 2s 且不循环
- [ ] 颜色对比度满足 WCAG AA（文字 ≥ 4.5:1）
- [ ] 所有按钮有清晰文字标签（不仅依赖图标）
- [ ] 错误/失败状态不会显示红色闪烁或警报

### 跨浏览器
- [ ] **Chrome** (latest Desktop + Mobile)：全部正常
- [ ] **Safari** (Desktop + iOS)：全部正常
- [ ] **Firefox** (Desktop)：基本可用（部分特效降级可接受）
- [ ] **Samsung Internet** (Android)：基本可用

### 回归测试
- [ ] 三关完整流程可通关
- [ ] 键盘 + 触控 DirectionPad 可操作
- [ ] Modal 打开时移动禁用
- [ ] ParentUnlock 长按 2s 功能正常
- [ ] Certificate 下载 PNG 功能正常
- [ ] localStorage 设置/进度持久化正常
- [ ] 静音/减少动效开关功能正常
- [ ] 页面刷新不丢失进度

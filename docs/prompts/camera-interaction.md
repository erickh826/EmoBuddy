# feature/camera-interaction — 实施提示 & QA 测试提示

---

## Part A: 实施提示 (Implementation Prompt)

### 任务目标
为 EmoBuddy 游戏的"现实世界任务"新增**镜头交互模式**，支持颜色辨识（HSL ROI）和物件辨识（COCO-SSD），让儿童通过镜头在现实环境中完成探索任务。

### 技术约束
- 框架：React + TypeScript + Vite
- **不录影、不拍照、不上传、不保存 frame、不侦测脸部/表情**
- **无后端**：所有推理在浏览器端完成
- COCO-SSD 使用 dynamic import
- 支持渐进式降级（Object → Color → Manual）
- **ASD 友善**：明确隐私提示、随时可关闭/跳过、拒绝权限不视为失败

### 实施清单

#### Step 1: 扩展类型定义
- 文件：`src/types.ts`
- 新增类型：
```typescript
type RealWorldTaskType = "choice" | "camera";

type CameraDetectionStrategy =
  | ObjectDetectionStrategy
  | ColorDetectionStrategy
  | ManualDetectionStrategy;

interface ObjectDetectionStrategy {
  type: "object";
  targetLabel: string;       // COCO-SSD class label
}

interface ColorDetectionStrategy {
  type: "color";
  target: HSLColorTarget;
}

interface ManualDetectionStrategy {
  type: "manual";
  instruction: string;
}

interface HSLColorTarget {
  hueRanges: Array<[number, number]>; // e.g. [[0, 15], [345, 360]] for red
  saturationMin: number;
  lightnessMin: number;
  lightnessMax?: number;
  pixelRatioThreshold: number;
}

interface CameraTask {
  targetLabel: string;
  strategies: CameraDetectionStrategy[]; // 按优先级顺序
  durationMs: number;
  fallbackStrategy?: "skip" | "manual";
}
```

- 扩展 `LevelConfig.realWorldTask` 支持 `type: "camera"` 模式：
```typescript
interface RealWorldTask {
  type: RealWorldTaskType;
  title: string;
  description: string;
  choices?: TaskChoice[];          // for type: "choice"
  cameraTask?: CameraTask;         // for type: "camera"
}
```

#### Step 2: 创建 CameraTaskModal 组件
- 文件：新建 `src/components/CameraTaskModal.tsx`
- 核心结构：
```
┌──────────────────────────────┐
│  🔒 隐私提示 (首次显示)       │
│  "镜头只在这部装置上寻找颜色  │
│   或物品，不会拍照或上传"     │
│  [知道了，开始]  [用大人确认]  │
├──────────────────────────────┤
│  📷 Camera Preview            │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │     [ROI 扫描框]        │  │
│  │                        │  │
│  └────────────────────────┘  │
│  ⏳ 侦测进度条               │
│  目标：找到红色的东西！       │
│  [关闭镜头]  [大人帮忙确认]   │
└──────────────────────────────┘
```

#### Step 3: 实现 Camera Lifecycle Hook
- 文件：新建 `src/hooks/useCamera.ts`
- 功能：
  - `startCamera()`：调用 `getUserMedia({ video: { facingMode: { ideal: "environment" } } })`
  - `stopCamera()`：遍历 `stream.getTracks().forEach(track => track.stop())`
  - 自动清理：组件卸载、任务完成、返回、跳过时调用 `stopCamera()`
  - 权限拒绝处理：不报错，显示友好提示 + 提供 manual 降级

```typescript
function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unavailable">("prompt");
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => { /* ... */ }, []);
  const stopCamera = useCallback(() => { /* ... */ }, []);

  // cleanup on unmount
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  return { stream, permissionState, error, startCamera, stopCamera };
}
```

#### Step 4: 实现颜色辨识 (Color Detection)
- 文件：新建 `src/lib/colorDetection.ts`
- 算法：
  1. 从 `<video>` 元素截取中央 ROI（建议 64×64）
  2. 将 ROI 像素转换为 HSL
  3. 统计落入 `hueRanges` + 满足 `saturationMin/lightnessMin` 的像素比例
  4. 当比例 >= `pixelRatioThreshold` 时判定为"侦测到"
- 使用 `requestAnimationFrame` 或 `setInterval`（100-200ms 间隔）进行检测
- 注意：`hueRanges` 支持跨越 360°（如红色 `[[0, 15], [345, 360]]`）

#### Step 5: 实现稳定侦测进度 (Stable Detection)
- 文件：在 `CameraTaskModal` 或独立 hook 中实现
- 逻辑：
  - `detectedSince`：首次连续侦测到的时间戳
  - `lastDetectedAt`：最后一次侦测到的时间戳
  - `missTolerance = 300`：允许短暂 300ms 未侦测而不重置
  - 进度 = `Math.min(连续侦测时长 / durationMs, 1)`
- 避免镜头晃动导致进度瞬间归零

#### Step 6: 实现物件辨识 (COCO-SSD) — P1
- 文件：新建 `src/lib/objectDetection.ts`
- 使用 dynamic import：`const cocoSsd = await import("@tensorflow-models/coco-ssd")`
- 维护 `isInferenceRunning` flag 避免推理叠加
- 建立 `SUPPORTED_OBJECT_CLASSES` allowlist（白名单）：
```typescript
const SUPPORTED_OBJECT_CLASSES = new Set([
  "person", "bottle", "cup", "book", "chair", "teddy bear",
  "apple", "orange", "banana", "cell phone", "remote",
  "backpack", "umbrella", "handbag", "tie", "suitcase",
  "ball", "kite", "baseball bat", "baseball glove",
  "skateboard", "surfboard", "tennis racket",
  "wine glass", "fork", "knife", "spoon", "bowl",
  "carrot", "cake", "donut", "potted plant",
  "keyboard", "laptop", "mouse", "book"
]);
```
- 如果 `targetLabel` 不在 allowlist 中，跳过 ObjectDetection 直接降级
- 加载超时（8-12s）提示用户切换手动模式

#### Step 7: 渐进式降级策略
- 按 `cameraTask.strategies` 数组顺序尝试：
  1. 先尝试 Object Detection（若支持）
  2. 失败/超时 → 降级到 Color Detection
  3. Color Detection 无法满足条件 → 降级到 Manual
- 每个策略有明确超时和失败条件
- 所有路径最终都可回退到"大人帮忙确认"（Manual）

#### Step 8: 更新 RealWorldTask 组件
- 文件：`src/components/RealWorldTask.tsx`
- 根据 `realWorldTask.type` 分发：
  - `"choice"` → 现有选择题 UI（不变）
  - `"camera"` → 渲染 `CameraTaskModal`

#### Step 9: 更新关卡数据
- 文件：`src/levels.ts`
- 为每个关卡的 `realWorldTask` 添加 camera 任务选项（可保留原 choice 任务，由关卡配置选择使用哪种）

### 验收标准
- [ ] Camera 权限请求 UI 正常显示
- [ ] 权限拒绝时显示友好提示 + 可切换到手动模式
- [ ] Camera preview 正常显示（Desktop + Mobile）
- [ ] ROI 扫描框清晰可见
- [ ] 颜色辨识：将红色物体放在镜头前 → 侦测进度增长
- [ ] 颜色辨识：移开物体 → 进度在 tolerance 内保持，超时后缓慢下降
- [ ] 稳定侦测：晃动镜头不会导致进度归零
- [ ] 任务完成或关闭 → Camera track 正确释放（stream stopped）
- [ ] 切换关卡/返回 → Camera 自动关闭
- [ ] 隐私提示在首次使用时显示
- [ ] 任何时候可切换到"大人帮忙确认"
- [ ] 不使用镜头时不开启 getUserMedia
- [ ] Mobile Safari / Chrome 都能正常运行

---

## Part B: QA 测试提示 (QA Prompt)

### 功能测试

#### 1. 权限流程
- [ ] 首次打开 Camera 任务：弹出隐私提示
- [ ] 点击"知道了，开始"：触发 getUserMedia 权限请求
- [ ] 用户点击"允许"：Camera preview 正常显示
- [ ] 用户点击"拒绝"：显示"无法使用镜头，你可以选择由大人帮忙确认"
- [ ] "用大人确认"按钮：跳过 Camera，切换到 Manual 模式
- [ ] 隐私提示的"用大人确认"：直接跳过 Camera，不请求权限

#### 2. 颜色辨识
- [ ] 将纯红色物体放在镜头前：进度条开始增长
- [ ] 物体覆盖 ROI 区域 > 阈值比例：进度持续增长到 100%
- [ ] 进度到 100%：任务完成，Camera 关闭
- [ ] 短暂移开物体（< 300ms）：进度不变
- [ ] 移开物体超过 1s：进度开始缓慢下降
- [ ] 镜头晃动（快速移动）：不会导致进度归零
- [ ] 识别颜色：红色、蓝色、绿色分别测试

#### 3. 物件辨识（COCO-SSD）
- [ ] 加载 COCO-SSD 模型时显示"准备中..."
- [ ] 加载超过 8s：提示"加载时间较长，可以改用大人确认"
- [ ] 将物体（如瓶子、书本）放在镜头前：出现 bounding box
- [ ] 目标类别匹配：进度增长
- [ ] 非目标类别：不触发进度
- [ ] 非 allowlist 类别：不触发识别

#### 4. 渐进式降级
- [ ] Object Detection 不可用 → 自动降级到 Color Detection
- [ ] Color Detection 无法满足 → 自动提示手动确认
- [ ] 手动点击"大人帮忙确认" → 进入 ParentUnlock 流程
- [ ] 降级过程不报错，用户无感知或得到友好提示

#### 5. Camera Lifecycle
- [ ] 完成任务：stream track 全部停止
- [ ] 点击"关闭镜头"按钮：stream 停止
- [ ] 点击"跳过"：stream 停止
- [ ] 浏览器返回键：stream 停止
- [ ] 切换到其他 Tab → 回到页面：Camera 可重新启动
- [ ] 页面卸载（关闭 Tab）：无残留 MediaStream
- [ ] 切换关卡：前一个 Camera 完全清理

### 跨浏览器/平台测试
- [ ] **Desktop Chrome**：Camera + Color Detection 正常
- [ ] **Desktop Safari**：Camera + Color Detection 正常
- [ ] **Mobile Safari (iPhone)**：`facingMode: "environment"` 使用后置镜头
- [ ] **Mobile Chrome (Android)**：后置镜头优先
- [ ] **iPad**：Camera 正常工作
- [ ] **不支持 getUserMedia 的浏览器**：显示降级提示，不崩溃

### 隐私与安全
- [ ] 没有向任何服务器发送视频/图像数据
- [ ] 没有在 localStorage 保存视频/图像数据
- [ ] 没有调用 `canvas.toDataURL()` 保存画面
- [ ] 没有调用 `MediaRecorder`
- [ ] 没有使用任何面部识别 API
- [ ] 隐私提示文字清晰可读

### 边缘情况
- [ ] 同时打开两个 Camera 任务（不应出现，但需防御）
- [ ] 设备没有后置镜头 → fallback 到前置或提示
- [ ] 在极暗环境下测试颜色辨识 → 进度不增长，不报错
- [ ] 多个同色物体同时出现在 ROI → 正常识别
- [ ] 镜头被完全遮挡 → 进度不增长，不报错

### 性能
- [ ] 颜色辨识每 100-200ms 分析一次，不造成 UI 卡顿
- [ ] COCO-SSD 推理不影响页面响应
- [ ] Camera preview 帧率 >= 15fps
- [ ] 内存使用不持续增长（无内存泄漏）

### 回归测试
- [ ] 原 choice 类型任务（非 Camera）仍正常工作
- [ ] 完整三关流程可通关
- [ ] DirectionPad + 键盘操作正常
- [ ] ParentUnlock 功能正常
- [ ] Certificate 画面正常

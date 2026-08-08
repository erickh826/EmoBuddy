# Emotion Shards - 升級分工計劃

> 基於 `System_Spec.md`（原始 POC）與 `Upgrade_Spec.md`（升級規格）制定的分支分工計劃。

---

## 分支總覽

| 分支名稱 | 負責模組 | 優先級 | 預估工期 |
|----------|----------|--------|----------|
| `feature/2.5d-visual-upgrade` | Top-down 2.5D 視覺升級 + Theme System | **P0** | 優先 |
| `feature/camera-interaction` | 鏡頭互動架構（虛實整合） | **P0** | 優先 |
| `feature/ui-polish` | UI 動畫、過場、觸控回饋、字體、響應式 | **P1** | 可並行 |

```
main ──────────────────────────────────────────────────
       \
        ├── feature/2.5d-visual-upgrade ──→ (merge)
        ├── feature/camera-interaction ────→ (merge)
        └── feature/ui-polish ─────────────→ (merge)
```

---

## Branch 1: `feature/2.5d-visual-upgrade` — 視覺 2.5D 升級

### 目標
將現有純色方塊地圖升級為 Top-down 2.5D 風格 (Bomberman-inspired)，並建立可換主題的 Theme System。

### 涉及原始碼
| 類別 | 檔案 | 變更描述 |
|------|------|----------|
| **Types** | `src/types.ts` | 加入 `TileType`、`ThemeConfig`、四方向 sprite 型別 |
| **關卡資料** | `src/levels.ts` | 每關掛上 `ThemeConfig` |
| **Theme 系統** | `src/lib/themes.ts` (新建) | 主題定義：floor/wall/border/shard texture、CSS variables |
| **GameBoard** | `src/components/GameBoard.tsx` | 換掉純色 grid cell → 渲染 tile texture + 陰影裝飾 |
| **Player** | `src/components/Player.tsx` (新建/重構) | 四方向靜態 Sprite（上/下/左/右），CSS background-position |
| **DirectionPad** | `src/components/DirectionPad.tsx` | 按方向旋轉/變換角色面向 |
| **CSS** | `src/index.css` | 新增 Theme CSS variables、tile class、player sprite class |

### 具體工作項目 (Checklist)

#### Phase A: 型別與資料層 (P0)
- [ ] `src/types.ts`: 定義 `TileType` enum: `floor`, `wall`, `border`, `prop`, `shard`, `player`
- [ ] `src/types.ts`: 定義 `ThemeConfig` interface 對齊 Upgrade Spec §1.3
- [ ] `src/types.ts`: 定義 `PlayerDirection`: `"up" | "down" | "left" | "right"`
- [ ] `src/levels.ts`: 為每個 LevelConfig 添加 `theme: ThemeConfig`

#### Phase B: 素材生成 (P0)
素材規格（對齊 Upgrade Spec §1.2）:
- Tile source: **128 × 128** WebP
- Player sprite source: **256 × 256** WebP/PNG
- View: top-down 2.5D, 光源 **upper-left**, 陰影 **lower-right**
- Outline: soft dark blue-gray
- 無閃爍動畫

素材清單:
- [ ] `public/tiles/floor-grass.webp` — 草地地板
- [ ] `public/tiles/floor-stone.webp` — 石磚地板
- [ ] `public/tiles/floor-garden.webp` — 花園地板
- [ ] `public/tiles/wall-stone.webp` — 立體石塊障礙物
- [ ] `public/tiles/wall-tree.webp` — 樹木障礙物
- [ ] `public/tiles/border-brick.webp` — 磚塊邊框
- [ ] `public/tiles/prop-barrel.webp` — 木桶裝飾
- [ ] `public/tiles/prop-grass.webp` — 小草叢裝飾
- [ ] `public/sprites/player-up.webp` — 角色朝上
- [ ] `public/sprites/player-down.webp` — 角色朝下
- [ ] `public/sprites/player-left.webp` — 角色朝左
- [ ] `public/sprites/player-right.webp` — 角色朝右

> 註：素材可由 AI 生成或手繪，全部遵循上方規格確保一致性。

#### Phase C: Theme System (P0)
- [ ] `src/lib/themes.ts`: 建立 `THEMES` 常數，定義各主題：
  - `garden` (關卡1 - 快樂)
  - `forest` (關卡2 - 悲傷)
  - `village` (關卡3 - 社交)
- [ ] 每個 theme 包含 `className`、`floorTexture`、`wallTexture`、`borderTexture`、`shardTexture`、`backgroundColor`、`accentColor`
- [ ] CSS variables：在 `index.css` 定義 `:root { --theme-bg, --theme-accent, --floor-texture, --wall-texture, ... }`
- [ ] `GameBoard` 根據當前關卡的 `theme.className` 切換 CSS class

#### Phase D: GameBoard 渲染升級 (P0)
- [ ] 將 `grid[row][col] === 0` 渲染為 `<div>` 套用 floor tile class + CSS background
- [ ] 將 `grid[row][col] === 1` 渲染為 wall tile class，加入 3D 陰影 (box-shadow 或 pseudo-element)
- [ ] 地圖四周添加 border tile 層（用 CSS border 或額外 border-cell）
- [ ] 可選：在部分 floor cell 上隨機點綴 prop 裝飾（不會 blocking）

#### Phase E: Player Sprite (P0)
- [ ] 建立 `Player` component，接受 `direction: PlayerDirection`
- [ ] 根據 `direction` 顯示對應 sprite（`background-image` + `background-position`）
- [ ] 角色使用 `absolute` 定位，`transition` 平滑移動
- [ ] 確保角色在 tile 上方（z-index）

#### Phase F: DirectionPad 方向同步 (P0)
- [ ] 點擊方向鍵時不僅移動角色，也更新 `playerDirection` state
- [ ] 將 `playerDirection` 傳入 `Player` component
- [ ] 鍵盤輸入 (Arrow/WASD) 也同步更新方向

### 驗收標準
- [ ] 三關各有不同的地板/牆壁/邊框材質
- [ ] 角色面朝移動方向
- [ ] 地圖有 2.5D 深度感（陰影、立體感）
- [ ] 無閃爍或過亮動畫
- [ ] 桌面版與手機版都正常顯示 tile

---

## Branch 2: `feature/camera-interaction` — 鏡頭互動架構

### 目標
為現實任務新增「鏡頭尋物」模式，支援顏色辨識與（可選）物件辨識，並加入完整的隱私保護與漸進式降級。

### 涉及原始碼
| 類別 | 檔案 | 變更描述 |
|------|------|----------|
| **Types** | `src/types.ts` | 拆分 `DigitalObjectiveType` / `RealWorldTaskType`，新增 `CameraTask`、`CameraDetectionStrategy` 型別 |
| **關卡資料** | `src/levels.ts` | LevelConfig 加入 `camera` 類型任務、fallback strategy |
| **Camera Modal** | `src/components/CameraTaskModal.tsx` (新建) | 鏡頭 UI：預覽畫面、掃描框 ROI、進度條、隱私提示 |
| **Color Detection** | `src/lib/colorDetection.ts` (新建) | 中央 ROI 像素分析、HSL 比對、穩定偵測邏輯 |
| **Object Detection** | `src/lib/objectDetection.ts` (新建) | COCO-SSD dynamic import、類別白名單、推論排程 |
| **Camera Hook** | `src/hooks/useCamera.ts` (新建) | `getUserMedia` lifecycle、start/stop/cleanup |
| **RealWorldTask** | `src/components/RealWorldTask.tsx` | 支援 `taskType === "camera"` 分支 |
| **Privacy Notice** | `src/components/CameraPrivacyNotice.tsx` (新建) | 隱私提示彈窗 / 說明文字 |

### 具體工作項目 (Checklist)

#### Phase A: 型別重構 (P0)
- [ ] `src/types.ts`: 將現有 `ObjectiveType` 拆分為：
  ```typescript
  type DigitalObjectiveType = "collect-shard" | "interact-with-npc";
  type RealWorldTaskType = "choice" | "camera";
  ```
- [ ] `src/types.ts`: 定義 `CameraDetectionStrategy`（對齊 Upgrade Spec §2.2）
- [ ] `src/types.ts`: 定義 `HSLColorTarget`（對齊 Upgrade Spec §2.3）
- [ ] `src/types.ts`: 定義 `CameraTask` interface
- [ ] `src/types.ts`: 更新 `RealWorldTask` interface 支援 camera type
- [ ] `src/types.ts`: 定義 `SUPPORTED_OBJECT_CLASSES` allowlist

#### Phase B: Camera Hook (P0)
- [ ] `src/hooks/useCamera.ts`: 封裝 `getUserMedia` lifecycle
  - `startCamera()` — 使用 `facingMode: { ideal: "environment" }`（後鏡頭）
  - `stopCamera()` — `stream.getTracks().forEach(t => t.stop())`
  - `videoRef` — 指向 `<video>` element
  - `error` — 權限拒絕或裝置錯誤
  - `isReady` — stream 就緒 flag
- [ ] 在元件 unmount、任務完成、跳過時自動 cleanup
- [ ] 處理 Mobile Safari / Chrome 相容性

#### Phase C: Color Detection Engine (P0)
- [ ] `src/lib/colorDetection.ts`: 主要函數：
  - `analyzeROI(video, roiBounds, downsampleSize)` → 取得中央 ROI 像素
  - `matchHSL(pixels, target: HSLColorTarget)` → 是否符合目標顏色
  - `getDetectionProgress(stableDuration, totalDuration)` → 回傳 0-100 進度
- [ ] ROI 掃描框：畫面中央固定區域 (e.g., 40% × 40%)
- [ ] Downsample 至 64 × 64 減少運算量
- [ ] 每 150ms 分析一次 (requestAnimationFrame / setInterval)
- [ ] 穩定偵測：`detectedSince` + `lastDetectedAt` + 250ms miss tolerance
- [ ] 支援跨 360° hue range（例如紅色 `[[0, 15], [345, 360]]`）

#### Phase D: Camera UI (P0)
- [ ] `src/components/CameraPrivacyNotice.tsx`: 隱私提示
  - 「鏡頭只用來在這部裝置上尋找顏色或物品，不會拍照或上傳」
  - 「你也可以選擇由大人幫忙確認」
  - 不錄影、不拍照、不上傳、不保存 frame、不偵測臉部
- [ ] `src/components/CameraTaskModal.tsx`: 主鏡頭 UI
  - 中央 ROI 掃描框（半透明 overlay + 清楚邊框）
  - 圓形進度環 (0–100%)
  - 目標顏色/物品標籤提示
  - 「跳過」按鈕（改用大人確認）
  - 「切換鏡頭」按鈕（前/後鏡頭切換，P1）
  - `facingMode` 錯誤時自動降級

#### Phase E: 整合 RealWorldTask (P0)
- [ ] `src/components/RealWorldTask.tsx`: 根據 `taskType` 分支
  - `taskType === "choice"` → 現有選項按鈕流程
  - `taskType === "camera"` → 先顯示隱私提示 → 開啟 CameraTaskModal
- [ ] 相機關閉時正確回到任務選擇畫面
- [ ] 手動確認 fallback 永遠可觸發

#### Phase F: Object Detection — COCO-SSD (P1, 後做)
- [ ] `src/lib/objectDetection.ts`: Dynamic import COCO-SSD
  ```typescript
  const cocoSsd = await import("@tensorflow-models/coco-ssd");
  const model = await cocoSsd.load();
  ```
- [ ] `isInferenceRunning` flag 避免推論疊加
- [ ] 類別白名單：只有 `SUPPORTED_OBJECT_CLASSES` 中的類別才算匹配
- [ ] 載入 timeout (8–12s)：超時提示改用大人確認
- [ ] Bounding box 繪製：在 video overlay 上畫框

### 驗收標準
- [ ] 相機權限拒絕時不 crash，顯示友善提示
- [ ] 顏色辨識在正常光線下準確率 > 80%
- [ ] ROI 掃描框清楚可見
- [ ] 任務完成、跳過、換頁時 stream 確實釋放
- [ ] 不拍照、不上傳、不儲存任何影像
- [ ] Mobile Safari + Chrome 實機測試通過

---

## Branch 3: `feature/ui-polish` — UI 動畫與體驗打磨

### 目標
根據 `ui-upgrade-checklist.md`，對全部畫面進行動畫、回饋、字體、過場等視覺體驗升級。

### 涉及原始碼
| 類別 | 檔案 | 變更描述 |
|------|------|----------|
| **WelcomeScreen** | `src/components/WelcomeScreen.tsx` | 角色動畫、背景漸層、按鈕浮動效果 |
| **LevelIntro** | `src/components/LevelIntro.tsx` | 情緒主題背景卡、目標動畫圖示 |
| **GameBoard** | `src/components/GameBoard.tsx` | 完成粒子效果、進度指示器 |
| **DirectionPad** | `src/components/DirectionPad.tsx` | 按鈕縮放動畫、震動 API（手機） |
| **RealWorldTask** | `src/components/RealWorldTask.tsx` | 毛玻璃背景、卡片懸浮、勾選動畫 |
| **ParentUnlock** | `src/components/ParentUnlock.tsx` | 圓形進度環、開鎖動畫、彩帶效果 |
| **LevelComplete** | `src/components/LevelComplete.tsx` | 旋轉星星、打字機效果、粒子慶祝 |
| **Certificate** | `src/components/Certificate.tsx` | 裝飾邊框、3D 獎盃、完成印章 |
| **Global CSS** | `src/index.css`, `src/App.css` | 頁面切換過場、字體、CSS 變數 |

### 具體工作項目 (Checklist)

#### Phase A: 全域基礎 (P1)
- [ ] 引入圓潤字體（如 Nunito / Quicksand，適合兒童）
- [ ] 定義 CSS transition variables (`--transition-smooth`, `--transition-bounce`)
- [ ] 頁面切換：淡入淡出 + 輕微 scale (opacity + transform)
- [ ] `<body>` overscroll-behavior: none 防止方向盤操作時頁面滑動

#### Phase B: WelcomeScreen (P1)
- [ ] 背景改為漸層色 + 柔和雲朵/星空插畫
- [ ] 角色預覽區域：加入呼吸動畫（scale 1.0 ↔ 1.03循環）
- [ ] 開始按鈕：圓潤大按鈕 + hover 浮起 + 點擊漣漪效果

#### Phase C: LevelIntro (P1)
- [ ] 關卡名稱卡片：情緒主題背景色 + 圓角 + 陰影
- [ ] 目標圖示：碎片旋轉動畫 / NPC 揮手動畫
- [ ] 開始按鈕：脈衝動畫 (box-shadow scale pulse)

#### Phase D: GameBoard 內效果 (P1)
- [ ] 碎片收集效果：粒子爆發 + 星星飛散（輕柔、短暫）
- [ ] NPC 完成效果：柔和光環擴散
- [ ] 關卡標題列：主題色背景條 + 步驟指示器 (dot progress)

#### Phase E: DirectionPad (P1)
- [ ] 方向鍵：圓潤大按鈕 + 主題色 semi-transparent 背景
- [ ] 按下回饋：scale(0.9) → scale(1.05) 彈簧動畫
- [ ] 手機震動：`navigator.vibrate(15)` (short tap feedback)
- [ ] Active/Inactive 狀態視覺區分

#### Phase F: RealWorldTask Modal (P1)
- [ ] 彈窗背景：`backdrop-filter: blur()` + 半透明 overlay
- [ ] 選項按鈕：大圓角卡片 + hover scale(1.02) + shadow 浮起
- [ ] 已選狀態：勾選圖示 animate + 邊框發光
- [ ] 完成按鈕：彩虹漸層 + 脈衝動畫

#### Phase G: ParentUnlock (P1)
- [ ] 改為圓形環繞進度 (SVG circle stroke-dasharray)
- [ ] 鎖定圖示：搖晃動畫 (pending) → 開鎖動畫 (unlocked)
- [ ] 成功效果：彩帶/紙花飄落 + 音效
- [ ] 跳過按鈕保持可用

#### Phase H: LevelComplete (P1)
- [ ] 星星圖示：旋轉 + 發光 (gold glow)
- [ ] 完成訊息：打字機效果 (逐字顯示)
- [ ] 背景：柔和彩紙/氣球浮動
- [ ] 下一關按鈕：箭頭彈跳動畫

#### Phase I: Certificate (P1)
- [ ] 獎狀容器：裝飾性邊框（CSS border-image 或 pseudo-element 花紋）
- [ ] 獎盃圖示：3D 風格 CSS 或動畫旋轉
- [ ] 關卡回顧：每關圖示 + 進度條 + 印章圖案
- [ ] 排版：居中對稱證書風格
- [ ] 下載按鈕：大圓角 + 下載箭頭動畫

#### Phase J: 響應式 & 觸控 (P1)
- [ ] 手機直屏：DirectionPad 調整位置避免被瀏覽器 UI 遮擋
- [ ] 橫屏手機：GameBoard + DirectionPad 左右並排佈局
- [ ] `env(safe-area-inset-*)` 處理瀏海/底部 bar
- [ ] Swipe 手勢可選 (P2) — 本次不做

### 驗收標準
- [ ] 所有動畫符合 `prefers-reduced-motion` 要求
- [ ] 動畫輕柔、短暫 (< 1s)、不閃爍
- [ ] 手機觸控回饋明顯但不干擾
- [ ] Desktop / Tablet / Mobile 佈局都能使用

---

## 合併順序建議

```
1. feature/2.5d-visual-upgrade   (先合，因為會改 GameBoard 渲染層)
       ↓
2. feature/camera-interaction     (依賴 types.ts 重構結果)
       ↓
3. feature/ui-polish              (依賴前兩者 UI 結構穩定)
```

| 順序 | 分支 | 原因 |
|------|------|------|
| **1st** | `feature/2.5d-visual-upgrade` | GameBoard 渲染層重構影響最大，先穩定基礎 |
| **2nd** | `feature/camera-interaction` | types.ts 重構需與 visual-upgrade 的型別變更協調 |
| **3rd** | `feature/ui-polish` | UI 動畫打磨依賴前兩者 UI 元件結構穩定 |

**衝突注意**：
- Branch 1 與 Branch 2 都會修改 `src/types.ts`，合併時需手動 resolve
- Branch 1 與 Branch 3 都會修改 `DirectionPad.tsx`、`GameBoard.tsx`
- Branch 2 與 Branch 3 都會修改 `RealWorldTask.tsx`
- 建議合併 Branch 1 後，Branch 2 & 3 先 rebase 到最新 main 再合

---

## 快速開始指令

```bash
# 切換到各分支開始開發
git checkout feature/2.5d-visual-upgrade   # 視覺升級
git checkout feature/camera-interaction     # 鏡頭互動
git checkout feature/ui-polish             # UI 打磨

# 完成後合併（建議順序）
git checkout main
git merge feature/2.5d-visual-upgrade
git merge feature/camera-interaction
git merge feature/ui-polish
```

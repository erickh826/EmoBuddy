# Emotion Shards - POC 升級規格書 (Upgrade Specification)

在完成 POC（概念驗證）階段後，本專案將針對「視覺外觀」與「互動機制」進行深度升級。本文件定義了 Top-down 2.5D 的視覺升級計畫，以及基於鏡頭的虛實整合互動架構。

## 1. 視覺外觀升級：Top-down 2.5D (Bomberman-inspired)

為提升遊戲吸引力並保持 ASD 友善的低刺激原則，視覺將從現有的純色方塊升級為 Top-down 2.5D 質感。

### 1.1 視覺元素對比與目標

*   **視角設計**：採用 **Top-down 2.5D**（非真正斜角 Isometric），地圖仍是正方形 top-down grid，角色沿上下左右移動，保留清晰的操作方向認知。
*   **地板 (Floor)**：帶有輕微紋理的石磚或草地。
*   **障礙物 (Wall)**：頂面與正面陰影分離的立體石塊。
*   **裝飾物 (Props)**：點綴性的木桶或小草叢（需定義為正式的 `CellType` 或 `TileType`）。
*   **角色 (Player)**：具備輪廓線的卡通角色，支援四方向靜態 Sprite。
*   **邊框 (Border)**：使用實體磚塊圍繞地圖邊界。

### 1.2 素材生成規格統一
為了確保 AI 生成素材的一致性，必須遵循以下規格：
*   **Tile source size**: 128 × 128
*   **Player sprite source size**: 256 × 256
*   **Format**: WebP（透明素材使用 PNG/WebP）
*   **View**: top-down 2.5D
*   **Lighting**: upper-left
*   **Shadow direction**: lower-right
*   **Outline**: soft dark blue-gray
*   **無閃爍動畫**、**無動態紋理**

### 1.3 動態主題系統 (Theme System)
建立正式的 `ThemeConfig` 資料結構，並透過 CSS 變數切換主題。
```typescript
interface ThemeConfig {
  id: string;
  className: string;
  floorTexture: string;
  wallTexture: string;
  borderTexture: string;
  shardTexture: string;
  backgroundColor: string;
  accentColor: string;
}
```

## 2. 鏡頭互動架構：虛實整合探索任務

為了讓自閉症兒童能將遊戲體驗延伸至現實環境，新增「鏡頭尋物」任務。

### 2.1 架構修正：分離數位目標與現實任務
Camera 屬於現實任務的一種呈現方式，不應與數位地圖目標混淆。
```typescript
type DigitalObjectiveType = "collect-shard" | "interact-with-npc";
type RealWorldTaskType = "choice" | "camera";

interface LevelConfig {
  id: number;
  title: string;
  playerStart: Position;
  grid: number[][];
  digitalObjective: DigitalObjective;
  realWorldTask: RealWorldTask;
  theme: ThemeConfig;
}
```

### 2.2 漸進式降級策略 (Progressive Degradation)
不允許 Object Task 無條件自動降級為 Color Task。必須明確為每個任務設定 Fallback 策略。
```typescript
type CameraDetectionStrategy =
  | ObjectDetectionStrategy
  | ColorDetectionStrategy
  | ManualDetectionStrategy;

interface CameraTask {
  targetLabel: string;
  strategies: CameraDetectionStrategy[];
  durationMs: number;
}
```

### 2.3 顏色辨識規格 (Color Detection)
*   **不掃描全畫面**：畫面中央提供清楚的掃描框（ROI），只分析中央 ROI，並將其 downscale（如 64×64）。每 100–200ms 分析一次。
*   **HSL 資料結構修正**：
```typescript
interface HSLColorTarget {
  hueRanges: Array<[number, number]>; // 支援跨越 360°，例如 [[0, 15], [345, 360]]
  saturationMin: number;
  lightnessMin: number;
  lightnessMax?: number; // 排除過亮畫面高光
  pixelRatioThreshold: number;
}
```

### 2.4 物件辨識規格 (Object Detection - COCO-SSD)
*   **類別白名單**：建立 `SUPPORTED_OBJECT_CLASSES` allowlist，避免關卡作者輸入模型不認識的類別（例如 `toy` 不在名單內）。
*   **避免推論疊加**：使用 `isInferenceRunning` flag 確保前一次推論完成後才進行下一次。
*   **載入與超時**：需顯示準備提示。若準備時間過長（如 8-12 秒），提示使用者可改用大人確認，不視為錯誤。

### 2.5 穩定偵測進度 (Stable Detection Progress)
避免短暫偵測或鏡頭輕微晃動導致進度瞬間歸零。
需實作 `detectedSince`、`lastDetectedAt`，並加入 200–300ms 的 miss tolerance。

### 2.6 Camera Lifecycle 與隱私
*   **啟動**：必須由明確的使用者操作啟動。使用 `facingMode: { ideal: "environment" }`。
*   **關閉與清理**：任務完成、返回、跳過、卸載、換關或進入背景時，必須停止 track (`stream.getTracks().forEach(track => track.stop())`) 並清除所有 timer/RAF。
*   **隱私與 ASD-friendly UX**：
    *   明確提示：「鏡頭只用來在這部裝置上尋找顏色或物品，不會拍照或上傳。你也可以選擇由大人幫忙確認。」
    *   不錄影、不拍照、不上傳、不保存 frame、不偵測臉部/表情。
    *   隨時可關閉、跳過或改用手動確認。拒絕權限不視為失敗。

## 3. 開發優先級與順序

### 3.1 優先級 (Priority)
**P0 (核心升級)**：
*   Tile 素材替換、Player 四方向 Sprite、Theme system
*   Camera permission UI、Camera preview
*   Color Detection (中央 ROI、穩定偵測進度)
*   Manual confirmation、Camera lifecycle cleanup
*   Privacy notice、Mobile Safari/Chrome 測試

**P1 (進階功能)**：
*   COCO-SSD dynamic import、Object class allowlist
*   Loading timeout、Object detection bounding box
*   Object → explicit fallback strategy
*   Camera switching、效能調整

**P2 (本次不做)**：
*   自訂模型、任意物件辨識、拍照保存、上傳影像、臉部辨識等。

### 3.2 建議開發順序
1.  建立 `ThemeConfig`
2.  換 Floor、Wall、Border 素材
3.  換 Player Sprite
4.  建立 `CameraTaskModal`，但只做 Manual 確認
5.  接 `getUserMedia` 與完整 cleanup
6.  加中央 ROI
7.  實作 Color Detection
8.  手機實機測試
9.  最後才 Dynamic Import COCO-SSD
10. 加入 timeout、allowlist 和 fallback 策略

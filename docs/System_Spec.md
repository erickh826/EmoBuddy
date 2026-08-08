# Emotion Shards - System Specification

## 1. 核心限制與技術選型

本專案為三天黑客松開發，目標是製作一個讓自閉症兒童與家長共同進行虛實互動任務的低刺激網頁遊戲。為確保能在時限內完成，並維持 Demo 穩定性，設立以下核心限制：

1.  **框架限制**：使用 React + TypeScript + Vite，搭配 DOM + CSS Grid 渲染，**不使用** Canvas、Phaser 或物理引擎。
2.  **狀態限制**：使用 React `useReducer`，**不使用** Redux 或 Zustand。三個關卡必須共用一套 `GameBoard` 與狀態管理，不可為每關建立完全獨立的遊戲邏輯。
3.  **功能限制**：**不使用**後端、資料庫、帳號系統、相機、麥克風、AI API、語音辨識或手勢辨識。
4.  **開發時限**：必須能在三天內完成。
5.  **文件目標**：提供足夠明確的架構與規格，讓 AI coding assistant 可以依照此文件直接開始產生程式碼。

### 技術選型
*   **React** / **TypeScript** / **Vite**
*   **CSS Modules** 或一般 CSS
*   **DOM + CSS Grid**
*   **CSS Transform** 和 **CSS Transition**
*   **useReducer**
*   **HTMLAudioElement**
*   **localStorage**
*   **html-to-image**
*   **lucide-react**
*   **Vercel**

## 2. 系統架構與型別定義

### 2.1 基礎型別定義
```typescript
type Direction = "up" | "down" | "left" | "right";

interface Position {
  row: number;
  col: number;
}

type ObjectiveType = "collect-shard" | "interact-with-npc";

interface TaskChoice {
  id: string;
  label: string;
  icon: string;
}
```

### 2.2 關卡資料結構 (LevelConfig)
關卡資料採資料驅動設計，第一、第二關為 `collect-shard`，第三關為 `interact-with-npc`。
```typescript
interface LevelConfig {
  id: number;
  title: string;
  emotion: string;
  objectiveType: ObjectiveType;
  playerStart: Position;
  grid: number[][]; // 0 = 可以行走, 1 = 障礙物
  shard?: {
    icon: string;
    color: string;
    position: Position;
  };
  npc?: {
    icon: string;
    position: Position;
  };
  realWorldTask: {
    title: string;
    description: string;
    choices: TaskChoice[];
  };
  completionMessage: string;
  theme: string;
}
```

## 3. 狀態管理 (State Management)

### 3.1 GamePhase 定義與流程
```typescript
type GamePhase =
  | "welcome"
  | "level-intro"
  | "playing"
  | "real-world-task"
  | "parent-confirmation"
  | "level-complete"
  | "certificate";
```
**狀態流轉**：
`welcome` → `level-intro` → `playing` → `real-world-task` → `parent-confirmation` → `level-complete` → 下一關 `level-intro` → 最後一關完成後 `certificate`。

### 3.2 GameState
```typescript
interface GameState {
  levelIndex: number;
  phase: GamePhase;
  playerPosition: Position;
  muted: boolean;
  reducedMotion: boolean;
  objectiveCompleted: boolean;
  selectedTaskChoice?: string;
  selectedEmotion?: string;
}
```
*備註：`ParentUnlock` 的即時長按百分比保留在元件 local state，不放入全域 reducer。*

### 3.3 GameAction 與 Reducer 責任
```typescript
type GameAction =
  | { type: "START_GAME" }
  | { type: "START_LEVEL" }
  | { type: "MOVE_PLAYER"; position: Position }
  | { type: "COMPLETE_DIGITAL_OBJECTIVE" }
  | { type: "SELECT_TASK_CHOICE"; choiceId: string }
  | { type: "OPEN_PARENT_CONFIRMATION" }
  | { type: "PARENT_CONFIRMED" }
  | { type: "NEXT_LEVEL"; nextLevelStartPos: Position; isLastLevel: boolean }
  | { type: "SELECT_EMOTION"; emotion: string }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_REDUCED_MOTION" }
  | { type: "RESTART_GAME" };
```
**Reducer 責任**：
*   Reducer 只負責狀態轉換，不負責地圖碰撞計算。
*   合法移動位置由 `useGame` 或純 utility function（如 `getNextPosition(currentPosition, direction, grid)`）計算，確認合法後才 dispatch `MOVE_PLAYER`。
*   `NEXT_LEVEL` 行為：增加 `levelIndex`，將 `playerPosition` 設為傳入的 `nextLevelStartPos`，清除上一關的 `objectiveCompleted`、`selectedTaskChoice` 和 `selectedEmotion`，並將 phase 設為 `level-intro`。若 `isLastLevel` 為 true，則進入 `certificate`。

## 4. 遊戲機制與互動規則

### 4.1 輸入與碰撞規則
*   只有 `phase === "playing"` 時可以移動。
*   每次只允許上下左右移動一格，不允許超出地圖邊界，且 `grid` 值為 `1` 的格子不可進入。
*   撞到障礙物不扣分、不播放刺耳音效、不導致失敗。
*   Modal 開啟時必須停用鍵盤與 DirectionPad。
*   鍵盤輸入需支援 Arrow keys 與 WASD。畫面需提供大型 DirectionPad，支援 pointer/touch。
*   不實作 swipe gesture。避免按住鍵盤造成過快移動（可使用簡單 cooldown 或忽略 transition 期間的重複輸入）。

### 4.2 ParentUnlock (家長解鎖)
*   統一使用「長按 2 秒」解鎖：`pointerdown` 開始；`pointerup`、`pointerleave`、`pointercancel` 時取消。
*   使用可視化圓形或線性進度，同時支援滑鼠和觸控。
*   完成後只能 dispatch 一次。長按區域必須有文字，不可只顯示鎖頭 icon。
*   元件卸載時必須清除 timer。
*   可提供「這次先跳過」選項，跳過不視為失敗。
*   `useLongPress` 介面：`useLongPress(callback: () => void, ms: number = 2000)`，回傳 event handlers 與當前進度。

## 5. ASD-friendly UI/UX 規格 (自閉症友善設計)

此設計旨在降低刺激並提供選擇，而非宣稱單一設計適合所有自閉症兒童。
*   **無失敗機制**：不把特定行為設定為唯一正確答案。現實任務提供多種等價完成方式，且皆可跳過，無 Game Over，無時間限制。
*   **低刺激視覺**：無閃爍動畫，慶祝動畫短、柔和且不循環。使用低飽和背景及清楚的文字對比。支援 `prefers-reduced-motion`。
*   **多感官提示**：情緒碎片同時使用顏色、圖示與文字傳達資訊，不只依賴顏色。
*   **音效控制**：避免突然播放音效，提供全域靜音。
*   **易用性 (A11y)**：主要互動按鈕最小約 48 × 48 CSS pixels。使用清晰的 sans-serif 字體。Modal 使用 `role="dialog"`、`aria-modal="true"` 與清楚標題，並正確管理 focus 轉移。所有 icon button 必須提供 accessible name。

## 6. 音效、存儲與獎狀規格

### 6.1 音效規格
*   MVP 使用 `HTMLAudioElement`。
*   音效只在使用者第一次互動後播放（符合瀏覽器 autoplay 限制），不自動播放背景音樂。
*   `muted` 為 true 時不得播放任何音效。音效載入失敗不應阻止遊戲流程。音量應保持柔和。
*   語音提示列為 P1，可使用預錄音訊；Web Speech API 只能是 optional fallback。

### 6.2 localStorage 規格
*   只保存：`muted`, `reducedMotion`, 可選的 `currentLevel`。
*   使用有版本的 key：`emotion-shards:settings:v1`, `emotion-shards:progress:v1`。
*   必須處理 JSON parse error、localStorage 不可用及舊版本資料的情況。不儲存任何敏感資訊。

### 6.3 獎狀與 fallback (Certificate)
*   可直接在畫面顯示。不需要輸入兒童真實姓名，預設使用「超級社交探險家」。
*   提供重新開始按鈕。
*   下載 PNG 為 P1（使用 React ref 配合 `html-to-image`）。下載失敗時顯示友善提示，仍保留畫面上的獎狀。

## 7. 響應式與視覺規格

*   Desktop、tablet、mobile 都能操作，主要以 landscape tablet 或 desktop Demo 為優先。
*   `GameBoard` 使用 `width: min(88vw, 560px)` 和 `aspect-ratio: 1`。
*   畫面高度使用 `100dvh`，並處理安全區 `env(safe-area-inset-*)`。
*   角色使用 `absolute` positioning 與 CSS `transform`。地圖尺寸小，整體重新 render 成本可接受。
*   避免頁面在操作 DirectionPad 時意外捲動。

## 8. 功能優先級與 Acceptance Criteria

### 8.1 功能優先級
**P0 (必須完成)**：
*   三關完整流程、CSS Grid 地圖、玩家移動、碰撞
*   數位目標、現實任務 Modal、家長長按確認
*   Level Complete、Certificate 畫面
*   全域靜音、響應式 UI、Vercel 部署

**P1 (進階功能)**：
*   預錄語音、html-to-image PNG 下載
*   localStorage 進度、柔和慶祝動畫、手動 reduced-motion toggle

**P2 (本次不做)**：
*   相機、麥克風、語音/圖像/手勢辨識
*   帳號、後端、排行榜、自動生成迷宮、Phaser、遊戲內 AI API

### 8.2 Acceptance Criteria (驗收標準)
*   使用鍵盤及畫面 DirectionPad 都能完成三關。
*   玩家不能走出地圖或穿過障礙物；障礙物不會造成失敗或扣分。
*   Modal 開啟時玩家不能移動。
*   每個現實任務都有多種選項及跳過功能。
*   ParentUnlock 長按不足 2 秒不會解鎖；長按完成只觸發一次。
*   下一關會正確重設玩家位置和暫存選擇。
*   最後一關完成後顯示獎狀。
*   靜音後不播放任何音效；reduced-motion 下移除非必要動畫。
*   在常見手機及桌面 viewport 不會出現關鍵按鈕被裁切。
*   重整頁面不會因 localStorage 錯誤而白屏。
*   即使音效或 PNG 下載失敗，核心流程仍可完成。

## 9. 測試清單與開發順序建議

### 9.1 測試清單 (手動測試 Checklist)
*   [ ] Desktop Chrome / Mobile viewport
*   [ ] Keyboard / Touch/pointer 操控
*   [ ] Parent long press cancel 行為
*   [ ] Rapid repeated input (快速重複輸入)
*   [ ] Refresh (頁面重整)
*   [ ] Muted mode / Reduced-motion mode
*   [ ] Last-level transition (最後一關切換)
*   [ ] Certificate fallback (獎狀下載失敗)
*   [ ] Vercel production URL

*(純函式如 `getNextPosition`, `isPositionBlocked`, `validateLevelConfig`, `gameReducer` 可列為單元測試候選)*

### 9.2 開發順序建議 (供 AI Coding Assistant 參考)
建議依序完成並測試，避免一次產生過多互相不一致的程式碼：
1.  `types` + `levels data`
2.  `reducer` + `movement utilities`
3.  `useGame`
4.  `GameBoard` + `Player`
5.  `DirectionPad` + `keyboard`
6.  `Modal` + `ParentUnlock`
7.  `LevelComplete` + `Certificate`
8.  `audio` + `persistence`
9.  `responsive polish`

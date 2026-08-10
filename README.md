# 🧩 EmoBuddy (情緒好夥伴)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg)](https://vitejs.dev/)

**EmoBuddy** 是一款專為兒童（包含自閉症類群障礙 ASD / 特殊教育需求兒童）設計的 **Top-Down 2.5D 情緒探索互動遊戲**。

透過數位遊戲的關卡探索，結合**現實世界鏡頭互動任務**，引導孩子在安心、友善的環境中學習認識情緒、表達感受與完成任務。

---

## 🎥 示範影片 (Demo)

[![EmoBuddy Demo](https://img.youtube.com/vi/upgyQBOm8xk/maxresdefault.jpg)](https://www.youtube.com/watch?v=upgyQBOm8xk)

> 點擊上方圖片觀看完整遊戲示範影片

## ✨ 核心特色 (Core Features)

### 🎨 Top-Down 2.5D 關卡與 Theme 系統
- **三關獨立主題**：
  1. **開心花園**（Happy Garden）：暖色調、花朵與快樂情緒碎片。
  2. **平靜森林**（Calm Forest）：綠色調、樹木與平靜情緒碎片。
  3. **勇敢山丘**（Brave Hills）：暖橙色調、岩石與勇敢夥伴 NPC 互動。
- 支援方向控制（四方向 Player Sprite 變換、鍵盤 WASD/方向鍵、觸控方向盤）。

### 📷 零隱私疑慮的鏡頭實境任務 (Camera Interaction)
- **100% 裝置端本地推理**：不錄影、不拍照、不安裝後端，零資料上傳。
- **雙重 AI 偵測策略**：
  - **顏色辨識**（HSL ROI）：尋找指定顏色物品（例如：紅色的東西、藍色的東西）。
  - **物件辨識**（TensorFlow.js COCO-SSD）：尋找特定日常物品（例如：書本、杯子）。
- **平滑降級機制**：模型載入較慢或權限被拒時，隨時可切換為「大人幫忙確認」模式。

### 💙 ASD 自閉症友善設計 (ASD-Friendly)
- **視覺防刺激**：低飽和度色彩、無高頻閃爍或劇烈動畫。
- **無敏感動畫**：完全支援 `prefers-reduced-motion`（開啟時關閉旋轉與過度位移）。
- **完全可控**：無強制倒數懲罰，随時可跳過、靜音或退出。

### 🎓 家長 / 教師驗證與證書 (Parent Gate & Certificate)
- **家長解鎖機制**（ParentUnlock）：防誤觸的 2 秒長按驗證。
- **成果證書**：完成全通關後可自訂名稱、選擇情緒貼紙，並一鍵下載專屬證書。

---

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**：React 19 + TypeScript + Vite
- **UI & 樣式**：Tailwind CSS + shadcn/ui + Lucide Icons
- **AI 物件辨識**：TensorFlow.js (`@tensorflow/tfjs`) + COCO-SSD (`@tensorflow-models/coco-ssd`)
- **證書導出**：`html-to-image`
- **資產生成**：Python 3 + Pillow / Gemini API / OpenAI API 整合腳本

---

## 🚀 快速開始 (Getting Started)

### 1. 安裝需求 (Prerequisites)
- [Node.js](https://nodejs.org/) (建議 v18 以上)
- npm / pnpm / yarn

### 2. 本地開發 (Development)
```bash
# 複製專案
git clone https://github.com/your-repo/EmoBuddy.git
cd EmoBuddy

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器造訪 `http://localhost:5173` 即可開始體驗！

### 3. 生成 2.5D 遊戲資產 (Asset Generation)
專案內建 AI 遊戲資產生成腳本，可自動產生 17 種素材（Tiles / Sprites / Props）：
```bash
# 產生佔位符素材 (無需 API Key)
python3 scripts/generate_assets.py --provider mock

# 使用 Gemini API 產生真實 AI 圖檔
export GEMINI_API_KEY="your-api-key"
python3 scripts/generate_assets.py --provider gemini
```

### 4. 正式打包 (Production Build)
```bash
npm run build
```

---

## 📂 專案結構 (Directory Structure)

```text
EmoBuddy/
├── docs/prompts/           # 專案設計規格與 AI 生圖提示詞
├── public/assets/          # 2.5D 遊戲地圖 tiles 與角色 sprites (Git ignored)
├── scripts/                # 自動化資產生成腳本
│   └── generate_assets.py
├── src/
│   ├── components/         # 核心 UI 元件 (GameBoard, CameraTaskModal, RealWorldTask, Certificate)
│   ├── hooks/              # 自訂 Hooks (useCamera, useAudio)
│   ├── lib/                # 演算法邏輯 (colorDetection, objectDetection)
│   ├── themes/             # 2.5D 主題設定與 CSS 變數
│   ├── levels.ts           # 關卡地圖與任務設定
│   ├── types.ts            # 全局 TypeScript 型態定義
│   ├── App.tsx             # 遊戲主流程 reducer 狀態機
│   └── main.tsx
├── LICENSE                 # Apache-2.0 開源授權條款
└── package.json
```

---

## 🔒 隱私與安全條款 (Privacy & Security)

1. **鏡頭隱私**：鏡頭畫面僅用於瀏覽器記憶體內之即時顏色/物件分析，絕不進行任何形式的錄影、截圖或網路傳輸。
2. **無追蹤器**：無 Cookie 追蹤、無第三方統計 SDK。

---

## 📄 開源授權 (License)

本專案採用 **[Apache License 2.0](LICENSE)** 條款授權。
歡迎學校、教育機構、非營利組織及個人開發者自由下載、改編與推廣使用。

Copyright 2026 EmoBuddy Contributors.

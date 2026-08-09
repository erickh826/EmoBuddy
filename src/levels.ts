import type { LevelConfig } from "./types";

export const levels: LevelConfig[] = [
  {
    id: 1,
    title: "開心花園",
    emotion: "happy",
    objectiveType: "collect-shard",
    playerStart: { row: 4, col: 1 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    shard: {
      icon: "Smile",
      color: "#fbbf24",
      position: { row: 1, col: 5 },
    },
    realWorldTask: {
      type: "camera",
      title: "開心任務",
      description: "在鏡頭前找到一個紅色的東西！",
      cameraTask: {
        targetLabel: "紅色的東西",
        durationMs: 2000,
        fallbackStrategy: "manual",
        strategies: [
          {
            type: "color",
            target: {
              hueRanges: [[0, 15], [345, 360]],
              saturationMin: 40,
              lightnessMin: 15,
              lightnessMax: 85,
              pixelRatioThreshold: 0.08,
            },
          },
          {
            type: "manual",
            instruction: "請大人確認你找到了紅色的東西！",
          },
        ],
      },
    },
    completionMessage: "你收集了「開心碎片」！",
    theme: "amber",
  },
  {
    id: 2,
    title: "平靜森林",
    emotion: "calm",
    objectiveType: "collect-shard",
    playerStart: { row: 5, col: 1 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    shard: {
      icon: "Moon",
      color: "#60a5fa",
      position: { row: 1, col: 6 },
    },
    realWorldTask: {
      type: "camera",
      title: "平靜任務",
      description: "在鏡頭前找到一個藍色的東西！",
      cameraTask: {
        targetLabel: "藍色的東西",
        durationMs: 2000,
        fallbackStrategy: "manual",
        strategies: [
          {
            type: "color",
            target: {
              hueRanges: [[195, 255]],
              saturationMin: 30,
              lightnessMin: 15,
              lightnessMax: 85,
              pixelRatioThreshold: 0.08,
            },
          },
          {
            type: "manual",
            instruction: "請大人確認你找到了藍色的東西！",
          },
        ],
      },
    },
    completionMessage: "你收集了「平靜碎片」！",
    theme: "blue",
  },
  {
    id: 3,
    title: "勇敢山丘",
    emotion: "brave",
    objectiveType: "interact-with-npc",
    playerStart: { row: 3, col: 1 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    npc: {
      icon: "Star",
      position: { row: 3, col: 5 },
    },
    realWorldTask: {
      type: "camera",
      title: "勇敢任務",
      description: "在鏡頭前找到一個書本或杯子！",
      cameraTask: {
        targetLabel: "書本或杯子",
        durationMs: 2000,
        fallbackStrategy: "manual",
        strategies: [
          {
            type: "object",
            targetLabel: "book",
          },
          {
            type: "object",
            targetLabel: "cup",
          },
          {
            type: "manual",
            instruction: "請大人確認你找到了書本或杯子！",
          },
        ],
      },
    },
    completionMessage: "你找到了「勇敢夥伴」！",
    theme: "emerald",
  },
];

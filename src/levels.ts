import type { LevelConfig } from "./types";
import { happyGardenTheme, calmForestTheme, braveHillsTheme } from "./themes";

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
      title: "開心任務",
      description: "和身邊的人分享一件讓你開心的事情！",
      choices: [
        { id: "hug", label: "給一個大大的擁抱", icon: "Heart" },
        { id: "draw", label: "畫一張笑臉", icon: "Pencil" },
        { id: "jump", label: "開心地跳三下", icon: "Sparkles" },
      ],
    },
    completionMessage: "你收集了「開心碎片」！",
    theme: happyGardenTheme,
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
      title: "平靜任務",
      description: "選一個讓你感到放鬆的方式！",
      choices: [
        { id: "breathe", label: "深呼吸三次", icon: "Wind" },
        { id: "sit", label: "閉上眼睛坐一會兒", icon: "Sparkles" },
        { id: "listen", label: "聽一聽周圍的聲音", icon: "Ear" },
      ],
    },
    completionMessage: "你收集了「平靜碎片」！",
    theme: calmForestTheme,
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
      title: "勇敢任務",
      description: "做一件你覺得有一點點難，但可以做到的事！",
      choices: [
        { id: "ask", label: "問老師或家長一個問題", icon: "MessageCircle" },
        { id: "try", label: "試試看新的食物", icon: "Utensils" },
        { id: "help", label: "幫別人做一件小事", icon: "HandHeart" },
      ],
    },
    completionMessage: "你找到了「勇敢夥伴」！",
    theme: braveHillsTheme,
  },
];

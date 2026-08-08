import type { ThemeConfig } from "../types";

// ============================================================
// 2.5D Top‑Down Theme Configs
// Each theme defines:
//   - floorBg          CSS gradient for walkable cells
//   - wallTop / wallSide / wallHighlight  3D extruded wall blocks
//   - borderTop / borderSide             darker boundary border
//   - accentColor / buttonBg etc.        UI chrome
//   - playerGradient / shardGradient     character & collectible
// ============================================================

export const happyGardenTheme: ThemeConfig = {
  id: "happy-garden",
  className: "theme-happy-garden",
  floorBg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  wallTop: "#86efac",
  wallSide: "#22c55e",
  wallHighlight: "#bbf7d0",
  borderTop: "#92400e",
  borderSide: "#78350f",
  accentColor: "#f59e0b",
  accentForeground: "#ffffff",
  backgroundColor: "#fefce8",
  textColor: "#5d4037",
  playerColor: "#3b82f6",
  playerGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  shardGradient: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
  shardGlow: "0 0 12px rgba(245, 158, 11, 0.5)",
  buttonBg: "bg-amber-500",
  buttonHover: "hover:bg-amber-600",
};

export const calmForestTheme: ThemeConfig = {
  id: "calm-forest",
  className: "theme-calm-forest",
  floorBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
  wallTop: "#6ee7b7",
  wallSide: "#059669",
  wallHighlight: "#a7f3d0",
  borderTop: "#4a3f35",
  borderSide: "#3e3127",
  accentColor: "#10b981",
  accentForeground: "#ffffff",
  backgroundColor: "#ecfdf5",
  textColor: "#1a3a2a",
  playerColor: "#8b5cf6",
  playerGradient: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
  shardGradient: "linear-gradient(135deg, #6ee7b7 0%, #059669 100%)",
  shardGlow: "0 0 12px rgba(16, 185, 129, 0.5)",
  npcGradient: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
  npcColor: "#f59e0b",
  buttonBg: "bg-emerald-500",
  buttonHover: "hover:bg-emerald-600",
};

export const braveHillsTheme: ThemeConfig = {
  id: "brave-hills",
  className: "theme-brave-hills",
  floorBg: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
  wallTop: "#fdba74",
  wallSide: "#c2410c",
  wallHighlight: "#fed7aa",
  borderTop: "#57534e",
  borderSide: "#44403c",
  accentColor: "#ea580c",
  accentForeground: "#ffffff",
  backgroundColor: "#fff7ed",
  textColor: "#431407",
  playerColor: "#ef4444",
  playerGradient: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
  shardGradient: "linear-gradient(135deg, #fdba74 0%, #ea580c 100%)",
  shardGlow: "0 0 12px rgba(234, 88, 12, 0.5)",
  buttonBg: "bg-orange-600",
  buttonHover: "hover:bg-orange-700",
};

export const themes: ThemeConfig[] = [happyGardenTheme, calmForestTheme, braveHillsTheme];

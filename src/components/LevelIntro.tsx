import { Sparkles } from "lucide-react";
import type { LevelConfig } from "../types";

interface LevelIntroProps {
  level: LevelConfig;
  onStart: () => void;
}

export function LevelIntro({ level, onStart }: LevelIntroProps) {
  const t = level.theme;
  const isNpc = level.objectiveType === "interact-with-npc";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6 text-center"
      style={{ backgroundColor: t.backgroundColor, color: t.textColor }}
    >
      {/* Decorative top bar */}
      <div
        className="w-20 h-1 rounded-full mb-2"
        style={{ backgroundColor: t.accentColor }}
      />

      {/* Level number badge */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${t.accentColor}, ${t.wallSide})`,
        }}
      >
        {level.id}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: t.textColor }}>
        {level.title}
      </h1>

      {/* Objective illustration */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl animate-bounce"
          style={{
            background: isNpc
              ? (t.npcGradient ?? t.shardGradient)
              : t.shardGradient,
            boxShadow: isNpc ? "0 0 24px rgba(0,0,0,0.15)" : t.shardGlow,
          }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <p className="text-sm font-medium opacity-70" style={{ color: t.textColor }}>
          {isNpc ? "找到勇敢夥伴！" : "收集情緒碎片！"}
        </p>
      </div>

      {/* Emotion hint */}
      <p
        className="text-base leading-relaxed max-w-xs px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: `${t.accentColor}1a`,
          color: t.textColor,
        }}
      >
        {level.emotion === "happy"
          ? "🌻 用開心能量照亮花園！"
          : level.emotion === "calm"
            ? "🌿 在平靜森林中放慢腳步。"
            : "⛰️ 勇敢踏出你的每一步！"}
      </p>

      {/* Start button */}
      <button
        type="button"
        onClick={onStart}
        className="px-10 py-4 rounded-2xl text-white text-lg font-bold shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${t.accentColor}, ${t.wallSide})`,
        }}
      >
        開始探險
      </button>
    </div>
  );
}

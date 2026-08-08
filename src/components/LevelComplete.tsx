import { Star, ArrowRight } from "lucide-react";
import type { LevelConfig } from "../types";

interface LevelCompleteProps {
  level: LevelConfig;
  completionMessage: string;
  onNext: () => void;
}

export function LevelComplete({
  level,
  completionMessage,
  onNext,
}: LevelCompleteProps) {
  const t = level.theme;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6 text-center"
      style={{ backgroundColor: t.backgroundColor, color: t.textColor }}
    >
      {/* Stars */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <Star
              className="w-10 h-10 drop-shadow-lg"
              style={{
                color: t.accentColor,
                fill: t.accentColor,
                filter: `drop-shadow(0 0 8px ${t.accentColor}66)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Completion message */}
      <h2 className="text-2xl font-extrabold" style={{ color: t.textColor }}>
        太棒了！
      </h2>
      <p
        className="text-base leading-relaxed max-w-xs px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: `${t.accentColor}1a`,
          color: t.textColor,
        }}
      >
        {completionMessage}
      </p>

      {/* Shard / NPC display */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          background:
            level.objectiveType === "interact-with-npc"
              ? (t.npcGradient ?? t.shardGradient)
              : t.shardGradient,
          boxShadow:
            level.objectiveType === "interact-with-npc"
              ? "0 0 24px rgba(0,0,0,0.15)"
              : t.shardGlow,
        }}
      >
        <Star className="w-8 h-8 text-white" />
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-lg font-bold shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${t.accentColor}, ${t.wallSide})`,
        }}
      >
        下一關
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

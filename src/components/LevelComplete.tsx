import { Star, ArrowRight } from "lucide-react";
import type { LevelConfig } from "../types";

import shardGolden from "../assets/sprites/shard_golden.png";
import shardGreen from "../assets/sprites/shard_green.png";
import shardOrange from "../assets/sprites/shard_orange.png";
import npcFox from "../assets/sprites/npc_fox.png";

const shardSprites: Record<string, string> = {
  "happy-garden": shardGolden,
  "calm-forest": shardGreen,
  "brave-hills": shardOrange,
};

interface LevelCompleteProps {
  level: LevelConfig;
  completionMessage: string;
  onNext: () => void;
}

const CONFETTI_COLORS = ["#fbbf24", "#f9a8d4", "#86efac", "#93c5fd", "#fca5a5", "#fcd34d"];

export function LevelComplete({
  level,
  completionMessage,
  onNext,
}: LevelCompleteProps) {
  const t = level.theme;
  const rewardSprite =
    level.objectiveType === "interact-with-npc"
      ? npcFox
      : (shardSprites[t.id] ?? shardGolden);

  return (
    <div
      className="relative overflow-hidden flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6 text-center"
      style={{ backgroundColor: t.backgroundColor, color: t.textColor }}
    >
      {/* Gentle confetti (skipped under reduced-motion) */}
      <div className="celebration-confetti" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="confetti-dot"
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 8) * 0.45}s`,
              animationDuration: `${3.2 + (i % 4) * 0.6}s`,
            }}
          />
        ))}
      </div>

      {/* Stars */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="star-pop" style={{ animationDelay: `${i * 0.18}s` }}>
            <Star
              className="w-10 h-10"
              style={{
                color: t.accentColor,
                fill: t.accentColor,
                filter: `drop-shadow(0 0 10px ${t.accentColor}66)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Completion message */}
      <h2 className="text-3xl" style={{ color: t.textColor }}>
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

      {/* Collected reward sprite */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center bg-white/70 shadow-lg"
        style={{ boxShadow: `0 10px 28px rgba(0,0,0,0.14), 0 0 0 4px ${t.accentColor}22` }}
      >
        <img
          src={rewardSprite}
          alt={level.objectiveType === "interact-with-npc" ? "勇敢夥伴" : "情緒碎片"}
          className="w-20 h-20 object-contain reward-float"
          draggable={false}
        />
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

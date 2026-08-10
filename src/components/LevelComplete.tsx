import { Star, ArrowRight } from "lucide-react";
import type { LevelConfig } from "../types";

import shardGolden from "../assets/sprites/shard_golden.png";
import shardGreen from "../assets/sprites/shard_green.png";
import shardOrange from "../assets/sprites/shard_orange.png";
import npcFox from "../assets/sprites/npc_fox.png";
import { EmotionBuddy } from "./EmotionBuddy";

const shardSprites: Record<string, string> = {
  "happy-garden": shardGolden,
  "calm-forest": shardGreen,
  "brave-hills": shardOrange,
};

interface LevelCompleteProps {
  level: LevelConfig;
  completionMessage: string;
  onNext: () => void;
  reducedMotion: boolean;
}

export function LevelComplete({
  level,
  completionMessage,
  onNext,
  reducedMotion,
}: LevelCompleteProps) {
  const t = level.theme;
  const rewardSprite =
    level.objectiveType === "interact-with-npc"
      ? npcFox
      : (shardSprites[t.id] ?? shardGolden);
  const buddyKind = level.emotion === "happy" ? "happy" : level.emotion === "calm" ? "calm" : "brave";

  return (
    <main
      className={`emotion-screen flex-col gap-6${reducedMotion ? " reduced-motion" : ""}`}
      style={{ backgroundColor: t.backgroundColor, color: t.textColor }}
    >
      {/* Stars */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={reducedMotion ? "" : "star-pop"} style={{ animationDelay: `${i * 0.18}s` }}>
            <Star
              className="w-10 h-10"
              style={{
                color: t.accentColor,
                fill: t.accentColor,
              }}
            />
          </div>
        ))}
      </div>

      {/* Completion message */}
      <h2 className="text-4xl font-black" style={{ color: t.textColor }}>
        太棒了！
      </h2>
      <p
        className="max-w-xs rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-4 text-base font-bold leading-relaxed"
        style={{
          color: t.textColor,
        }}
      >
        {completionMessage}
      </p>

      {/* Collected reward sprite */}
      <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] border-2 border-[var(--ink)] bg-white shadow-[0_7px_0_rgba(52,56,47,.14)]">
        {level.objectiveType === "interact-with-npc" ? (
          <img src={rewardSprite} alt="勇敢夥伴" className="h-20 w-20 object-contain" draggable={false} />
        ) : (
          <EmotionBuddy kind={buddyKind} size="md" />
        )}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        className="emotion-button px-9"
        style={{ backgroundColor: t.accentColor }}
      >
        下一關
        <ArrowRight className="w-5 h-5" />
      </button>
    </main>
  );
}

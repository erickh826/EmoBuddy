import type { LevelConfig } from "../types";
import { EmotionBuddy } from "./EmotionBuddy";

interface LevelIntroProps {
  level: LevelConfig;
  onStart: () => void;
}

export function LevelIntro({ level, onStart }: LevelIntroProps) {
  const t = level.theme;
  const isNpc = level.objectiveType === "interact-with-npc";
  const buddyKind = level.emotion === "happy" ? "happy" : level.emotion === "calm" ? "calm" : "brave";

  return (
    <main
      className={`emotion-screen emotion-screen--level theme-${t.id}`}
      style={{ backgroundColor: t.backgroundColor, color: t.textColor }}
    >
      <div className="emotion-level-scenery" aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="emotion-level-heading" style={{ backgroundColor: t.accentColor }}>
          <span className="emotion-level-number">{level.id}</span>
          <h1>{level.title}</h1>
        </div>

        <div className="flex items-end justify-center gap-5 py-3" aria-hidden="true">
          <EmotionBuddy kind={buddyKind} size="md" />
          <EmotionBuddy kind={level.emotion === "happy" ? "calm" : "happy"} size="sm" />
          <EmotionBuddy kind={level.emotion === "brave" ? "happy" : "brave"} size="md" />
        </div>

        <section className="emotion-task-card" aria-label="關卡任務">
          <div className="emotion-task-row">
            <EmotionBuddy kind={buddyKind} size="sm" />
            <strong>{isNpc ? "找到勇敢夥伴" : `收集${level.title.slice(0, 2)}碎片`}</strong>
          </div>
          <div className="emotion-task-divider" />
          <p>
            {level.emotion === "happy"
              ? "用開心能量照亮花園"
              : level.emotion === "calm"
                ? "在森林中慢慢呼吸"
                : "勇敢踏出你的每一步"}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="emotion-button w-full"
            style={{ backgroundColor: t.accentColor }}
          >
            開始探險
          </button>
        </section>
      </div>
    </main>
  );
}

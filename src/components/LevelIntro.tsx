import { Button } from "@/components/ui/button";
import type { LevelConfig } from "../types";
import { getLucideIcon } from "../lib/icons";

interface LevelIntroProps {
  level: LevelConfig;
  onStart: () => void;
}

export function LevelIntro({ level, onStart }: LevelIntroProps) {
  const ShardIcon = level.shard ? getLucideIcon(level.shard.icon) : null;
  const NpcIcon = level.npc ? getLucideIcon(level.npc.icon) : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-slate-400">第 {level.id} 關</p>
        <h2 className="text-2xl font-bold text-slate-800">{level.title}</h2>
      </div>

      {level.objectiveType === "collect-shard" && level.shard && ShardIcon && (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: level.shard.color }}
          >
            <ShardIcon className="w-10 h-10 text-white" />
          </div>
          <p className="text-slate-500">收集碎片來前進！</p>
        </div>
      )}

      {level.objectiveType === "interact-with-npc" && level.npc && NpcIcon && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center">
            <NpcIcon className="w-10 h-10 text-white" />
          </div>
          <p className="text-slate-500">找到夥伴來前進！</p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full max-w-xs h-14 text-lg bg-orange-500 hover:bg-orange-600"
        onClick={onStart}
      >
        開始
      </Button>
    </div>
  );
}

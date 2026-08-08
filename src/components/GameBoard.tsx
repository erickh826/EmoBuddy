import type { Position, LevelConfig } from "../types";
import { getLucideIcon } from "../lib/icons";

interface GameBoardProps {
  level: LevelConfig;
  playerPosition: Position;
  objectiveCompleted: boolean;
  reducedMotion: boolean;
  onMoveTransitionEnd?: () => void;
  children?: React.ReactNode;
}

export function GameBoard({
  level,
  playerPosition,
  objectiveCompleted,
  reducedMotion,
  onMoveTransitionEnd,
  children,
}: GameBoardProps) {
  const rows = level.grid.length;
  const cols = level.grid[0].length;

  const cellPct = {
    width: 100 / cols,
    height: 100 / rows,
  };

  const ShardIcon = level.shard ? getLucideIcon(level.shard.icon) : null;
  const NpcIcon = level.npc ? getLucideIcon(level.npc.icon) : null;

  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: "min(88vw, 560px)",
        aspectRatio: "1",
      }}
    >
      <div
        className="grid h-full w-full rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {level.grid.map((row, r) =>
          row.map((cell, c) => {
            const isShard =
              level.shard &&
              level.shard.position.row === r &&
              level.shard.position.col === c;
            const isNpc =
              level.npc &&
              level.npc.position.row === r &&
              level.npc.position.col === c;
            const isObstacle = cell === 1;

            return (
              <div
                key={`${r}-${c}`}
                className={`
                  relative flex items-center justify-center
                  ${isObstacle ? "bg-slate-300" : "bg-slate-50"}
                `}
              >
                {/* Shard */}
                {isShard && !objectiveCompleted && ShardIcon && (
                  <div
                    className="flex items-center justify-center w-2/3 h-2/3 rounded-full"
                    style={{ backgroundColor: level.shard!.color }}
                  >
                    <ShardIcon className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* NPC */}
                {isNpc && NpcIcon && (
                  <div className="flex items-center justify-center w-2/3 h-2/3 rounded-full bg-emerald-400">
                    <NpcIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Player - absolutely positioned */}
      <div
        className={`absolute flex items-center justify-center transition-all duration-150 ${reducedMotion ? "" : "ease-out"}`}
        onTransitionEnd={onMoveTransitionEnd}
        style={{
          width: `${cellPct.width}%`,
          height: `${cellPct.height}%`,
          left: `${playerPosition.col * cellPct.width}%`,
          top: `${playerPosition.row * cellPct.height}%`,
          padding: "4px",
        }}
      >
        <div className="w-full h-full rounded-full bg-orange-400 border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white text-xl">🙂</span>
        </div>
      </div>

      {/* Objective completed indicator */}
      {objectiveCompleted && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-yellow-400 opacity-30 animate-ping" />
        </div>
      )}

      {children}
    </div>
  );
}

import { useCallback } from "react";
import type { LevelConfig, GameState, Direction } from "../types";
import { DirectionPad } from "./DirectionPad";
import "../themes/themes.css";

// --- Tile images ---
import floorHappyGarden from "../assets/tiles/floor_happy_garden.png";
import floorCalmForest from "../assets/tiles/floor_calm_forest.png";
import floorBraveHills from "../assets/tiles/floor_brave_hills.png";
import borderStone from "../assets/tiles/border_stone.png";
import wallFlowerBush from "../assets/tiles/wall_flower_bush.png";
import wallTreeStump from "../assets/tiles/wall_tree_stump.png";
import wallRock from "../assets/tiles/wall_rock.png";

// --- Sprite images ---
import playerDown from "../assets/sprites/player_down.png";
import playerUp from "../assets/sprites/player_up.png";
import playerLeft from "../assets/sprites/player_left.png";
import playerRight from "../assets/sprites/player_right.png";
import shardGolden from "../assets/sprites/shard_golden.png";
import shardGreen from "../assets/sprites/shard_green.png";
import shardOrange from "../assets/sprites/shard_orange.png";
import npcFox from "../assets/sprites/npc_fox.png";

// --- Tile lookup maps (keyed by theme.id) ---
const floorTileMap: Record<string, string> = {
  "happy-garden": floorHappyGarden,
  "calm-forest": floorCalmForest,
  "brave-hills": floorBraveHills,
};
const wallTileMap: Record<string, string> = {
  "happy-garden": wallFlowerBush,
  "calm-forest": wallTreeStump,
  "brave-hills": wallRock,
};
const shardSpriteMap: Record<string, string> = {
  "happy-garden": shardGolden,
  "calm-forest": shardGreen,
  "brave-hills": shardOrange,
};
const playerSpriteMap: Record<Direction, string> = {
  up: playerUp,
  down: playerDown,
  left: playerLeft,
  right: playerRight,
};

interface GameBoardProps {
  level: LevelConfig;
  state: GameState;
  onMove: (direction: Direction) => void;
  totalLevels?: number;
}

function getCellType(
  row: number,
  col: number,
  grid: number[][],
  gridSize: number
): "floor" | "wall" | "border" {
  if (row === 0 || col === 0 || row === gridSize - 1 || col === gridSize - 1) {
    return "border";
  }
  return grid[row][col] === 1 ? "wall" : "floor";
}

export function GameBoard({
  level,
  state,
  onMove,
  totalLevels = 3,
}: GameBoardProps) {
  const theme = level.theme;
  const grid = level.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  const { playerPosition, playerDirection } = state;
  const isPlaying = state.phase === "playing";

  const handleKeyboard = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isPlaying) return;
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        a: "left",
        A: "left",
        s: "down",
        S: "down",
        d: "right",
        D: "right",
      };
      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        onMove(direction);
      }
    },
    [isPlaying, onMove]
  );

  const floorImg = floorTileMap[theme.id] ?? floorHappyGarden;
  const wallImg = wallTileMap[theme.id] ?? wallFlowerBush;
  const shardSprite = shardSpriteMap[theme.id] ?? shardGolden;
  const playerSprite = playerSpriteMap[playerDirection];

  return (
    <div className={`flex flex-col items-center gap-5 theme-${theme.id}`}>
      {/* Scene frame: sky band + seamless board */}
      <div className="scene-frame">
        <div className="scene-sky">
          <div
            className="scene-cloud"
            style={{ width: 90, height: 26, top: 10, left: "12%" }}
          />
          <div
            className="scene-cloud cloud-2"
            style={{ width: 64, height: 20, bottom: 8, right: "16%" }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: theme.accentColor }}
              >
                第 {level.id} 關
              </span>
              <h2
                className="font-display text-2xl leading-tight truncate"
                style={{ color: theme.textColor }}
              >
                {level.title}
              </h2>
            </div>

            {/* Level progress dots */}
            <div
              className="flex items-center gap-1.5 shrink-0"
              role="img"
              aria-label={`關卡進度 ${level.id} / ${totalLevels}`}
            >
              {Array.from({ length: totalLevels }).map((_, i) => {
                const done = i < level.id - 1;
                const current = i === level.id - 1;
                return (
                  <span
                    key={i}
                    className={`shard-pip${done ? " done" : ""}${current ? " current" : ""}`}
                    style={
                      done || current
                        ? { backgroundColor: theme.accentColor }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 2.5D Game Grid */}
        <div
          className="game-grid"
          role="application"
          aria-label={`${level.title} 遊戲地圖`}
          tabIndex={0}
          onKeyDown={handleKeyboard}
          style={{
            outline: "none",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((_, c) => {
              const cellType = getCellType(r, c, grid, grid.length);
              const isPlayer =
                playerPosition.row === r && playerPosition.col === c;
              const isShard =
                level.objectiveType === "collect-shard" &&
                level.shard?.position.row === r &&
                level.shard?.position.col === c;
              const isNpc =
                level.objectiveType === "interact-with-npc" &&
                level.npc?.position.row === r &&
                level.npc?.position.col === c;

              const cellClass =
                cellType === "border"
                  ? "cell-border"
                  : cellType === "wall"
                    ? "cell-wall"
                    : "cell-floor";

              const cellImage =
                cellType === "border"
                  ? borderStone
                  : cellType === "wall"
                    ? wallImg
                    : floorImg;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`grid-cell ${cellClass}`}
                  style={{ backgroundImage: `url(${cellImage})` }}
                  data-row={r}
                  data-col={c}
                >
                  {/* Player */}
                  {isPlayer && (
                    <div
                      className={`player-sprite${isPlaying && !state.reducedMotion ? " player-idle" : ""}`}
                      style={{ backgroundImage: `url(${playerSprite})` }}
                    />
                  )}

                  {/* Shard */}
                  {isShard && !isPlayer && (
                    <div
                      className={`shard-sprite${isPlaying && !state.reducedMotion ? " shard-animate" : ""}`}
                      style={{ backgroundImage: `url(${shardSprite})` }}
                    />
                  )}

                  {/* NPC */}
                  {isNpc && !isPlayer && (
                    <div
                      className="npc-sprite"
                      style={{ backgroundImage: `url(${npcFox})` }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Objective hint */}
      <p
        className="text-sm font-medium"
        style={{ color: theme.textColor, opacity: 0.7 }}
      >
        {level.objectiveType === "collect-shard"
          ? "找到發光的碎片！"
          : "找到夥伴！"}
      </p>

      {/* Direction Pad */}
      <DirectionPad onMove={onMove} disabled={!isPlaying} theme={theme} />
    </div>
  );
}

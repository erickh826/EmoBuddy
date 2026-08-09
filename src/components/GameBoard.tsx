import { useCallback } from "react";
import type { LevelConfig, GameState, Direction } from "../types";
import { DirectionPad } from "./DirectionPad";
import "../themes/themes.css";

// --- Tile images ---
import floorHappyGarden from "../assets/tiles/floor_happy_garden.png";
import floorCalmForest from "../assets/tiles/floor_calm_forest.png";
import floorBraveHills from "../assets/tiles/floor_brave_hills.png";
import wallFlowerBush from "../assets/tiles/wall_flower_bush.png";
import wallTreeStump from "../assets/tiles/wall_tree_stump.png";
import wallRock from "../assets/tiles/wall_rock.png";
import borderStone from "../assets/tiles/border_stone.png";

// --- Sprite images ---
import playerDown from "../assets/sprites/player_down.png";
import playerUp from "../assets/sprites/player_up.png";
import playerLeft from "../assets/sprites/player_left.png";
import playerRight from "../assets/sprites/player_right.png";
import shardGolden from "../assets/sprites/shard_golden.png";
import shardGreen from "../assets/sprites/shard_green.png";
import shardOrange from "../assets/sprites/shard_orange.png";
import npcFox from "../assets/sprites/npc_fox.png";

// --- Tile lookup maps ---
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
}

function getCellType(row: number, col: number, grid: number[][], gridSize: number): "floor" | "wall" | "border" {
  if (row === 0 || col === 0 || row === gridSize - 1 || col === gridSize - 1) {
    return "border";
  }
  return grid[row][col] === 1 ? "wall" : "floor";
}

export function GameBoard({ level, state, onMove }: GameBoardProps) {
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
        s: "down",
        S: "down",
        a: "left",
        A: "left",
        d: "right",
        D: "right",
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    },
    [isPlaying, onMove]
  );

  const floorImg = floorTileMap[theme.id] ?? floorHappyGarden;
  const wallImg = wallTileMap[theme.id] ?? wallFlowerBush;
  const shardSprite = shardSpriteMap[theme.id] ?? shardGolden;
  const playerSprite = playerSpriteMap[playerDirection];

  return (
    <div className="flex flex-col items-center gap-6 p-4" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Title bar */}
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-medium opacity-60" style={{ color: theme.textColor }}>
          第 {level.id} 關
        </p>
        <h2
          className="text-2xl font-bold mt-1"
          style={{ color: theme.textColor }}
        >
          {level.title}
        </h2>
      </div>

      {/* 2.5D Game Grid */}
      <div
        className="game-grid"
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
            const isPlayer = playerPosition.row === r && playerPosition.col === c;
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

            return (
              <div
                key={`${r}-${c}`}
                className={`grid-cell ${cellClass}`}
                style={{
                  ...(cellType === "floor"
                    ? { backgroundImage: `url(${floorImg})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : cellType === "wall"
                      ? {
                          backgroundImage: `url(${wallImg})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          boxShadow: `1px 1px 0 ${theme.wallHighlight}, 4px 4px 0 ${theme.wallSide}, 5px 5px 0 rgba(0,0,0,0.12)`,
                        }
                      : cellType === "border"
                        ? {
                            backgroundImage: `url(${borderStone})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            boxShadow: `1px 1px 0 rgba(255,255,255,0.1), 4px 4px 0 ${theme.borderSide}, 5px 5px 0 rgba(0,0,0,0.18)`,
                          }
                        : undefined),
                }}
              >
                {/* Player */}
                {isPlayer && (
                  <div
                    className={`player-sprite dir-${playerDirection}`}
                    style={{
                      backgroundImage: `url(${playerSprite})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      boxShadow: `0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)`,
                    }}
                  />
                )}

                {/* Shard */}
                {isShard && !isPlayer && (
                  <div
                    className={`shard-sprite ${state.reducedMotion ? "" : "shard-animate"}`}
                    style={{
                      backgroundImage: `url(${shardSprite})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      boxShadow: theme.shardGlow,
                    }}
                  />
                )}

                {/* NPC */}
                {isNpc && !isPlayer && (
                  <div
                    className="npc-sprite"
                    style={{
                      backgroundImage: `url(${npcFox})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      boxShadow: `0 3px 0 rgba(180,83,9,0.3), 0 5px 10px rgba(180,83,9,0.15)`,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Objective hint */}
      <p className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.7 }}>
        {level.objectiveType === "collect-shard"
          ? "找到發光的碎片！"
          : "找到夥伴！"}
      </p>

      {/* Direction Pad */}
      <DirectionPad onMove={onMove} disabled={!isPlaying} theme={theme} />
    </div>
  );
}

import type { Direction, Position, LevelConfig } from "../types";

export function getNextPosition(
  current: Position,
  direction: Direction,
  grid: number[][]
): Position | null {
  let { row, col } = current;
  switch (direction) {
    case "up":
      row -= 1;
      break;
    case "down":
      row += 1;
      break;
    case "left":
      col -= 1;
      break;
    case "right":
      col += 1;
      break;
  }

  // Boundary check
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return null;
  }

  // Obstacle check
  if (grid[row][col] === 1) {
    return null;
  }

  return { row, col };
}

export function isPositionBlocked(pos: Position, grid: number[][]): boolean {
  if (pos.row < 0 || pos.row >= grid.length || pos.col < 0 || pos.col >= grid[0].length) {
    return true;
  }
  return grid[pos.row][pos.col] === 1;
}

export function validateLevelConfig(level: LevelConfig): string[] {
  const errors: string[] = [];
  if (!level.grid || level.grid.length === 0) {
    errors.push("Grid is empty");
    return errors;
  }

  const rows = level.grid.length;
  const cols = level.grid[0].length;

  if (
    level.playerStart.row < 0 ||
    level.playerStart.row >= rows ||
    level.playerStart.col < 0 ||
    level.playerStart.col >= cols
  ) {
    errors.push("Player start position is out of bounds");
  }

  if (level.grid[level.playerStart.row][level.playerStart.col] === 1) {
    errors.push("Player start position is on an obstacle");
  }

  if (level.objectiveType === "collect-shard" && level.shard) {
    if (
      level.shard.position.row < 0 ||
      level.shard.position.row >= rows ||
      level.shard.position.col < 0 ||
      level.shard.position.col >= cols
    ) {
      errors.push("Shard position is out of bounds");
    } else if (level.grid[level.shard.position.row][level.shard.position.col] === 1) {
      errors.push("Shard position is on an obstacle");
    }
  }

  if (level.objectiveType === "interact-with-npc" && level.npc) {
    if (
      level.npc.position.row < 0 ||
      level.npc.position.row >= rows ||
      level.npc.position.col < 0 ||
      level.npc.position.col >= cols
    ) {
      errors.push("NPC position is out of bounds");
    } else if (level.grid[level.npc.position.row][level.npc.position.col] === 1) {
      errors.push("NPC position is on an obstacle");
    }
  }

  return errors;
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

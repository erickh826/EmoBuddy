export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  row: number;
  col: number;
}

export type ObjectiveType = "collect-shard" | "interact-with-npc";

export interface TaskChoice {
  id: string;
  label: string;
  icon: string;
}

// ====== Theme System (2.5D Visual Upgrade) ======

export interface ThemeConfig {
  id: string;
  className: string;
  floorBg: string;
  wallTop: string;
  wallSide: string;
  wallHighlight: string;
  borderTop: string;
  borderSide: string;
  accentColor: string;
  accentForeground: string;
  backgroundColor: string;
  textColor: string;
  playerColor: string;
  playerGradient: string;
  shardGradient: string;
  shardGlow: string;
  npcGradient?: string;
  npcColor?: string;
  buttonBg: string;
  buttonHover: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  emotion: string;
  objectiveType: ObjectiveType;
  playerStart: Position;
  grid: number[][]; // 0 = walkable, 1 = obstacle
  shard?: {
    icon: string;
    color: string;
    position: Position;
  };
  npc?: {
    icon: string;
    position: Position;
  };
  realWorldTask: {
    title: string;
    description: string;
    choices: TaskChoice[];
  };
  completionMessage: string;
  theme: ThemeConfig;
}

export type GamePhase =
  | "welcome"
  | "level-intro"
  | "playing"
  | "real-world-task"
  | "parent-confirmation"
  | "level-complete"
  | "certificate";

export interface GameState {
  levelIndex: number;
  phase: GamePhase;
  playerPosition: Position;
  playerDirection: Direction;
  muted: boolean;
  reducedMotion: boolean;
  objectiveCompleted: boolean;
  selectedTaskChoice?: string;
  selectedEmotion?: string;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "START_LEVEL" }
  | { type: "MOVE_PLAYER"; position: Position; direction: Direction }
  | { type: "SET_PLAYER_DIRECTION"; direction: Direction }
  | { type: "COMPLETE_DIGITAL_OBJECTIVE" }
  | { type: "SELECT_TASK_CHOICE"; choiceId: string }
  | { type: "OPEN_PARENT_CONFIRMATION" }
  | { type: "PARENT_CONFIRMED" }
  | { type: "NEXT_LEVEL"; nextLevelStartPos: Position; isLastLevel: boolean }
  | { type: "SELECT_EMOTION"; emotion: string }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_REDUCED_MOTION" }
  | { type: "RESTART_GAME" };

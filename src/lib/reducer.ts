import type { GameState, GameAction, Position } from "../types";
import { levels } from "../levels";

function loadSettings(): { muted: boolean; reducedMotion: boolean } {
  try {
    const raw = localStorage.getItem("emotion-shards:settings:v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        muted: !!parsed.muted,
        reducedMotion: !!parsed.reducedMotion,
      };
    }
  } catch {
    // ignore parse errors
  }
  // Respect prefers-reduced-motion by default
  return {
    muted: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };
}

function loadProgress(): { levelIndex: number; playerPosition: Position } | null {
  try {
    const raw = localStorage.getItem("emotion-shards:progress:v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.levelIndex === "number" &&
        parsed.levelIndex >= 0 &&
        parsed.levelIndex < levels.length &&
        parsed.playerPosition &&
        typeof parsed.playerPosition.row === "number" &&
        typeof parsed.playerPosition.col === "number"
      ) {
        return {
          levelIndex: parsed.levelIndex,
          playerPosition: parsed.playerPosition,
        };
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

const settings = loadSettings();
const progress = loadProgress();

export const initialState: GameState = {
  levelIndex: progress?.levelIndex ?? 0,
  phase: "welcome",
  playerPosition: progress?.playerPosition ?? { ...levels[0].playerStart },
  muted: settings.muted,
  reducedMotion: settings.reducedMotion,
  objectiveCompleted: false,
  selectedTaskChoice: undefined,
  selectedEmotion: undefined,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      return {
        ...state,
        phase: "level-intro",
        levelIndex: 0,
        playerPosition: { ...levels[0].playerStart },
        objectiveCompleted: false,
        selectedTaskChoice: undefined,
        selectedEmotion: undefined,
      };
    }

    case "START_LEVEL": {
      const level = levels[state.levelIndex];
      return {
        ...state,
        phase: "playing",
        playerPosition: { ...level.playerStart },
        objectiveCompleted: false,
        selectedTaskChoice: undefined,
        selectedEmotion: undefined,
      };
    }

    case "MOVE_PLAYER": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        playerPosition: { ...action.position },
      };
    }

    case "COMPLETE_DIGITAL_OBJECTIVE": {
      return {
        ...state,
        objectiveCompleted: true,
        phase: state.phase === "playing" ? "real-world-task" : state.phase,
      };
    }

    case "SELECT_TASK_CHOICE": {
      return {
        ...state,
        selectedTaskChoice: action.choiceId,
        selectedEmotion: levels[state.levelIndex].emotion,
      };
    }

    case "OPEN_PARENT_CONFIRMATION": {
      return {
        ...state,
        phase: "parent-confirmation",
      };
    }

    case "PARENT_CONFIRMED": {
      return {
        ...state,
        phase: "level-complete",
      };
    }

    case "NEXT_LEVEL": {
      if (action.isLastLevel) {
        return {
          ...state,
          phase: "certificate",
          levelIndex: state.levelIndex + 1,
          playerPosition: { ...action.nextLevelStartPos },
          objectiveCompleted: false,
          selectedTaskChoice: undefined,
          selectedEmotion: undefined,
        };
      }
      return {
        ...state,
        phase: "level-intro",
        levelIndex: state.levelIndex + 1,
        playerPosition: { ...action.nextLevelStartPos },
        objectiveCompleted: false,
        selectedTaskChoice: undefined,
        selectedEmotion: undefined,
      };
    }

    case "SELECT_EMOTION": {
      return {
        ...state,
        selectedEmotion: action.emotion,
      };
    }

    case "TOGGLE_MUTE": {
      const newMuted = !state.muted;
      try {
        localStorage.setItem(
          "emotion-shards:settings:v1",
          JSON.stringify({
            muted: newMuted,
            reducedMotion: state.reducedMotion,
          })
        );
      } catch {
        // ignore storage errors
      }
      return { ...state, muted: newMuted };
    }

    case "TOGGLE_REDUCED_MOTION": {
      const newReduced = !state.reducedMotion;
      try {
        localStorage.setItem(
          "emotion-shards:settings:v1",
          JSON.stringify({
            muted: state.muted,
            reducedMotion: newReduced,
          })
        );
      } catch {
        // ignore storage errors
      }
      return { ...state, reducedMotion: newReduced };
    }

    case "RESTART_GAME": {
      return {
        ...initialState,
        phase: "welcome",
        levelIndex: 0,
        playerPosition: { ...levels[0].playerStart },
      };
    }

    default:
      return state;
  }
}

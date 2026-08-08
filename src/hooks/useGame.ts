import { useReducer, useCallback, useRef } from "react";
import { levels } from "../levels";
import { gameReducer, initialState } from "../lib/reducer";
import { getNextPosition, positionsEqual } from "../lib/movement";
import type { Direction, GameAction } from "../types";

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const isMovingRef = useRef(false);
  const level = levels[state.levelIndex];

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (state.phase !== "playing") return;
      if (isMovingRef.current) return;

      const nextPos = getNextPosition(state.playerPosition, direction, level.grid);
      if (!nextPos) return;

      isMovingRef.current = true;
      dispatch({ type: "MOVE_PLAYER", position: nextPos });

      // Check if objective is met
      if (level.objectiveType === "collect-shard" && level.shard) {
        if (positionsEqual(nextPos, level.shard.position)) {
          dispatch({ type: "COMPLETE_DIGITAL_OBJECTIVE" });
        }
      }
      if (level.objectiveType === "interact-with-npc" && level.npc) {
        if (positionsEqual(nextPos, level.npc.position)) {
          dispatch({ type: "COMPLETE_DIGITAL_OBJECTIVE" });
        }
      }

      // Simple cooldown to prevent rapid repeated input
      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    },
    [state.phase, state.playerPosition, state.levelIndex, level]
  );

  const handleMoveTransitionEnd = useCallback(() => {
    // Phase transition is now handled by reducer in COMPLETE_DIGITAL_OBJECTIVE
    // This callback is kept for any future transition-end logic
  }, []);

  const dispatchAction = useCallback(
    (action: GameAction) => {
      dispatch(action);
    },
    [dispatch]
  );

  return {
    state,
    level,
    movePlayer,
    handleMoveTransitionEnd,
    dispatch: dispatchAction,
  };
}

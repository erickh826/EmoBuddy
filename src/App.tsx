import { useCallback } from "react";
import { useGame } from "./hooks/useGame";
import { useKeyboardInput } from "./hooks/useKeyboardInput";
import { levels } from "./levels";
import { playMoveSound, playCompleteSound, playUnlockSound } from "./lib/audio";

import { WelcomeScreen } from "./components/WelcomeScreen";
import { LevelIntro } from "./components/LevelIntro";
import { GameBoard } from "./components/GameBoard";
import { DirectionPad } from "./components/DirectionPad";
import { RealWorldTask } from "./components/RealWorldTask";
import { ParentUnlock } from "./components/ParentUnlock";
import { LevelComplete } from "./components/LevelComplete";
import { Certificate } from "./components/Certificate";
import { Volume2, VolumeX } from "lucide-react";

function App() {
  const { state, level, movePlayer, dispatch } = useGame();

  // Keyboard input
  const keyboardEnabled = state.phase === "playing";
  useKeyboardInput(
    useCallback(
      (direction) => {
        movePlayer(direction);
      },
      [movePlayer]
    ),
    keyboardEnabled
  );

  // Sound on move
  const handleMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      movePlayer(direction);
      playMoveSound(state.muted);
    },
    [movePlayer, state.muted]
  );

  const handleStartGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);

  const handleStartLevel = useCallback(() => {
    dispatch({ type: "START_LEVEL" });
  }, [dispatch]);

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      dispatch({ type: "SELECT_TASK_CHOICE", choiceId });
    },
    [dispatch]
  );

  const handleContinueTask = useCallback(() => {
    dispatch({ type: "OPEN_PARENT_CONFIRMATION" });
  }, [dispatch]);

  const handleParentConfirmed = useCallback(() => {
    playUnlockSound(state.muted);
    dispatch({ type: "PARENT_CONFIRMED" });
  }, [dispatch, state.muted]);

  const handleSkipParent = useCallback(() => {
    dispatch({ type: "PARENT_CONFIRMED" });
  }, [dispatch]);

  const handleNextLevel = useCallback(() => {
    playCompleteSound(state.muted);
    const nextIndex = state.levelIndex + 1;
    const isLast = nextIndex >= levels.length;
    if (!isLast) {
      dispatch({
        type: "NEXT_LEVEL",
        nextLevelStartPos: { ...levels[nextIndex].playerStart },
        isLastLevel: false,
      });
    } else {
      dispatch({
        type: "NEXT_LEVEL",
        nextLevelStartPos: { ...levels[levels.length - 1].playerStart },
        isLastLevel: true,
      });
    }
  }, [dispatch, state.levelIndex, state.muted]);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESTART_GAME" });
  }, [dispatch]);

  const handleToggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" });
  }, [dispatch]);

  const handleToggleReducedMotion = useCallback(() => {
    dispatch({ type: "TOGGLE_REDUCED_MOTION" });
  }, [dispatch]);

  // Phase rendering
  switch (state.phase) {
    case "welcome":
      return (
        <WelcomeScreen
          onStart={handleStartGame}
          state={state}
          onToggleMute={handleToggleMute}
          onToggleReducedMotion={handleToggleReducedMotion}
        />
      );

    case "level-intro":
      return <LevelIntro level={level} onStart={handleStartLevel} />;

    case "playing":
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-4 gap-4">
          <div className="w-full max-w-[560px] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">
              {level.title}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={state.muted ? "開啟音效" : "靜音"}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                onClick={handleToggleMute}
              >
                {state.muted ? (
                  <VolumeX className="w-4 h-4 text-slate-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          <GameBoard
            level={level}
            playerPosition={state.playerPosition}
            objectiveCompleted={state.objectiveCompleted}
            reducedMotion={state.reducedMotion}
          />

          <DirectionPad
            onMove={handleMove}
            disabled={state.phase !== "playing"}
          />

          <p className="text-sm text-slate-400">
            使用方向鍵、WASD 或方向盤移動
          </p>
        </div>
      );

    case "real-world-task":
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-4 gap-4">
          <div className="w-full max-w-[560px] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">
              {level.title}
            </h2>
          </div>
          <GameBoard
            level={level}
            playerPosition={state.playerPosition}
            objectiveCompleted={state.objectiveCompleted}
            reducedMotion={state.reducedMotion}
          />
          <DirectionPad
            onMove={handleMove}
            disabled={true}
          />
          <RealWorldTask
            level={level}
            selectedChoice={state.selectedTaskChoice}
            onSelectChoice={handleSelectChoice}
            onContinue={handleContinueTask}
          />
        </div>
      );

    case "parent-confirmation":
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-4 gap-4">
          <div className="w-full max-w-[560px] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">
              {level.title}
            </h2>
          </div>
          <GameBoard
            level={level}
            playerPosition={state.playerPosition}
            objectiveCompleted={state.objectiveCompleted}
            reducedMotion={state.reducedMotion}
          />
          <ParentUnlock
            onConfirmed={handleParentConfirmed}
            onSkip={handleSkipParent}
          />
        </div>
      );

    case "level-complete":
      return (
        <LevelComplete
          message={level.completionMessage}
          onNextLevel={handleNextLevel}
        />
      );

    case "certificate":
      return (
        <Certificate
          levels={levels}
          selectedEmotions={[
            state.selectedEmotion,
          ]}
          onRestart={handleRestart}
        />
      );

    default:
      return null;
  }
}

export default App;

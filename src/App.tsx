import { useCallback } from "react";
import { useGame } from "./hooks/useGame";
import { useKeyboardInput } from "./hooks/useKeyboardInput";
import { levels } from "./levels";
import { playMoveSound, playCompleteSound, playUnlockSound } from "./lib/audio";

import { WelcomeScreen } from "./components/WelcomeScreen";
import { LevelIntro } from "./components/LevelIntro";
import { GameBoard } from "./components/GameBoard";
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

  // Phase rendering
  switch (state.phase) {
    case "welcome":
      return (
        <WelcomeScreen onStart={handleStartGame} />
      );

    case "level-intro":
      return <LevelIntro level={level} onStart={handleStartLevel} />;

    case "playing":
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-4">
          <div className="w-full max-w-[560px] flex items-center justify-end px-4">
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
          <GameBoard level={level} state={state} onMove={handleMove} />
          <p className="text-sm text-slate-400 pb-4">
            使用方向鍵、WASD 或方向盤移動
          </p>
        </div>
      );

    case "real-world-task":
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] py-4 gap-4">
          <GameBoard level={level} state={state} onMove={handleMove} />
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
        <div className="flex flex-col items-center justify-center min-h-[100dvh] py-4 gap-4">
          <GameBoard level={level} state={state} onMove={handleMove} />
          <ParentUnlock
            onConfirmed={handleParentConfirmed}
            onSkip={handleSkipParent}
          />
        </div>
      );

    case "level-complete":
      return (
        <LevelComplete
          level={level}
          completionMessage={level.completionMessage}
          onNext={handleNextLevel}
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

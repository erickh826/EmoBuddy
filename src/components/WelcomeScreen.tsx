import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import type { GameState } from "../types";

interface WelcomeScreenProps {
  onStart: () => void;
  state: Pick<GameState, "muted" | "reducedMotion">;
  onToggleMute: () => void;
  onToggleReducedMotion: () => void;
}

export function WelcomeScreen({
  onStart,
  state,
  onToggleMute,
  onToggleReducedMotion,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">情緒碎片</h1>
        <p className="text-slate-500">和爸媽一起探索情緒的冒險</p>
      </div>

      <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
        <span className="text-4xl">🙂</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          aria-label={state.muted ? "開啟音效" : "靜音"}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          onClick={onToggleMute}
        >
          {state.muted ? (
            <VolumeX className="w-5 h-5 text-slate-600" />
          ) : (
            <Volume2 className="w-5 h-5 text-slate-600" />
          )}
        </button>
        <button
          type="button"
          aria-label={state.reducedMotion ? "開啟動畫" : "減少動畫"}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          onClick={onToggleReducedMotion}
        >
          {state.reducedMotion ? (
            <EyeOff className="w-5 h-5 text-slate-600" />
          ) : (
            <Eye className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      <Button
        size="lg"
        className="w-full max-w-xs h-14 text-lg bg-orange-500 hover:bg-orange-600"
        onClick={onStart}
      >
        開始探險
      </Button>
    </div>
  );
}

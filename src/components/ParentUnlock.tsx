import { useLongPress } from "../hooks/useLongPress";
import { Lock } from "lucide-react";

interface ParentUnlockProps {
  onConfirmed: () => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export function ParentUnlock({ onConfirmed, onSkip, disabled }: ParentUnlockProps) {
  const { progress, handlers } = useLongPress(() => {
    onConfirmed();
  }, 2000);

  return (
    <div className="flex flex-col items-center gap-4" role="dialog" aria-modal="true" aria-labelledby="parent-unlock-title">
      <h2 id="parent-unlock-title" className="text-lg font-semibold text-slate-700">
        家長確認
      </h2>
      <p className="text-sm text-slate-500 text-center">
        請家長長按下方按鈕 2 秒鐘，確認任務已完成
      </p>

      <button
        type="button"
        className={`
          relative flex flex-col items-center justify-center
          w-48 h-20 rounded-xl
          border-2 border-slate-200 bg-slate-100
          active:bg-slate-200
          transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          touch-none
        `}
        disabled={disabled}
        {...handlers}
      >
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-600" />
          <span className="text-slate-700 font-medium">長按 2 秒解鎖</span>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-b-xl transition-all duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </button>

      {onSkip && (
        <button
          type="button"
          className="text-sm text-slate-400 underline hover:text-slate-600 transition-colors"
          onClick={onSkip}
        >
          這次先跳過
        </button>
      )}
    </div>
  );
}

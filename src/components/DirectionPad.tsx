import { useCallback } from "react";
import type { Direction } from "../types";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DirectionPadProps {
  onMove: (direction: Direction) => void;
  disabled: boolean;
}

function DPadButton({
  direction,
  onClick,
  disabled,
  icon,
  label,
}: {
  direction: Direction;
  onClick: (d: Direction) => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`
        flex items-center justify-center
        w-14 h-14 rounded-lg
        bg-slate-100 border-2 border-slate-200
        active:bg-slate-200 active:border-slate-300
        transition-colors
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        touch-none
      `}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick(direction);
      }}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

export function DirectionPad({ onMove, disabled }: DirectionPadProps) {
  const handleClick = useCallback(
    (direction: Direction) => {
      if (!disabled) onMove(direction);
    },
    [disabled, onMove]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <DPadButton
        direction="up"
        onClick={handleClick}
        disabled={disabled}
        icon={<ChevronUp className="w-6 h-6 text-slate-600" />}
        label="向上移動"
      />
      <div className="flex gap-2">
        <DPadButton
          direction="left"
          onClick={handleClick}
          disabled={disabled}
          icon={<ChevronLeft className="w-6 h-6 text-slate-600" />}
          label="向左移動"
        />
        <DPadButton
          direction="down"
          onClick={handleClick}
          disabled={disabled}
          icon={<ChevronDown className="w-6 h-6 text-slate-600" />}
          label="向下移動"
        />
        <DPadButton
          direction="right"
          onClick={handleClick}
          disabled={disabled}
          icon={<ChevronRight className="w-6 h-6 text-slate-600" />}
          label="向右移動"
        />
      </div>
    </div>
  );
}

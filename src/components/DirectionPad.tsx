import { useCallback } from "react";
import type { Direction, ThemeConfig } from "../types";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DirectionPadProps {
  onMove: (direction: Direction) => void;
  disabled: boolean;
  theme?: ThemeConfig;
}

function DPadButton({
  direction,
  onClick,
  disabled,
  icon,
  label,
  accentColor,
}: {
  direction: Direction;
  onClick: (d: Direction) => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  accentColor: string;
}) {
  const handlePress = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      navigator.vibrate?.(10);
      onClick(direction);
    },
    [disabled, onClick, direction]
  );

  return (
    <button
      type="button"
      aria-label={label}
      className={`
        flex items-center justify-center
        w-16 h-16 rounded-full
        transition-all duration-100
        active:scale-90 select-none touch-none
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-105"}
      `}
      style={{
        backgroundColor: accentColor,
        border: "3px solid rgba(255, 255, 255, 0.7)",
        boxShadow: "0 4px 0 rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.12)",
      }}
      onPointerDown={handlePress}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

export function DirectionPad({ onMove, disabled, theme }: DirectionPadProps) {
  const accentColor = theme?.accentColor ?? "#94a3b8";
  const iconColor = "#ffffff";

  const handleClick = useCallback(
    (direction: Direction) => {
      if (!disabled) onMove(direction);
    },
    [disabled, onMove]
  );

  const btnProps = {
    onClick: handleClick,
    disabled,
    accentColor,
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <DPadButton
        {...btnProps}
        direction="up"
        icon={<ChevronUp className="w-7 h-7" strokeWidth={3} style={{ color: iconColor }} />}
        label="向上移動"
      />
      <div className="flex gap-2">
        <DPadButton
          {...btnProps}
          direction="left"
          icon={<ChevronLeft className="w-7 h-7" strokeWidth={3} style={{ color: iconColor }} />}
          label="向左移動"
        />
        <DPadButton
          {...btnProps}
          direction="down"
          icon={<ChevronDown className="w-7 h-7" strokeWidth={3} style={{ color: iconColor }} />}
          label="向下移動"
        />
        <DPadButton
          {...btnProps}
          direction="right"
          icon={<ChevronRight className="w-7 h-7" strokeWidth={3} style={{ color: iconColor }} />}
          label="向右移動"
        />
      </div>
    </div>
  );
}

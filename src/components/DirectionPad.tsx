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
        w-14 h-14 rounded-2xl
        border-2 transition-all duration-100
        active:scale-90 select-none touch-none
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110"}
      `}
      style={{
        backgroundColor: `${accentColor}1a`,
        borderColor: accentColor,
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
  const iconColor = accentColor;

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
        icon={<ChevronUp className="w-6 h-6" style={{ color: iconColor }} />}
        label="向上移動"
      />
      <div className="flex gap-2">
        <DPadButton
          {...btnProps}
          direction="left"
          icon={<ChevronLeft className="w-6 h-6" style={{ color: iconColor }} />}
          label="向左移動"
        />
        <DPadButton
          {...btnProps}
          direction="down"
          icon={<ChevronDown className="w-6 h-6" style={{ color: iconColor }} />}
          label="向下移動"
        />
        <DPadButton
          {...btnProps}
          direction="right"
          icon={<ChevronRight className="w-6 h-6" style={{ color: iconColor }} />}
          label="向右移動"
        />
      </div>
    </div>
  );
}

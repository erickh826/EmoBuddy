interface EmotionBuddyProps {
  kind?: "buddy" | "happy" | "calm" | "brave";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmotionBuddy({
  kind = "buddy",
  size = "md",
  className = "",
}: EmotionBuddyProps) {
  return (
    <div
      className={`emotion-buddy emotion-buddy--${kind} emotion-buddy--${size} ${className}`}
      aria-hidden="true"
    >
      <span className="emotion-buddy__eye emotion-buddy__eye--left" />
      <span className="emotion-buddy__eye emotion-buddy__eye--right" />
      <span className="emotion-buddy__mouth" />
      {kind === "buddy" && (
        <>
          <span className="emotion-buddy__arm emotion-buddy__arm--left" />
          <span className="emotion-buddy__arm emotion-buddy__arm--right" />
          <span className="emotion-buddy__leg emotion-buddy__leg--left" />
          <span className="emotion-buddy__leg emotion-buddy__leg--right" />
        </>
      )}
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import { EmotionBuddy } from "./EmotionBuddy";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className="emotion-screen emotion-screen--welcome">
      <div className="emotion-sun" aria-hidden="true" />
      <div className="emotion-cloud emotion-cloud--left" aria-hidden="true" />
      <div className="emotion-cloud emotion-cloud--right" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-7">
        <h1 className="emotion-logo">EmoBuddy</h1>
        <EmotionBuddy kind="buddy" size="lg" />
        <p className="max-w-xs text-xl font-extrabold leading-relaxed text-[var(--ink)]">
          今天想和哪種感覺做朋友？
        </p>

      <button
        type="button"
        onClick={onStart}
          className="emotion-button emotion-button--yellow w-full max-w-xs"
      >
        開始冒險
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
      </div>
      <div className="emotion-hill emotion-hill--back" aria-hidden="true" />
      <div className="emotion-hill emotion-hill--front" aria-hidden="true" />
    </main>
  );
}

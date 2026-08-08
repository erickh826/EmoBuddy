import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface LevelCompleteProps {
  message: string;
  onNextLevel: () => void;
}

export function LevelComplete({ message, onNextLevel }: LevelCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-6">
      <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
        <Star className="w-12 h-12 text-yellow-500" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">任務完成！</h2>
        <p className="text-slate-600">{message}</p>
      </div>

      <Button
        size="lg"
        className="w-full max-w-xs h-14 text-lg bg-emerald-500 hover:bg-emerald-600"
        onClick={onNextLevel}
      >
        下一關
      </Button>
    </div>
  );
}

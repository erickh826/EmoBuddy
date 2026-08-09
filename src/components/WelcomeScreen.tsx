import { Sparkles, Play } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-8 text-center bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50">
      {/* Logo / Mascot area */}
      <div className="relative">
        <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 shadow-2xl">
          <Sparkles className="w-14 h-14 text-white drop-shadow-lg" />
        </div>
        {/* Orbiting dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rose-400 shadow-lg" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400 shadow-lg" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-lg" />
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            情緒碎片
          </span>
        </h1>
        <p className="mt-2 text-base text-stone-500 font-medium">
          ✨ 一場探索情緒的冒險 ✨
        </p>
      </div>

      {/* Subtitle card */}
      <div className="max-w-xs px-5 py-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md">
        <p className="text-sm text-stone-600 leading-relaxed">
          前往三個奇妙島嶼，收集情緒碎片，
          <br />
          認識你的各種感受！
        </p>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={onStart}
        className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white text-lg font-bold
                   bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500
                   shadow-xl shadow-orange-200
                   transition-all duration-200
                   active:scale-95 hover:shadow-2xl hover:shadow-orange-300"
      >
        <Play className="w-5 h-5" />
        開始冒險
      </button>
    </div>
  );
}

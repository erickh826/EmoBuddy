import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Trophy } from "lucide-react";
import type { LevelConfig } from "../types";

interface CertificateProps {
  levels: LevelConfig[];
  selectedEmotions: (string | undefined)[];
  onRestart: () => void;
}

export function Certificate({ levels, selectedEmotions, onRestart }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!certificateRef.current) return;
    try {
      setDownloadError(false);
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "情緒碎片探險獎狀.png";
      link.href = dataUrl;
      link.click();
    } catch {
      setDownloadError(true);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-6 py-8">
      <div
        ref={certificateRef}
        className="w-full max-w-md bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg space-y-4"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">恭喜完成！</h2>
          <p className="text-slate-500">超級社交探險家</p>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          {levels.map((level, index) => (
            <div key={level.id} className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">{level.title}</span>
              <span className="text-sm text-slate-500">
                {selectedEmotions[index] ? "已完成" : "已探索"}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">繼續探索和表達你的情緒！</p>
        </div>
      </div>

      {downloadError && (
        <p className="text-sm text-red-500">下載失敗了，但獎狀還在畫面上！</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-md">
        <Button
          variant="outline"
          className="h-12 gap-2"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5" />
          下載獎狀圖片
        </Button>

        <Button
          className="h-12 gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={onRestart}
        >
          <RotateCcw className="w-5 h-5" />
          重新開始
        </Button>
      </div>
    </div>
  );
}

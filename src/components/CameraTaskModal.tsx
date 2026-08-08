import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCamera } from "../hooks/useCamera";
import { isColorDetected } from "../lib/colorDetection";
import {
  loadCocoSsd,
  detectObject,
  SUPPORTED_OBJECT_CLASSES,
} from "../lib/objectDetection";
import type {
  CameraTask,
  CameraDetectionStrategy,
  ColorDetectionStrategy,
  ObjectDetectionStrategy,
} from "../types";

const PRIVACY_NOTICE_KEY = "emobuddy_camera_privacy_ack";
const MODEL_LOAD_TIMEOUT_MS = 10_000;
const MISS_TOLERANCE_MS = 300;
/** Maximum time (ms) to attempt color detection before falling back to manual */
const COLOR_DETECTION_TIMEOUT_MS = 30_000;

interface CameraTaskModalProps {
  cameraTask: CameraTask;
  onComplete: () => void;
  onSkip: () => void;
}

type ActiveStrategy = "object" | "color" | "manual" | "loading";

export function CameraTaskModal({
  cameraTask,
  onComplete,
  onSkip,
}: CameraTaskModalProps) {
  const { stream, permissionState, error, startCamera, stopCamera } =
    useCamera();

  const videoRef = useRef<HTMLVideoElement>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const detectedSinceRef = useRef<number | null>(null);
  const lastDetectedAtRef = useRef<number | null>(null);

  const [privacyAcked, setPrivacyAcked] = useState(
    () => !!localStorage.getItem(PRIVACY_NOTICE_KEY),
  );
  const [progress, setProgress] = useState(0);
  const [activeStrategy, setActiveStrategy] = useState<ActiveStrategy | null>(
    null,
  );
  const [modelLoadingSlow, setModelLoadingSlow] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current !== null) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    detectedSinceRef.current = null;
    lastDetectedAtRef.current = null;
  }, []);

  const handleComplete = useCallback(() => {
    stopDetection();
    stopCamera();
    onComplete();
  }, [stopDetection, stopCamera, onComplete]);

  const handleSkip = useCallback(() => {
    stopDetection();
    stopCamera();
    onSkip();
  }, [stopDetection, stopCamera, onSkip]);

  // ─── Stable detection logic ────────────────────────────────────────────────

  const updateProgress = useCallback(
    (detected: boolean) => {
      const now = Date.now();

      if (detected) {
        if (detectedSinceRef.current === null) {
          detectedSinceRef.current = now;
        }
        lastDetectedAtRef.current = now;
      } else {
        // Allow short gap without resetting
        const lastDetected = lastDetectedAtRef.current;
        if (
          lastDetected !== null &&
          now - lastDetected > MISS_TOLERANCE_MS
        ) {
          detectedSinceRef.current = null;
          lastDetectedAtRef.current = null;
        }
      }

      if (detectedSinceRef.current !== null) {
        const elapsed = now - detectedSinceRef.current;
        const p = Math.min(elapsed / cameraTask.durationMs, 1);
        setProgress(p);
        if (p >= 1) handleComplete();
      } else {
        // Slowly decay progress
        setProgress((prev) => Math.max(prev - 0.05, 0));
      }
    },
    [cameraTask.durationMs, handleComplete],
  );

  // ─── Start color detection loop ────────────────────────────────────────────

  const startColorDetection = useCallback(
    (
      colorStrategy: ColorDetectionStrategy,
      nextStrategy: (() => void) | null,
      cancelled: { current: boolean },
    ) => {
      // Clear any existing interval before starting a new one
      if (detectionIntervalRef.current !== null) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }

      const startedAt = Date.now();
      detectionIntervalRef.current = setInterval(() => {
        if (cancelled.current) return;
        const video = videoRef.current;
        if (!video) return;
        const detected = isColorDetected(video, colorStrategy.target);
        updateProgress(detected);

        // Fall back to the next strategy once the time budget is exhausted,
        // regardless of the current detection result (a brief detection that
        // never held long enough to complete should not block the fallback).
        if (
          nextStrategy !== null &&
          Date.now() - startedAt > COLOR_DETECTION_TIMEOUT_MS
        ) {
          if (detectionIntervalRef.current !== null) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
          nextStrategy();
        }
      }, 150);
    },
    [updateProgress],
  );

  // ─── Start object detection loop ──────────────────────────────────────────

  const startObjectDetection = useCallback(
    (
      objStrategies: ObjectDetectionStrategy[],
      onFallback: (() => void) | null,
      cancelled: { current: boolean },
    ) => {
      // Filter to only supported labels; if none remain, fall back immediately.
      const validTargets = objStrategies
        .map((s) => s.targetLabel)
        .filter((label) => SUPPORTED_OBJECT_CLASSES.has(label));

      if (validTargets.length === 0) {
        // No supported object labels — transition to the next strategy right away.
        if (onFallback) {
          onFallback();
        } else {
          setActiveStrategy("manual");
        }
        return;
      }

      const slowWarningTimeout = setTimeout(() => {
        if (!cancelled.current) setModelLoadingSlow(true);
      }, MODEL_LOAD_TIMEOUT_MS);

      // Race model load against the same MODEL_LOAD_TIMEOUT_MS threshold.
      const loadTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), MODEL_LOAD_TIMEOUT_MS),
      );

      Promise.race([loadCocoSsd(), loadTimeout])
        .then(() => {
          clearTimeout(slowWarningTimeout);
          if (cancelled.current) return;

          // Clear any existing interval before starting a new one
          if (detectionIntervalRef.current !== null) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
          setActiveStrategy("object");

          // Serialize inference: schedule the next tick only after the
          // previous one has finished, so a busy run is never counted as a miss.
          let running = false;
          detectionIntervalRef.current = setInterval(async () => {
            if (running || cancelled.current) return;
            const video = videoRef.current;
            if (!video) return;

            running = true;
            try {
              // Check each target label sequentially so the module-level
              // isInferenceRunning flag inside detectObject is always clear
              // when the next label is attempted. Break early on a hit.
              let detected = false;
              for (const label of validTargets) {
                if (await detectObject(video, label)) {
                  detected = true;
                  break;
                }
              }
              if (!cancelled.current) {
                updateProgress(detected);
              }
            } catch {
              // Inference error: stop the interval and fall back to the next strategy.
              if (detectionIntervalRef.current !== null) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
              }
              if (!cancelled.current && onFallback) {
                onFallback();
              } else if (!cancelled.current) {
                setActiveStrategy("manual");
              }
            } finally {
              running = false;
            }
          }, 500);
        })
        .catch(() => {
          clearTimeout(slowWarningTimeout);
          if (cancelled.current) return;
          if (onFallback) {
            onFallback();
          } else {
            setActiveStrategy("manual");
          }
        });
    },
    [updateProgress],
  );

  // ─── Attach stream to video element ───────────────────────────────────────

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ─── Start detection after stream is ready ────────────────────────────────
  //
  // Strategies are executed as an ordered fallback chain in the declared array
  // order. We build the chain from the end so each step knows its successor.

  useEffect(() => {
    if (permissionState !== "granted" || !stream) return;

    // cancelled.current lets async continuations know the effect has been
    // cleaned up so they skip any subsequent state updates.
    const cancelled = { current: false };

    // Build an ordered fallback chain from back to front.
    // The last item in the chain has no successor (manual confirmation).
    const strategies = cameraTask.strategies;

    // Collect pending object strategies so we can dispatch them as a group
    // (they share a single model-load pass and check all their labels).
    let pendingObjStrategies: ObjectDetectionStrategy[] = [];

    /**
     * Builds a thunk that starts the strategy at `index`. When called it may
     * immediately delegate to the next strategy in the chain.
     */
    const buildChain = (index: number): (() => void) | null => {
      if (index >= strategies.length) return null;

      const strategy = strategies[index];
      const nextChain = buildChain(index + 1);

      if (strategy.type === "manual") {
        return () => {
          if (!cancelled.current) setActiveStrategy("manual");
        };
      }

      if (strategy.type === "color") {
        return () => {
          if (cancelled.current) return;
          setActiveStrategy("color");
          startColorDetection(strategy, nextChain, cancelled);
        };
      }

      if (strategy.type === "object") {
        // Accumulate consecutive object strategies so they share one model load.
        pendingObjStrategies.push(strategy);
        // Only dispatch when we reach the last consecutive object strategy
        // or the next one is a different type.
        const nextStrategy = strategies[index + 1];
        if (nextStrategy && nextStrategy.type === "object") {
          // More object strategies follow — consume them first; this level just
          // aggregates into pendingObjStrategies and delegates to the real dispatch.
          return buildChain(index + 1);
        }

        // Last consecutive object strategy: capture the accumulated list.
        const objGroup = [...pendingObjStrategies];
        pendingObjStrategies = [];

        return () => {
          if (cancelled.current) return;
          setActiveStrategy("loading");
          startObjectDetection(objGroup, nextChain, cancelled);
        };
      }

      return nextChain;
    };

    // Reset before building the chain so re-runs of the effect start clean.
    pendingObjStrategies = [];
    const startChain = buildChain(0);

    // Defer state updates to avoid synchronous setState-in-effect lint error.
    const timerId = setTimeout(() => {
      if (startChain) {
        startChain();
      } else {
        setActiveStrategy("manual");
      }
    }, 0);

    return () => {
      cancelled.current = true;
      clearTimeout(timerId);
      stopDetection();
    };
  }, [
    permissionState,
    stream,
    cameraTask.strategies,
    startObjectDetection,
    startColorDetection,
    stopDetection,
  ]);

  // ─── Privacy ack flow ─────────────────────────────────────────────────────

  const handlePrivacyAck = () => {
    localStorage.setItem(PRIVACY_NOTICE_KEY, "1");
    setPrivacyAcked(true);
    // Camera will be started by the effect below once privacyAcked becomes true.
  };

  const handlePrivacySkip = () => {
    handleSkip();
  };

  // Start camera whenever privacy is acknowledged. useCamera already
  // deduplicates concurrent requests via its own in-flight guard, so no
  // extra ref is needed here.
  useEffect(() => {
    if (privacyAcked) {
      startCamera();
    }
  }, [privacyAcked, startCamera]);

  // ─── Determine the active fallback strategy label ─────────────────────────

  const getStrategyHint = (s: CameraDetectionStrategy | undefined): string => {
    if (!s) return "";
    if (s.type === "manual") return s.instruction;
    if (s.type === "color") return `將${cameraTask.targetLabel}放在鏡頭中央`;
    return "";
  };

  const manualStrategy = cameraTask.strategies.find(
    (s): s is { type: "manual"; instruction: string } => s.type === "manual",
  );
  const colorStrategy = cameraTask.strategies.find(
    (s): s is ColorDetectionStrategy => s.type === "color",
  );

  // ─── Render: Privacy notice (first time) ──────────────────────────────────

  if (!privacyAcked) {
    return (
      <Dialog open>
        <DialogContent
          className="max-w-sm"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">🔒 鏡頭隱私提示</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-center">
            <p className="text-slate-600 text-sm leading-relaxed">
              鏡頭只在這部裝置上尋找顏色或物品，
              <strong>不會拍照或上傳</strong>。
              你隨時可以關閉鏡頭或跳過這個任務。
            </p>
            <div className="flex flex-col gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handlePrivacyAck}
              >
                知道了，開始
              </Button>
              <Button variant="outline" onClick={handlePrivacySkip}>
                用大人確認
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Render: Permission denied ─────────────────────────────────────────────

  if (permissionState === "denied" || permissionState === "unavailable") {
    return (
      <Dialog open>
        <DialogContent
          className="max-w-sm"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">📷 {cameraTask.targetLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-center">
            <p className="text-slate-600 text-sm">
              {error ?? "無法使用鏡頭，你可以選擇由大人幫忙確認"}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSkip}
              >
                大人幫忙確認
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                跳過
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Render: Main camera UI ─────────────────────────────────────────────────

  const progressPct = Math.round(progress * 100);

  return (
    <Dialog open>
      <DialogContent
        className="max-w-md p-4"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            📷 {cameraTask.targetLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Camera preview */}
          <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* ROI scan box */}
            {(activeStrategy === "color" || activeStrategy === "object") && (
              <div
                className="absolute border-2 border-yellow-400 rounded"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "30%",
                  height: "30%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 0 1000px rgba(0,0,0,0.3)",
                }}
              />
            )}

            {/* Loading overlay */}
            {activeStrategy === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-sm gap-2">
                <span className="animate-pulse">準備中…</span>
                {modelLoadingSlow && (
                  <span className="text-xs text-yellow-300">
                    加載時間較長，可以改用大人確認
                  </span>
                )}
              </div>
            )}

            {/* Manual mode overlay */}
            {activeStrategy === "manual" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white text-sm text-center px-4 gap-2">
                <span>
                  {getStrategyHint(manualStrategy ?? colorStrategy)}
                </span>
              </div>
            )}
          </div>

          {/* Goal label */}
          <p className="text-center text-slate-700 text-sm font-medium">
            目標：{cameraTask.targetLabel}
          </p>

          {/* Progress bar */}
          {activeStrategy !== "manual" && activeStrategy !== "loading" && (
            <div className="space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-150"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      progressPct < 50
                        ? "#f59e0b"
                        : progressPct < 100
                        ? "#10b981"
                        : "#059669",
                  }}
                />
              </div>
              <p className="text-xs text-center text-slate-400">
                {progressPct < 100
                  ? "把目標物放在黃色框框裡…"
                  : "✅ 找到了！"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              關閉鏡頭
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleSkip}
            >
              大人幫忙確認
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

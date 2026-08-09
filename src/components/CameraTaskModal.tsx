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
  ManualDetectionStrategy,
} from "../types";

const PRIVACY_NOTICE_KEY = "emobuddy_camera_privacy_ack";
const MODEL_LOAD_TIMEOUT_MS = 10_000;
/**
 * Show the "loading is slow" hint well before the hard timeout so it is
 * actually visible; otherwise it would fire at the same instant the model
 * load times out and falls back, and never be seen.
 */
const MODEL_SLOW_WARNING_MS = 4_000;
/** Wall-clock bound for a color-detection attempt before falling back. */
const COLOR_ATTEMPT_TIMEOUT_MS = 15_000;
/**
 * Wall-clock bound for an object-detection attempt (after the model has
 * loaded) before falling back to the next strategy. Without this, a task
 * whose target is never found would stay in object mode indefinitely and
 * never reach the configured manual fallback.
 */
const OBJECT_ATTEMPT_TIMEOUT_MS = 15_000;
/** Must exceed the effective detection interval (~1000 ms when scanning 2 labels
 *  sequentially at 500-ms ticks) so a single false-negative detection never
 *  resets the accumulated progress. */
const MISS_TOLERANCE_MS = 1500;

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
  const colorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (colorTimeoutRef.current !== null) {
      clearTimeout(colorTimeoutRef.current);
      colorTimeoutRef.current = null;
    }
    if (objectTimeoutRef.current !== null) {
      clearTimeout(objectTimeoutRef.current);
      objectTimeoutRef.current = null;
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
      onFallback: () => void,
      cancelled: { current: boolean },
    ) => {
      // Clear any existing interval / timeout before starting a new one
      if (detectionIntervalRef.current !== null) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (colorTimeoutRef.current !== null) {
        clearTimeout(colorTimeoutRef.current);
        colorTimeoutRef.current = null;
      }

      // Reset progress streak when entering a new strategy.
      detectedSinceRef.current = null;
      lastDetectedAtRef.current = null;
      setProgress(0);

      detectionIntervalRef.current = setInterval(() => {
        if (cancelled.current) return;
        const video = videoRef.current;
        if (!video) return;
        const detected = isColorDetected(video, colorStrategy.target);
        updateProgress(detected);
      }, 150);

      // Bounded attempt: if color never satisfies the threshold, fall through
      // to the next configured strategy (Color → Manual).
      colorTimeoutRef.current = setTimeout(() => {
        if (cancelled.current) return;
        if (detectionIntervalRef.current !== null) {
          clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
        colorTimeoutRef.current = null;
        detectedSinceRef.current = null;
        lastDetectedAtRef.current = null;
        setProgress(0);
        onFallback();
      }, COLOR_ATTEMPT_TIMEOUT_MS);
    },
    [updateProgress],
  );

  // ─── Start object detection loop ──────────────────────────────────────────

  const startObjectDetection = useCallback(
    (
      objStrategies: ObjectDetectionStrategy[],
      onFallback: () => void,
      cancelled: { current: boolean },
    ) => {
      // Filter to only supported labels; if none remain, fall back immediately.
      const validTargets = objStrategies
        .map((s) => s.targetLabel)
        .filter((label) => SUPPORTED_OBJECT_CLASSES.has(label));

      if (validTargets.length === 0) {
        // Caller may have set activeStrategy to "loading"; always leave that
        // state by advancing to the next configured strategy.
        onFallback();
        return;
      }

      const slowWarningTimeout = setTimeout(() => {
        if (!cancelled.current) setModelLoadingSlow(true);
      }, MODEL_SLOW_WARNING_MS);

      let loadTimerId: ReturnType<typeof setTimeout> | null = null;
      const loadTimeout = new Promise<never>((_, reject) => {
        loadTimerId = setTimeout(
          () => reject(new Error("timeout")),
          MODEL_LOAD_TIMEOUT_MS,
        );
      });

      const clearLoadTimers = () => {
        clearTimeout(slowWarningTimeout);
        if (loadTimerId !== null) clearTimeout(loadTimerId);
      };

      Promise.race([loadCocoSsd(), loadTimeout])
        .then(() => {
          clearLoadTimers();
          if (cancelled.current) return;

          // Clear any existing interval before starting a new one
          if (detectionIntervalRef.current !== null) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }

          detectedSinceRef.current = null;
          lastDetectedAtRef.current = null;
          setProgress(0);
          setActiveStrategy("object");
          setModelLoadingSlow(false);

          // Serialize inference: skip ticks while a previous run is still
          // in flight so a busy run is never counted as a miss.
          let running = false;
          let fellBack = false;

          const fallbackFromInference = () => {
            if (fellBack || cancelled.current) return;
            fellBack = true;
            if (detectionIntervalRef.current !== null) {
              clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
            }
            if (objectTimeoutRef.current !== null) {
              clearTimeout(objectTimeoutRef.current);
              objectTimeoutRef.current = null;
            }
            detectedSinceRef.current = null;
            lastDetectedAtRef.current = null;
            setProgress(0);
            onFallback();
          };

          // Bounded attempt: if the target is never detected, advance to the
          // next configured strategy (e.g. Object → Manual) instead of
          // staying in object mode indefinitely. Cleared on completion via
          // stopDetection, on cleanup, and on inference failure.
          objectTimeoutRef.current = setTimeout(() => {
            fallbackFromInference();
          }, OBJECT_ATTEMPT_TIMEOUT_MS);

          detectionIntervalRef.current = setInterval(async () => {
            if (running || cancelled.current || fellBack) return;
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
              if (!cancelled.current && !fellBack) {
                updateProgress(detected);
              }
            } catch {
              // Inference failures must follow the degradation chain rather
              // than leaving the UI stuck in object mode with unhandled
              // rejections.
              fallbackFromInference();
            } finally {
              running = false;
            }
          }, 500);
        })
        .catch(() => {
          clearLoadTimers();
          if (cancelled.current) return;
          setModelLoadingSlow(false);
          onFallback();
        });
    },
    [updateProgress],
  );

  // ─── Ordered strategy chain ───────────────────────────────────────────────
  //
  // Walks `cameraTask.strategies` in array order. Consecutive object entries
  // are OR'd together (e.g. book | cup), then the chain advances past that
  // block on failure/timeout. Color has a bounded attempt window. Manual (or
  // end-of-list) is the terminal state.

  const startStrategyAt = useCallback(
    (
      strategies: CameraDetectionStrategy[],
      index: number,
      cancelled: { current: boolean },
    ) => {
      if (cancelled.current) return;

      if (index >= strategies.length) {
        setActiveStrategy("manual");
        return;
      }

      const strategy = strategies[index];

      if (strategy.type === "manual") {
        setActiveStrategy("manual");
        return;
      }

      if (strategy.type === "color") {
        setActiveStrategy("color");
        startColorDetection(
          strategy,
          () => startStrategyAt(strategies, index + 1, cancelled),
          cancelled,
        );
        return;
      }

      // type === "object": collect consecutive object strategies as OR targets
      const objStrategies: ObjectDetectionStrategy[] = [];
      let nextIndex = index;
      while (
        nextIndex < strategies.length &&
        strategies[nextIndex].type === "object"
      ) {
        objStrategies.push(strategies[nextIndex] as ObjectDetectionStrategy);
        nextIndex += 1;
      }

      setActiveStrategy("loading");
      startObjectDetection(
        objStrategies,
        () => startStrategyAt(strategies, nextIndex, cancelled),
        cancelled,
      );
    },
    [startColorDetection, startObjectDetection],
  );

  // ─── Attach stream to video element ───────────────────────────────────────

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      // Explicit play() is required on mobile browsers — the autoPlay HTML
      // attribute alone will not reliably start camera stream playback.
      videoRef.current.play().catch(() => {
        // iOS Safari may reject play() without user gesture even with
        // playsInline + muted; we swallow the error so the fallback chain
        // (object → color → manual) can still proceed.
      });
    }
  }, [stream]);

  // ─── Start detection after stream is ready ────────────────────────────────

  useEffect(() => {
    if (permissionState !== "granted" || !stream) return;

    const strategies = cameraTask.strategies;

    // cancelled.current lets async model-load continuations know the effect
    // has been cleaned up so they skip any subsequent state updates.
    const cancelled = { current: false };

    // Defer state updates to avoid synchronous setState-in-effect lint error
    const timerId = setTimeout(() => {
      startStrategyAt(strategies, 0, cancelled);
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
    startStrategyAt,
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

  // Start camera on mount only if privacy was already acknowledged, or when
  // the user first acknowledges privacy in this session.
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current && privacyAcked) {
      hasMountedRef.current = true;
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
    (s): s is ManualDetectionStrategy => s.type === "manual",
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
                  boxShadow: "0 0 0 1000px rgba(0,0,0,0.3)",
                  transform: "translate(-50%, -50%)",
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

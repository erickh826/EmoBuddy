/** COCO-SSD allowlist — only these labels are valid targets */
export const SUPPORTED_OBJECT_CLASSES = new Set([
  "person",
  "bottle",
  "cup",
  "book",
  "chair",
  "teddy bear",
  "apple",
  "orange",
  "banana",
  "cell phone",
  "remote",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "wine glass",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "carrot",
  "cake",
  "donut",
  "potted plant",
  "keyboard",
  "laptop",
  "mouse",
]);

type CocoSsdPrediction = {
  class: string;
  score: number;
  bbox: [number, number, number, number];
};

type CocoSsdModel = {
  detect: (input: HTMLVideoElement) => Promise<CocoSsdPrediction[]>;
};

let modelPromise: Promise<CocoSsdModel> | null = null;
let isInferenceRunning = false;

/** Load the COCO-SSD model (cached). Resolves in ~4-12 s on first call. */
export async function loadCocoSsd(): Promise<CocoSsdModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const [cocoSsd] = await Promise.all([
        import("@tensorflow-models/coco-ssd"),
        import("@tensorflow/tfjs"),
      ]);
      return (await cocoSsd.load()) as unknown as CocoSsdModel;
    })();
  }
  return modelPromise;
}

/**
 * Run one inference pass against the video element.
 * Returns true if targetLabel is detected with score >= minScore.
 * Skips the run if another inference is already in progress.
 */
export async function detectObject(
  video: HTMLVideoElement,
  targetLabel: string,
  minScore = 0.5,
): Promise<boolean> {
  if (!SUPPORTED_OBJECT_CLASSES.has(targetLabel)) return false;
  if (isInferenceRunning) return false;
  if (!video.videoWidth || !video.videoHeight) return false;

  isInferenceRunning = true;
  try {
    const model = await loadCocoSsd();
    const predictions = await model.detect(video);
    return predictions.some(
      (p) => p.class === targetLabel && p.score >= minScore,
    );
  } finally {
    isInferenceRunning = false;
  }
}

/** Discard the cached model (useful for cleanup / memory pressure). */
export function disposeCocoSsd() {
  modelPromise = null;
  isInferenceRunning = false;
}

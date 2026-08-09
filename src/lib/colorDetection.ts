import type { HSLColorTarget } from "../types";

/** Convert a single R,G,B (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100) */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function hueInRanges(hue: number, ranges: Array<[number, number]>): boolean {
  for (const [lo, hi] of ranges) {
    if (hue >= lo && hue <= hi) return true;
  }
  return false;
}

const ANALYSIS_SIZE = 64; // px — the ROI crop is downscaled to this for analysis

/**
 * The preview container in CameraTaskModal uses `aspect-video` (16:9) with the
 * video rendered `object-cover`, and the yellow ROI overlay is a centered box
 * 30% of the container in each dimension.
 */
const PREVIEW_ASPECT = 16 / 9;
const ROI_FRACTION = 0.3;

/**
 * Captures the on-screen ROI from a <video> element via an offscreen canvas,
 * then returns the fraction of pixels matching the HSL target.
 *
 * The crop is computed to match what the user actually sees inside the yellow
 * box: first the region of the source frame that is visible under
 * `object-fit: cover` for a 16:9 container, then the centered 30% of that
 * region. That crop is downscaled to ANALYSIS_SIZE for per-pixel analysis, so
 * an object clearly inside the yellow box is sampled regardless of the source
 * resolution.
 */
export function analyzeColorInVideo(
  video: HTMLVideoElement,
  target: HSLColorTarget,
): number {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight) return 0;

  const canvas = document.createElement("canvas");
  canvas.width = ANALYSIS_SIZE;
  canvas.height = ANALYSIS_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;

  // Region of the source frame that is actually visible under object-cover.
  let visibleW = videoWidth;
  let visibleH = videoHeight;
  if (videoWidth / videoHeight > PREVIEW_ASPECT) {
    // Source is wider than the container: left/right are cropped off-screen.
    visibleW = videoHeight * PREVIEW_ASPECT;
  } else {
    // Source is taller/narrower: top/bottom are cropped off-screen.
    visibleH = videoWidth / PREVIEW_ASPECT;
  }

  const cropW = Math.max(1, Math.round(visibleW * ROI_FRACTION));
  const cropH = Math.max(1, Math.round(visibleH * ROI_FRACTION));
  const sx = Math.max(0, Math.round((videoWidth - cropW) / 2));
  const sy = Math.max(0, Math.round((videoHeight - cropH) / 2));

  ctx.drawImage(
    video,
    sx,
    sy,
    cropW,
    cropH,
    0,
    0,
    ANALYSIS_SIZE,
    ANALYSIS_SIZE,
  );

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE);
  } catch {
    // Cross-origin guard (shouldn't happen with local camera, but be safe)
    return 0;
  }

  const { data } = imageData;
  const totalPixels = ANALYSIS_SIZE * ANALYSIS_SIZE;
  let matched = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    const lightnessMax = target.lightnessMax ?? 90;
    if (
      hueInRanges(h, target.hueRanges) &&
      s >= target.saturationMin &&
      l >= target.lightnessMin &&
      l <= lightnessMax
    ) {
      matched++;
    }
  }

  return matched / totalPixels;
}

/**
 * Returns true when the current frame meets the detection threshold.
 */
export function isColorDetected(
  video: HTMLVideoElement,
  target: HSLColorTarget,
): boolean {
  return analyzeColorInVideo(video, target) >= target.pixelRatioThreshold;
}

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

const ROI_SIZE = 64; // px — central square to sample

/**
 * Captures a central ROI from a <video> element via an offscreen canvas,
 * then returns the fraction of pixels matching the HSL target.
 */
export function analyzeColorInVideo(
  video: HTMLVideoElement,
  target: HSLColorTarget,
): number {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight) return 0;

  const canvas = document.createElement("canvas");
  canvas.width = ROI_SIZE;
  canvas.height = ROI_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;

  const sx = Math.max(0, (videoWidth - ROI_SIZE) / 2);
  const sy = Math.max(0, (videoHeight - ROI_SIZE) / 2);

  ctx.drawImage(video, sx, sy, ROI_SIZE, ROI_SIZE, 0, 0, ROI_SIZE, ROI_SIZE);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, ROI_SIZE, ROI_SIZE);
  } catch {
    // Cross-origin guard (shouldn't happen with local camera, but be safe)
    return 0;
  }

  const { data } = imageData;
  const totalPixels = ROI_SIZE * ROI_SIZE;
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

import { useState, useCallback, useEffect, useRef } from "react";

export type CameraPermissionState = "prompt" | "granted" | "denied" | "unavailable";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("prompt");
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Already running
    if (streamRef.current) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable");
      setError("此裝置不支援鏡頭功能");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState("granted");
      setError(null);
    } catch (err) {
      const domError = err as DOMException;
      if (
        domError.name === "NotAllowedError" ||
        domError.name === "PermissionDeniedError"
      ) {
        setPermissionState("denied");
        setError("無法使用鏡頭，你可以選擇由大人幫忙確認");
      } else if (
        domError.name === "NotFoundError" ||
        domError.name === "DevicesNotFoundError"
      ) {
        setPermissionState("unavailable");
        setError("找不到鏡頭裝置");
      } else {
        setPermissionState("unavailable");
        setError("鏡頭無法啟動，請稍後再試");
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { stream, permissionState, error, startCamera, stopCamera };
}

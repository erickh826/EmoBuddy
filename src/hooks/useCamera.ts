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

  // Tracks whether the hook is still mounted; used to invalidate pending
  // getUserMedia requests that resolve after cleanup.
  const mountedRef = useRef(true);
  // Tracks whether a getUserMedia request is currently in-flight so we
  // never issue two concurrent requests.
  const requestInFlightRef = useRef(false);

  const startCamera = useCallback(async () => {
    // Already running or a request is already in-flight
    if (streamRef.current || requestInFlightRef.current) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable");
      setError("此裝置不支援鏡頭功能");
      return;
    }

    requestInFlightRef.current = true;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      // Component may have unmounted while the permission dialog was open.
      if (!mountedRef.current) {
        // Stop any acquired tracks immediately so the camera light goes off.
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState("granted");
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
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
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  return { stream, permissionState, error, startCamera, stopCamera };
}

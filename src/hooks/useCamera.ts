import { useCallback, useEffect, useRef, useState } from "react";

interface UseCameraOptions {
  defaultFacingMode?: "user" | "environment";
  enabled?: boolean;
}

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  isReady: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  stream: MediaStream | null;
  facingMode: "user" | "environment";
  toggleCamera: () => Promise<void>;
  hasMultipleCameras: boolean;
}

export function useCamera(
  options: UseCameraOptions = {}
): UseCameraResult {
  const { defaultFacingMode = "user", enabled = true } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    defaultFacingMode
  );
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const check = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (d) => d.kind === "videoinput"
        );
        setHasMultipleCameras(videoInputs.length >= 2);
      } catch {
        setHasMultipleCameras(false);
      }
    };
    check();
  }, [stream]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("当前浏览器不支持摄像头 API");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
        setIsReady(true);
      }
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError") {
        setError("摄像头权限被拒绝，请在浏览器设置中允许访问");
      } else if (err.name === "NotFoundError") {
        setError("未检测到可用的摄像头设备");
      } else {
        setError(`摄像头启动失败：${err.message || err.name}`);
      }
      setIsReady(false);
    }
  }, [facingMode]);

  const toggleCamera = useCallback(async () => {
    const next = facingMode === "user" ? "environment" : "user";
    stop();
    setFacingMode(next);
    await new Promise((r) => requestAnimationFrame(() => r(void 0)));
    await start();
  }, [facingMode, start, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    videoRef,
    isReady,
    error,
    start,
    stop,
    stream,
    facingMode,
    toggleCamera,
    hasMultipleCameras,
  };
}

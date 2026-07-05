import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { Landmark } from "@/types/scan";

// 模型文件 CDN 地址（lite 版本，体积小，推理快）
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";

interface UsePoseLandmarkerOptions {
  enabled: boolean;
  video: HTMLVideoElement | null;
  onResult?: (result: PoseLandmarkerResult) => void;
}

interface UsePoseLandmarkerResult {
  landmarker: PoseLandmarker | null;
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
  isDetecting: boolean;
  isReady: boolean;
  error: string | null;
  fps: number;
}

/**
 * MediaPipe Pose Landmarker Hook
 * 负责加载 WASM + 模型，并以 requestAnimationFrame 循环推理
 */
export function usePoseLandmarker({
  enabled,
  video,
  onResult,
}: UsePoseLandmarkerOptions): UsePoseLandmarkerResult {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const onResultRef = useRef(onResult);

  const [landmarker, setLandmarker] = useState<PoseLandmarker | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [worldLandmarks, setWorldLandmarks] = useState<Landmark[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // 同步最新 onResult 回调
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // 初始化 landmarker
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const lm = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelled) {
          lm.close();
          return;
        }
        landmarkerRef.current = lm;
        setLandmarker(lm);
        setIsReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(
            `姿态识别模型加载失败：${(e as Error).message || "未知错误"}`
          );
        }
      }
    }
    init();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  // 推理循环
  const tick = useCallback(() => {
    const lm = landmarkerRef.current;
    const v = video;
    if (!lm || !v || v.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const now = performance.now();
    // MediaPipe 要求 timestamp 单调递增
    if (now <= lastTimeRef.current) {
      lastTimeRef.current = now;
    }
    const ts = now * 1000; // ms → μs
    lastTimeRef.current = now;

    try {
      const result = lm.detectForVideo(v, ts);
      const lms =
        result.landmarks && result.landmarks[0]
          ? (result.landmarks[0] as Landmark[])
          : [];
      const wlms =
        result.worldLandmarks && result.worldLandmarks[0]
          ? (result.worldLandmarks[0] as Landmark[])
          : [];
      setLandmarks(lms);
      setWorldLandmarks(wlms);
      onResultRef.current?.(result);

      // FPS 计算
      frameCountRef.current += 1;
      const elapsed = now - lastFpsUpdateRef.current;
      if (elapsed >= 500) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    } catch {
      // 单帧推理失败忽略，下一帧继续
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [video]);

  useEffect(() => {
    if (!enabled || !isReady || !video) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsDetecting(false);
      return;
    }
    setIsDetecting(true);
    lastFpsUpdateRef.current = performance.now();
    frameCountRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsDetecting(false);
    };
  }, [enabled, isReady, video, tick]);

  return {
    landmarker,
    landmarks,
    worldLandmarks,
    isDetecting,
    isReady,
    error,
    fps,
  };
}

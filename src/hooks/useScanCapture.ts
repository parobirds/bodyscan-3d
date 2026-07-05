import { useCallback, useEffect, useRef, useState } from "react";
import type { CaptureFrame, Landmark } from "@/types/scan";
import { coreConfidence } from "@/utils/measurements";

type CapturePhase = "idle" | "front" | "side" | "back" | "done";

interface UseScanCaptureOptions {
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
  enabled: boolean;
  onCapture: (frame: CaptureFrame) => void;
  onComplete: () => void;
  /** 单视角稳定时长（ms），默认 2000 */
  stableDuration?: number;
  /** 平均置信度阈值，默认 0.7 */
  confidenceThreshold?: number;
}

interface UseScanCaptureResult {
  phase: CapturePhase;
  progress: number; // 当前视角稳定进度 0~1
  overallProgress: number; // 总进度 0~1
  message: string;
  forceCapture: () => void;
  reset: () => void;
}

const PHASE_ORDER: CapturePhase[] = ["front", "side", "back"];
const PHASE_LABEL: Record<CapturePhase, string> = {
  idle: "等待开始",
  front: "请面向摄像头，保持正面站立",
  side: "请缓慢向右转身，呈现侧面",
  back: "请继续转身，呈现背面",
  done: "采集完成",
};

/**
 * 三视角采集状态机
 * 每个视角要求关键点置信度达标且稳定一段时间后自动捕获
 */
export function useScanCapture({
  landmarks,
  worldLandmarks,
  enabled,
  onCapture,
  onComplete,
  stableDuration = 2000,
  confidenceThreshold = 0.7,
}: UseScanCaptureOptions): UseScanCaptureResult {
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [progress, setProgress] = useState(0);
  const stableStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const message = PHASE_LABEL[phase];
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const overallProgress =
    phase === "done"
      ? 1
      : phase === "idle"
      ? 0
      : (phaseIndex + progress) / PHASE_ORDER.length;

  const captureCurrent = useCallback(() => {
    if (phase === "idle" || phase === "done") return;
    if (!landmarks.length) return;
    const confidence = coreConfidence(landmarks);
    const frame: CaptureFrame = {
      angle: phase,
      landmarks: landmarks.map((l) => ({ ...l })),
      worldLandmarks: worldLandmarks.map((l) => ({ ...l })),
      capturedAt: Date.now(),
      confidence,
    };
    onCapture(frame);

    const nextIndex = phaseIndex + 1;
    if (nextIndex >= PHASE_ORDER.length) {
      setPhase("done");
      setProgress(1);
      onComplete();
    } else {
      setPhase(PHASE_ORDER[nextIndex]);
      setProgress(0);
    }
    stableStartRef.current = null;
  }, [landmarks, worldLandmarks, phase, phaseIndex, onCapture, onComplete]);

  // 稳定检测循环
  useEffect(() => {
    if (!enabled || phase === "idle" || phase === "done") {
      stableStartRef.current = null;
      setProgress(0);
      return;
    }

    const tick = () => {
      const confidence = coreConfidence(landmarks);
      if (confidence >= confidenceThreshold) {
        if (stableStartRef.current === null) {
          stableStartRef.current = performance.now();
        }
        const elapsed = performance.now() - stableStartRef.current;
        const p = Math.min(1, elapsed / stableDuration);
        setProgress(p);
        if (p >= 1) {
          captureCurrent();
          return;
        }
      } else {
        stableStartRef.current = null;
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    enabled,
    phase,
    landmarks,
    stableDuration,
    confidenceThreshold,
    captureCurrent,
  ]);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    stableStartRef.current = null;
  }, []);

  // 当 enabled 由 false 变 true 时自动启动
  useEffect(() => {
    if (enabled && phase === "idle") {
      setPhase("front");
    }
    if (!enabled && phase !== "done") {
      setPhase("idle");
      setProgress(0);
      stableStartRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    phase,
    progress,
    overallProgress,
    message,
    forceCapture: captureCurrent,
    reset,
  };
}

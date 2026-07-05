import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CameraOff,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanLine,
  User,
  Zap,
} from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";
import { useScanCapture } from "@/hooks/useScanCapture";
import { useScanStore } from "@/store/scanStore";
import { coreConfidence } from "@/utils/measurements";
import { saveCalibration } from "@/utils/storage";
import ScanOverlay from "@/components/ScanOverlay";
import { cn } from "@/lib/utils";
import type { CaptureAngle, CaptureFrame } from "@/types/scan";

const PHASE_LABELS: Record<string, string> = {
  idle: "待机",
  front: "正面",
  side: "侧面",
  back: "背面",
  done: "完成",
};

const PHASE_ICONS: Record<CaptureAngle | "idle" | "done", string> = {
  idle: "○",
  front: "F",
  side: "S",
  back: "B",
  done: "✓",
};

export default function Scan() {
  const navigate = useNavigate();
  const addCapture = useScanStore((s) => s.addCapture);
  const resetCaptures = useScanStore((s) => s.resetCaptures);
  const setCalibrationHeight = useScanStore((s) => s.setCalibrationHeight);
  const calibrationHeight = useScanStore((s) => s.calibrationHeight);
  const captures = useScanStore((s) => s.captures);

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [calibration, setCalibration] = useState(
    calibrationHeight > 0 ? String(calibrationHeight) : ""
  );
  const [capturedAngles, setCapturedAngles] = useState<CaptureAngle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { videoRef, isReady, error, start, stop } = useCamera({
    enabled: true,
  });

  // 获取 video 元素供 pose landmarker 使用
  const videoEl = videoRef.current;
  const {
    landmarks,
    worldLandmarks,
    isReady: poseReady,
    error: poseError,
    fps,
  } = usePoseLandmarker({
    enabled: isReady,
    video: videoEl ?? null,
  });

  const handleCapture = useCallback(
    (frame: CaptureFrame) => {
      addCapture(frame);
      setCapturedAngles((prev) =>
        prev.includes(frame.angle) ? prev : [...prev, frame.angle]
      );
    },
    [addCapture]
  );

  const handleComplete = useCallback(() => {
    // 完成后稍作停顿跳转
    setTimeout(() => {
      navigate("/model");
    }, 600);
  }, [navigate]);

  const {
    phase,
    progress,
    overallProgress,
    message,
    forceCapture,
    reset,
  } = useScanCapture({
    landmarks,
    worldLandmarks,
    enabled: isReady && poseReady,
    onCapture: handleCapture,
    onComplete: handleComplete,
  });

  // 测量容器尺寸
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 卸载时停止摄像头
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const confidence = coreConfidence(landmarks);

  const handleCalibrationChange = (v: string) => {
    setCalibration(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0) {
      setCalibrationHeight(n);
      saveCalibration(n);
    }
  };

  const handleReset = () => {
    resetCaptures();
    setCapturedAngles([]);
    reset();
  };

  const handleSkipToModel = () => {
    // 使用演示数据进入建模页
    navigate("/model?demo=1");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void">
      {/* 背景网格 */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      {/* 顶部状态栏 */}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex items-center justify-center px-6 lg:top-20">
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-cyber/30 bg-abyss/80 px-5 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isReady && poseReady
                  ? "animate-pulse bg-cyber"
                  : "bg-amber2"
              )}
            />
            <span className="font-mono text-[11px] uppercase tracking-widest text-cyber">
              {poseReady ? "POSE MODEL READY" : "INITIALIZING..."}
            </span>
          </div>
          <span className="h-3 w-px bg-cyber/30" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-ash">
            FPS <span className="text-cyber">{fps}</span>
          </span>
          <span className="h-3 w-px bg-cyber/30" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-ash">
            CONF <span className="text-cyber">{(confidence * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>

      {/* 摄像头视口 */}
      <div className="absolute inset-0 flex items-center justify-center px-4 pb-32 pt-32 lg:pb-40 lg:pt-36">
        <div
          ref={containerRef}
          className="relative aspect-[3/4] h-full max-h-[80vh] w-auto max-w-full overflow-hidden rounded-lg border border-cyber/30 bg-black shadow-cyber-lg sm:aspect-video"
        >
          {/* 视频流（镜像） */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />

          {/* 关键点叠加 */}
          {containerSize.w > 0 && (
            <ScanOverlay
              landmarks={landmarks}
              width={containerSize.w}
              height={containerSize.h}
              mirror
            />
          )}

          {/* HUD 角标 */}
          <span className="hud-corner tl" />
          <span className="hud-corner tr" />
          <span className="hud-corner bl" />
          <span className="hud-corner br" />

          {/* 扫描线 */}
          {phase !== "idle" && phase !== "done" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-x-0 h-32 bg-scan-sweep animate-scan-down"
                style={{ filter: "blur(2px)" }}
              />
            </div>
          )}

          {/* 中央十字准星 */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-16 w-16">
              <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-cyber/60" />
              <div className="absolute left-1/2 bottom-0 h-4 w-px -translate-x-1/2 bg-cyber/60" />
              <div className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-cyber/60" />
              <div className="absolute top-1/2 right-0 h-px w-4 -translate-y-1/2 bg-cyber/60" />
              <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber" />
            </div>
          </div>

          {/* 视角指示 */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-cyber/30 bg-void/70 px-3 py-1.5 backdrop-blur-md">
            <ScanLine size={14} className="text-cyber" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyber">
              VIEW: {PHASE_LABELS[phase]}
            </span>
          </div>

          {/* 进度提示条 */}
          {phase !== "idle" && (
            <div className="absolute bottom-4 left-1/2 w-[80%] max-w-md -translate-x-1/2">
              <div className="mb-2 text-center font-mono text-[11px] uppercase tracking-widest text-cyber">
                {message}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-abyss">
                <div
                  className="h-full bg-gradient-to-r from-cyber to-cyber/60 transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误遮罩 */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/90 p-6 text-center backdrop-blur-sm">
              <CameraOff size={36} className="text-neon" />
              <div className="font-display text-sm tracking-wider text-neon">
                摄像头不可用
              </div>
              <p className="max-w-xs font-mono text-xs text-ash">{error}</p>
              <button onClick={() => start()} className="btn-cyber mt-2">
                重试
              </button>
            </div>
          )}

          {/* 姿态模型错误 */}
          {!error && poseError && (
            <div className="absolute bottom-20 left-1/2 max-w-xs -translate-x-1/2 rounded-md border border-amber2/40 bg-void/90 px-4 py-3 text-center backdrop-blur-md">
              <div className="mb-1 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber2">
                <AlertTriangle size={12} /> 模型加载失败
              </div>
              <p className="font-mono text-[10px] text-ash">{poseError}</p>
            </div>
          )}

          {/* 加载中 */}
          {!error && !isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/80 backdrop-blur-sm">
              <Loader2 size={32} className="animate-spin text-cyber" />
              <div className="font-mono text-[11px] uppercase tracking-widest text-cyber">
                初始化摄像头...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 三视角步骤指示器 */}
      <div className="pointer-events-none absolute inset-x-0 top-28 z-20 flex justify-center px-6 lg:top-32">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyber/20 bg-abyss/70 px-3 py-1.5 backdrop-blur-md">
          {(["front", "side", "back"] as CaptureAngle[]).map((angle, i) => {
            const done = capturedAngles.includes(angle);
            const active = phase === angle;
            return (
              <div key={angle} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                    done
                      ? "bg-cyber/20 text-cyber"
                      : active
                      ? "bg-amber2/20 text-amber2"
                      : "text-ash/60"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-full text-[9px]",
                      done
                        ? "bg-cyber text-void"
                        : active
                        ? "bg-amber2 text-void"
                        : "bg-slate2 text-ash"
                    )}
                  >
                    {done ? "✓" : PHASE_ICONS[angle]}
                  </span>
                  {PHASE_LABELS[angle]}
                </div>
                {i < 2 && <span className="h-px w-3 bg-cyber/30" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部控制台 */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-cyber/15 bg-abyss/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 左侧：校准身高 */}
          <div className="flex items-center gap-3">
            <User size={16} className="text-cyber" />
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ash">
              校准身高
              <input
                type="number"
                min="100"
                max="250"
                value={calibration}
                placeholder="170"
                onChange={(e) => handleCalibrationChange(e.target.value)}
                className="w-20 rounded border border-cyber/30 bg-void px-2 py-1 text-cyber outline-none focus:border-cyber focus:shadow-cyber"
              />
              <span className="text-ash/60">cm</span>
            </label>
          </div>

          {/* 中间：主控制按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="btn-ghost"
              title="重置采集"
            >
              <RotateCcw size={14} />
              重置
            </button>
            <button
              onClick={forceCapture}
              disabled={phase === "idle" || phase === "done" || !landmarks.length}
              className="btn-cyber"
            >
              <Zap size={14} />
              手动捕获
            </button>
            <button
              onClick={handleSkipToModel}
              className="btn-ghost"
              title="使用演示数据"
            >
              演示数据
            </button>
          </div>

          {/* 右侧：总进度 */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ash">
                总进度
              </div>
              <div className="font-display text-sm text-cyber">
                {(overallProgress * 100).toFixed(0)}%
              </div>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-cyber/30 grid place-items-center">
              <div
                className="font-mono text-[10px] text-cyber"
                style={{
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {capturedAngles.length}/3
              </div>
            </div>
          </div>
        </div>

        {/* 总进度条 */}
        <div className="h-0.5 w-full bg-abyss">
          <div
            className="h-full bg-gradient-to-r from-cyber via-cyber to-neon transition-all duration-300"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </div>
      </div>

      {/* 完成提示 */}
      {phase === "done" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-void/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 animate-fade-up">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-cyber bg-cyber/10 shadow-cyber-lg">
              <CheckCircle2 size={40} className="text-cyber" />
            </div>
            <div className="font-display text-2xl tracking-widest text-cyber text-glow-cyber">
              采集完成
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-ash">
              正在构建三维模型...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

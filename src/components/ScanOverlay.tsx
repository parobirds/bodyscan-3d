import { useEffect, useRef } from "react";
import type { Landmark } from "@/types/scan";
import { POSE_CONNECTIONS, POSE_LANDMARKS } from "@/types/scan";

interface ScanOverlayProps {
  landmarks: Landmark[];
  width: number;
  height: number;
  /** 是否镜像（前置摄像头通常需要镜像） */
  mirror?: boolean;
}

const KEY_POINTS = new Set<number>([
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_ELBOW,
  POSE_LANDMARKS.RIGHT_ELBOW,
  POSE_LANDMARKS.LEFT_WRIST,
  POSE_LANDMARKS.RIGHT_WRIST,
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.LEFT_KNEE,
  POSE_LANDMARKS.RIGHT_KNEE,
  POSE_LANDMARKS.LEFT_ANKLE,
  POSE_LANDMARKS.RIGHT_ANKLE,
]);

/** 根据可见性返回颜色 */
function visibilityColor(v: number | undefined): string {
  const c = v ?? 0;
  if (c >= 0.85) return "#22E3DC"; // cyber
  if (c >= 0.6) return "#FFB547"; // amber
  return "#FF2E88"; // neon
}

export default function ScanOverlay({
  landmarks,
  width,
  height,
  mirror = true,
}: ScanOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 高 DPI 支持
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!landmarks.length) return;

    const xMap = (l: Landmark) =>
      mirror ? width - l.x * width : l.x * width;
    const yMap = (l: Landmark) => l.y * height;

    // 绘制骨架连线
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    POSE_CONNECTIONS.forEach(([a, b]) => {
      const la = landmarks[a];
      const lb = landmarks[b];
      if (!la || !lb) return;
      const va = la.visibility ?? 0;
      const vb = lb.visibility ?? 0;
      const avg = (va + vb) / 2;
      if (avg < 0.3) return;

      ctx.strokeStyle = visibilityColor(avg);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(xMap(la), yMap(la));
      ctx.lineTo(xMap(lb), yMap(lb));
      ctx.stroke();
    });

    // 绘制关键点
    ctx.shadowBlur = 12;
    landmarks.forEach((l, i) => {
      if (!KEY_POINTS.has(i)) return;
      const v = l.visibility ?? 0;
      if (v < 0.3) return;
      const color = visibilityColor(v);
      const r = i === POSE_LANDMARKS.NOSE ? 5 : 4;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(xMap(l), yMap(l), r, 0, Math.PI * 2);
      ctx.fill();

      // 外圈
      ctx.strokeStyle = `${color}55`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(xMap(l), yMap(l), r + 4, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
  }, [landmarks, width, height, mirror]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

import type {
  BodyMeasurements,
  CaptureFrame,
  Landmark,
} from "@/types/scan";
import { POSE_LANDMARKS } from "@/types/scan";

/** 三维向量距离 */
function dist3D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** 二维向量距离（归一化坐标） */
function dist2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** 计算关键点的平均可见性 */
export function averageVisibility(landmarks: Landmark[]): number {
  if (!landmarks?.length) return 0;
  const visible = landmarks.filter((l) => l.visibility !== undefined);
  if (!visible.length) return 0;
  return visible.reduce((sum, l) => sum + (l.visibility ?? 0), 0) / visible.length;
}

/** 计算关键骨架点的平均置信度（仅核心点） */
export function coreConfidence(landmarks: Landmark[]): number {
  const coreIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
  ];
  const visible = coreIndices.map((i) => landmarks[i]?.visibility ?? 0);
  return visible.reduce((a, b) => a + b, 0) / visible.length;
}

/**
 * 估算身高（cm）。
 * 优先使用校准身高；否则基于头顶→脚踝的归一化距离按经验系数换算。
 */
export function estimateHeight(
  landmarks: Landmark[],
  calibrationHeight: number
): number {
  if (calibrationHeight > 0) return calibrationHeight;

  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  if (!nose || !leftAnkle || !rightAnkle) return 170;

  const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
  // 归一化身高（约 0.85 ~ 1.0），头顶约在鼻子上方 0.05
  const normalizedHeight = Math.max(0.6, ankleY - nose.y + 0.05);
  // 经验换算：归一化 0.85 ≈ 170cm
  return Math.round(normalizedHeight * 200);
}

/** 肩宽（cm） */
export function estimateShoulderWidth(
  landmarks: Landmark[],
  pixelsPerCm: number
): number {
  const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  if (!ls || !rs) return 40;
  return Math.round(dist2D(ls, rs) / pixelsPerCm);
}

/** 臂展（cm）：左右手腕距离 */
export function estimateArmSpan(
  landmarks: Landmark[],
  pixelsPerCm: number
): number {
  const lw = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rw = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  if (!lw || !rw) return 170;
  return Math.round(dist2D(lw, rw) / pixelsPerCm);
}

/** 单侧上肢长度（肩→肘→腕） */
export function estimateArmLength(
  landmarks: Landmark[],
  side: "left" | "right",
  pixelsPerCm: number
): number {
  const shoulder = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER
  ];
  const elbow = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW
  ];
  const wrist = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST
  ];
  if (!shoulder || !elbow || !wrist) return 0;
  return Math.round(
    (dist3D(shoulder, elbow) + dist3D(elbow, wrist)) / pixelsPerCm
  );
}

/** 单侧下肢长度（髋→膝→踝） */
export function estimateLegLength(
  landmarks: Landmark[],
  side: "left" | "right",
  pixelsPerCm: number
): number {
  const hip = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP
  ];
  const knee = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE
  ];
  const ankle = landmarks[
    side === "left" ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE
  ];
  if (!hip || !knee || !ankle) return 0;
  return Math.round((dist3D(hip, knee) + dist3D(knee, ankle)) / pixelsPerCm);
}

/**
 * 经验公式估算围度（基于身高与体型系数）
 * 参考：成年男/女性平均比例
 */
export function estimateCircumference(
  height: number,
  kind: "chest" | "waist" | "hip",
  bodyType: "slim" | "standard" | "athletic" = "standard"
): number {
  const ratio = {
    slim: { chest: 0.51, waist: 0.42, hip: 0.52 },
    standard: { chest: 0.55, waist: 0.46, hip: 0.55 },
    athletic: { chest: 0.6, waist: 0.44, hip: 0.56 },
  }[bodyType];

  return Math.round(height * ratio[kind]);
}

/** 体型分类 */
export function classifyBodyShape(m: BodyMeasurements): string {
  const { shoulderWidth, hip, waist } = m;
  if (shoulderWidth === 0 || hip === 0) return "未知";

  const ratio = shoulderWidth / hip;
  const waistToHip = waist / hip;

  if (Math.abs(ratio - 1) < 0.05 && waistToHip < 0.75) return "沙漏型";
  if (ratio > 1.1) return "倒三角型";
  if (ratio < 0.9) return "梨形";
  if (waistToHip > 0.85) return "矩形";
  if (waistToHip < 0.7) return "沙漏型";
  return "标准型";
}

/** 估算体重（kg，Broca 指数修正） */
export function estimateWeight(
  height: number,
  bodyType: "slim" | "standard" | "athletic"
): number {
  const base = height - 105;
  const factor = { slim: 0.9, standard: 1.0, athletic: 1.12 }[bodyType];
  return Math.round(base * factor);
}

/** 计算完整身体尺寸 */
export function computeMeasurements(
  captures: CaptureFrame[],
  calibrationHeight: number,
  bodyType: "slim" | "standard" | "athletic" = "standard"
): BodyMeasurements {
  // 使用正面视角作为主测量
  const front = captures.find((c) => c.angle === "front");
  const fallback = captures[0];
  const source = front ?? fallback;

  if (!source) {
    return {
      height: calibrationHeight || 170,
      shoulderWidth: 0,
      armSpan: 0,
      leftArm: 0,
      rightArm: 0,
      leftLeg: 0,
      rightLeg: 0,
      chest: 0,
      waist: 0,
      hip: 0,
      bodyShape: "未知",
    };
  }

  const landmarks = source.landmarks;
  const height = estimateHeight(landmarks, calibrationHeight);

  // 像素/厘米换算：以肩宽 ≈ 0.245 × 身高 为基准
  const shoulderNorm =
    dist2D(
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
    ) || 0.245 * (height / 200);
  const pixelsPerCm = Math.max(0.0001, shoulderNorm / (0.245 * height));

  const shoulderWidth = estimateShoulderWidth(landmarks, pixelsPerCm);
  const armSpan = estimateArmSpan(landmarks, pixelsPerCm);
  const leftArm = estimateArmLength(landmarks, "left", pixelsPerCm);
  const rightArm = estimateArmLength(landmarks, "right", pixelsPerCm);
  const leftLeg = estimateLegLength(landmarks, "left", pixelsPerCm);
  const rightLeg = estimateLegLength(landmarks, "right", pixelsPerCm);

  const chest = estimateCircumference(height, "chest", bodyType);
  const waist = estimateCircumference(height, "waist", bodyType);
  const hip = estimateCircumference(height, "hip", bodyType);

  const weightEstimate = estimateWeight(height, bodyType);
  const bmi = Math.round(
    (weightEstimate / Math.pow(height / 100, 2)) * 10
  ) / 10;

  const measurements: BodyMeasurements = {
    height,
    shoulderWidth,
    armSpan,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    chest,
    waist,
    hip,
    bodyShape: "",
    bmi,
    weightEstimate,
  };

  measurements.bodyShape = classifyBodyShape(measurements);
  return measurements;
}

// 共享类型定义

/** MediaPipe Pose 关键点（共 33 个） */
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/** 采集视角 */
export type CaptureAngle = "front" | "side" | "back";

/** 单次视角采集结果 */
export interface CaptureFrame {
  angle: CaptureAngle;
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
  capturedAt: number;
  confidence: number;
}

/** 身体尺寸（单位：cm） */
export interface BodyMeasurements {
  height: number;
  shoulderWidth: number;
  armSpan: number;
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  chest: number;
  waist: number;
  hip: number;
  bodyShape: string;
  bmi?: number;
  weightEstimate?: number;
}

/** 完整扫描会话 */
export interface ScanSession {
  id: string;
  captures: CaptureFrame[];
  calibrationHeight: number;
  measurements: BodyMeasurements;
  createdAt: number;
}

/** 体型预设 */
export type BodyTypePreset = "slim" | "standard" | "athletic";

/** 三维模型视图参数 */
export interface ModelViewSettings {
  autoRotate: boolean;
  wireframe: boolean;
  showKeypoints: boolean;
  showLabels: boolean;
  bodyType: BodyTypePreset;
  heightScale: number; // 校准身高 cm
}

/** MediaPipe 关键点索引 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 4,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

/** 骨架连接（用于 2D 叠加绘制） */
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // 肩
  [11, 13], [13, 15], // 左臂
  [12, 14], [14, 16], // 右臂
  [11, 23], [12, 24], [23, 24], // 躯干
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // 左腿
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32], // 右腿
  [0, 11], [0, 12], // 颈
];

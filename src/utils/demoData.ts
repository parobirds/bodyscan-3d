import type { CaptureFrame, CaptureAngle, Landmark } from "@/types/scan";
import { POSE_LANDMARKS } from "@/types/scan";

/**
 * 生成演示用的人体姿态数据（标准 T-pose）
 * 坐标系：归一化 [0,1]，原点左上角，Y 向下，Z 向观察者
 */
function generateFrontLandmarks(): Landmark[] {
  const cx = 0.5;
  // Y 坐标（自上而下）
  const yNose = 0.12;
  const yShoulder = 0.2;
  const yElbow = 0.35;
  const yWrist = 0.5;
  const yHip = 0.52;
  const yKnee = 0.75;
  const yAnkle = 0.95;

  // X 偏移（左右对称）
  const shoulderX = 0.18;
  const elbowX = 0.28;
  const wristX = 0.38;
  const hipX = 0.1;
  const ankleX = 0.08;

  const lm: Landmark[] = new Array(33).fill(0).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0,
  }));

  // 头部
  lm[POSE_LANDMARKS.NOSE] = { x: cx, y: yNose, z: -0.05, visibility: 0.99 };
  lm[POSE_LANDMARKS.LEFT_EYE] = { x: cx - 0.02, y: yNose - 0.02, z: -0.05, visibility: 0.99 };
  lm[POSE_LANDMARKS.RIGHT_EYE] = { x: cx + 0.02, y: yNose - 0.02, z: -0.05, visibility: 0.99 };
  lm[POSE_LANDMARKS.LEFT_EAR] = { x: cx - 0.05, y: yNose, z: 0, visibility: 0.9 };
  lm[POSE_LANDMARKS.RIGHT_EAR] = { x: cx + 0.05, y: yNose, z: 0, visibility: 0.9 };
  lm[POSE_LANDMARKS.MOUTH_LEFT] = { x: cx - 0.02, y: yNose + 0.03, z: -0.04, visibility: 0.9 };
  lm[POSE_LANDMARKS.MOUTH_RIGHT] = { x: cx + 0.02, y: yNose + 0.03, z: -0.04, visibility: 0.9 };

  // 肩
  lm[POSE_LANDMARKS.LEFT_SHOULDER] = { x: cx - shoulderX, y: yShoulder, z: -0.02, visibility: 0.99 };
  lm[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: cx + shoulderX, y: yShoulder, z: -0.02, visibility: 0.99 };

  // 肘
  lm[POSE_LANDMARKS.LEFT_ELBOW] = { x: cx - elbowX, y: yElbow, z: -0.01, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_ELBOW] = { x: cx + elbowX, y: yElbow, z: -0.01, visibility: 0.95 };

  // 腕（T-pose 水平展开）
  lm[POSE_LANDMARKS.LEFT_WRIST] = { x: cx - wristX, y: yWrist - 0.05, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_WRIST] = { x: cx + wristX, y: yWrist - 0.05, z: 0, visibility: 0.95 };

  // 手部细节
  lm[17] = { x: cx - wristX - 0.01, y: yWrist - 0.04, z: 0, visibility: 0.7 };
  lm[18] = { x: cx + wristX + 0.01, y: yWrist - 0.04, z: 0, visibility: 0.7 };
  lm[19] = { x: cx - wristX - 0.005, y: yWrist - 0.05, z: 0, visibility: 0.7 };
  lm[20] = { x: cx + wristX + 0.005, y: yWrist - 0.05, z: 0, visibility: 0.7 };
  lm[21] = { x: cx - wristX, y: yWrist - 0.06, z: 0, visibility: 0.7 };
  lm[22] = { x: cx + wristX, y: yWrist - 0.06, z: 0, visibility: 0.7 };

  // 髋
  lm[POSE_LANDMARKS.LEFT_HIP] = { x: cx - hipX, y: yHip, z: -0.02, visibility: 0.99 };
  lm[POSE_LANDMARKS.RIGHT_HIP] = { x: cx + hipX, y: yHip, z: -0.02, visibility: 0.99 };

  // 膝
  lm[POSE_LANDMARKS.LEFT_KNEE] = { x: cx - hipX + 0.005, y: yKnee, z: 0.02, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_KNEE] = { x: cx + hipX - 0.005, y: yKnee, z: 0.02, visibility: 0.95 };

  // 踝
  lm[POSE_LANDMARKS.LEFT_ANKLE] = { x: cx - ankleX, y: yAnkle, z: 0.02, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_ANKLE] = { x: cx + ankleX, y: yAnkle, z: 0.02, visibility: 0.95 };

  // 脚
  lm[29] = { x: cx - ankleX, y: yAnkle + 0.01, z: 0.06, visibility: 0.8 };
  lm[30] = { x: cx + ankleX, y: yAnkle + 0.01, z: 0.06, visibility: 0.8 };
  lm[31] = { x: cx - ankleX - 0.02, y: yAnkle, z: 0.08, visibility: 0.7 };
  lm[32] = { x: cx + ankleX + 0.02, y: yAnkle, z: 0.08, visibility: 0.7 };

  return lm;
}

/** 生成侧视关键点（用于深度参考） */
function generateSideLandmarks(): Landmark[] {
  const base = generateFrontLandmarks();
  // 侧面：所有点 X 收窄，Z 增大
  return base.map((l) => ({
    ...l,
    x: 0.5 + (l.x - 0.5) * 0.15,
    z: l.z - 0.1,
  }));
}

/** 生成背视关键点 */
function generateBackLandmarks(): Landmark[] {
  const base = generateFrontLandmarks();
  // 背面：X 翻转，Z 翻转
  return base.map((l) => ({
    ...l,
    x: 1 - l.x,
    z: -l.z + 0.04,
  }));
}

/** 生成完整的演示扫描会话数据 */
export function generateDemoCaptures(): CaptureFrame[] {
  const angles: CaptureAngle[] = ["front", "side", "back"];
  const generators = [generateFrontLandmarks, generateSideLandmarks, generateBackLandmarks];

  return angles.map((angle, i) => ({
    angle,
    landmarks: generators[i](),
    worldLandmarks: generators[i]().map((l) => ({
      // 归一化坐标 → 世界坐标（米），Y 向上
      x: (l.x - 0.5) * 1.8,
      y: (0.5 - l.y) * 1.8,
      z: -l.z * 1.8,
      visibility: l.visibility,
    })),
    capturedAt: Date.now() - (3 - i) * 1000,
    confidence: 0.95,
  }));
}

/**
 * 将归一化 landmarks 转换为 3D 世界坐标（米）
 * MediaPipe 坐标系：X 右，Y 下，Z 向观察者
 * Three.js 坐标系：X 右，Y 上，Z 向观察者
 */
export function landmarksToWorld(landmarks: Landmark[]): Landmark[] {
  return landmarks.map((l) => ({
    x: (l.x - 0.5) * 1.8,
    y: (0.5 - l.y) * 1.8,
    z: -l.z * 1.8,
    visibility: l.visibility,
  }));
}

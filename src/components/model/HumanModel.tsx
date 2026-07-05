import { useMemo } from "react";
import * as THREE from "three";
import type { CaptureFrame, Landmark, BodyTypePreset } from "@/types/scan";
import { POSE_LANDMARKS } from "@/types/scan";
import { landmarksToWorld } from "@/utils/demoData";

interface HumanModelProps {
  captures: CaptureFrame[];
  calibrationHeight: number; // cm
  bodyType: BodyTypePreset;
  wireframe?: boolean;
  showKeypoints?: boolean;
}

/** 体型对应的粗细系数 */
const BODY_RADII: Record<BodyTypePreset, {
  head: number;
  neck: number;
  torso: number;
  arm: number;
  forearm: number;
  thigh: number;
  calf: number;
}> = {
  slim: { head: 0.11, neck: 0.05, torso: 0.16, arm: 0.05, forearm: 0.045, thigh: 0.08, calf: 0.06 },
  standard: { head: 0.125, neck: 0.06, torso: 0.19, arm: 0.06, forearm: 0.055, thigh: 0.095, calf: 0.07 },
  athletic: { head: 0.13, neck: 0.07, torso: 0.22, arm: 0.075, forearm: 0.065, thigh: 0.11, calf: 0.08 },
};

/** 在两点之间生成一个胶囊体 mesh 的 props */
function limbProps(a: Landmark, b: Landmark, radius: number) {
  const va = new THREE.Vector3(a.x, a.y, a.z);
  const vb = new THREE.Vector3(b.x, b.y, b.z);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dir = vb.clone().sub(va);
  const length = dir.length();
  // 默认胶囊沿 Y 轴，需要旋转到 dir 方向
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  return {
    position: [mid.x, mid.y, mid.z] as [number, number, number],
    quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] as [number, number, number, number],
    length: Math.max(0.001, length - radius * 1.6),
    radius,
  };
}

interface LimbProps {
  a: Landmark;
  b: Landmark;
  radius: number;
  color?: string;
  wireframe?: boolean;
}

function Limb({ a, b, radius, color = "#22E3DC", wireframe = false }: LimbProps) {
  const props = useMemo(() => limbProps(a, b, radius), [a, b, radius]);
  return (
    <mesh
      position={props.position}
      quaternion={props.quaternion as unknown as THREE.Quaternion}
    >
      <capsuleGeometry args={[props.radius, props.length, 6, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        metalness={0.3}
        roughness={0.5}
        wireframe={wireframe}
      />
    </mesh>
  );
}

interface JointProps {
  position: [number, number, number];
  radius?: number;
  color?: string;
}

function Joint({ position, radius = 0.04, color = "#22E3DC" }: JointProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function HumanModel({
  captures,
  calibrationHeight,
  bodyType,
  wireframe = false,
  showKeypoints = false,
}: HumanModelProps) {
  // 取正面视角作为主骨架
  const front = captures.find((c) => c.angle === "front") ?? captures[0];
  const radii = BODY_RADII[bodyType];

  // 转换为世界坐标 + 身高缩放
  const world = useMemo(() => {
    if (!front) return null;
    const lm = front.worldLandmarks?.length
      ? front.worldLandmarks
      : landmarksToWorld(front.landmarks);

    // 计算实际缩放：以校准身高 / 当前模型高度
    const noseY = lm[POSE_LANDMARKS.NOSE]?.y ?? 0.5;
    const ankleY =
      ((lm[POSE_LANDMARKS.LEFT_ANKLE]?.y ?? 0) +
        (lm[POSE_LANDMARKS.RIGHT_ANKLE]?.y ?? 0)) /
      2;
    const modelHeight = Math.max(0.1, noseY - ankleY);
    // 目标高度（米）：身高 / 100，再 +0.15 头顶余量
    const targetHeight = calibrationHeight / 100 + 0.15;
    const scale = targetHeight / modelHeight;

    return lm.map((p) => ({
      x: p.x * scale,
      y: p.y * scale,
      z: p.z * scale,
      visibility: p.visibility,
    }));
  }, [front, calibrationHeight]);

  if (!world) {
    return (
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FF2E88" />
      </mesh>
    );
  }

  const L = (i: number): Landmark =>
    world[i] ?? { x: 0, y: 0, z: 0, visibility: 0 };

  const head = L(POSE_LANDMARKS.NOSE);
  const lShoulder = L(POSE_LANDMARKS.LEFT_SHOULDER);
  const rShoulder = L(POSE_LANDMARKS.RIGHT_SHOULDER);
  const lElbow = L(POSE_LANDMARKS.LEFT_ELBOW);
  const rElbow = L(POSE_LANDMARKS.RIGHT_ELBOW);
  const lWrist = L(POSE_LANDMARKS.LEFT_WRIST);
  const rWrist = L(POSE_LANDMARKS.RIGHT_WRIST);
  const lHip = L(POSE_LANDMARKS.LEFT_HIP);
  const rHip = L(POSE_LANDMARKS.RIGHT_HIP);
  const lKnee = L(POSE_LANDMARKS.LEFT_KNEE);
  const rKnee = L(POSE_LANDMARKS.RIGHT_KNEE);
  const lAnkle = L(POSE_LANDMARKS.LEFT_ANKLE);
  const rAnkle = L(POSE_LANDMARKS.RIGHT_ANKLE);

  // 颈部中点
  const neck: Landmark = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2,
    z: (lShoulder.z + rShoulder.z) / 2,
  };
  // 髋部中点
  const hipCenter: Landmark = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2,
    z: (lHip.z + rHip.z) / 2,
  };
  // 头顶（鼻子上方约一个头半径）
  const headTop: Landmark = {
    x: head.x,
    y: head.y + radii.head * 1.4,
    z: head.z,
  };

  return (
    <group>
      {/* 头部 */}
      <mesh position={[head.x, head.y, head.z]}>
        <sphereGeometry args={[radii.head, 24, 24]} />
        <meshStandardMaterial
          color="#22E3DC"
          emissive="#22E3DC"
          emissiveIntensity={0.4}
          metalness={0.4}
          roughness={0.4}
          wireframe={wireframe}
        />
      </mesh>

      {/* 颈 */}
      <Limb a={head} b={neck} radius={radii.neck} wireframe={wireframe} />

      {/* 躯干（肩→髋用胶囊连接，左右各一） */}
      <Limb a={lShoulder} b={lHip} radius={radii.torso} wireframe={wireframe} />
      <Limb a={rShoulder} b={rHip} radius={radii.torso} wireframe={wireframe} />
      {/* 肩横梁 */}
      <Limb a={lShoulder} b={rShoulder} radius={radii.neck * 1.1} wireframe={wireframe} />
      {/* 髋横梁 */}
      <Limb a={lHip} b={rHip} radius={radii.neck * 1.1} wireframe={wireframe} />

      {/* 左臂 */}
      <Limb a={lShoulder} b={lElbow} radius={radii.arm} color="#3FEFE8" wireframe={wireframe} />
      <Limb a={lElbow} b={lWrist} radius={radii.forearm} color="#3FEFE8" wireframe={wireframe} />
      {/* 右臂 */}
      <Limb a={rShoulder} b={rElbow} radius={radii.arm} color="#3FEFE8" wireframe={wireframe} />
      <Limb a={rElbow} b={rWrist} radius={radii.forearm} color="#3FEFE8" wireframe={wireframe} />

      {/* 左腿 */}
      <Limb a={lHip} b={lKnee} radius={radii.thigh} color="#FF2E88" wireframe={wireframe} />
      <Limb a={lKnee} b={lAnkle} radius={radii.calf} color="#FF2E88" wireframe={wireframe} />
      {/* 右腿 */}
      <Limb a={rHip} b={rKnee} radius={radii.thigh} color="#FF2E88" wireframe={wireframe} />
      <Limb a={rKnee} b={rAnkle} radius={radii.calf} color="#FF2E88" wireframe={wireframe} />

      {/* 关节点 */}
      <Joint position={[lShoulder.x, lShoulder.y, lShoulder.z]} radius={radii.arm * 0.9} />
      <Joint position={[rShoulder.x, rShoulder.y, rShoulder.z]} radius={radii.arm * 0.9} />
      <Joint position={[lElbow.x, lElbow.y, lElbow.z]} radius={radii.arm * 0.8} />
      <Joint position={[rElbow.x, rElbow.y, rElbow.z]} radius={radii.arm * 0.8} />
      <Joint position={[lHip.x, lHip.y, lHip.z]} radius={radii.thigh * 0.9} />
      <Joint position={[rHip.x, rHip.y, rHip.z]} radius={radii.thigh * 0.9} />
      <Joint position={[lKnee.x, lKnee.y, lKnee.z]} radius={radii.thigh * 0.75} />
      <Joint position={[rKnee.x, rKnee.y, rKnee.z]} radius={radii.thigh * 0.75} />

      {/* 关键点显示（调试用） */}
      {showKeypoints &&
        world.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#FFB547" />
          </mesh>
        ))}

      {/* 地面投影圆 */}
      <mesh
        position={[hipCenter.x, lAnkle.y - 0.005, hipCenter.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.25, 0.32, 48]} />
        <meshBasicMaterial color="#22E3DC" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* 身高参考线（若显示标注） */}
      <mesh position={[headTop.x + 0.45, (headTop.y + lAnkle.y) / 2, headTop.z]}>
        <boxGeometry args={[0.005, headTop.y - lAnkle.y, 0.005]} />
        <meshBasicMaterial color="#22E3DC" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

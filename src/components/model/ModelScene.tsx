import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import HumanModel from "./HumanModel";
import type { CaptureFrame, ModelViewSettings } from "@/types/scan";

interface ModelSceneProps {
  captures: CaptureFrame[];
  view: ModelViewSettings;
}

interface SceneContentProps {
  captures: CaptureFrame[];
  view: ModelViewSettings;
}

function SceneContent({ captures, view }: SceneContentProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (view.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <>
      {/* 灯光 */}
      <ambientLight intensity={0.35} color="#8AB8C8" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.4}
        color="#22E3DC"
      />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.5}
        color="#FF2E88"
      />
      <pointLight position={[0, 3, 5]} intensity={0.6} color="#FFFFFF" />

      {/* 模型组 */}
      <group ref={groupRef}>
        <HumanModel
          captures={captures}
          calibrationHeight={view.heightScale}
          bodyType={view.bodyType}
          wireframe={view.wireframe}
          showKeypoints={view.showKeypoints}
        />

        {/* 标注 */}
        {view.showLabels && (
          <>
            <Html
              position={[0.55, view.heightScale / 100 / 2, 0]}
              center
              distanceFactor={6}
              zIndexRange={[20, 0]}
            >
              <div className="whitespace-nowrap rounded border border-cyber/50 bg-void/85 px-2 py-1 text-center font-mono text-[10px] backdrop-blur-sm">
                <div className="text-cyber">身高</div>
                <div className="text-white">{view.heightScale} cm</div>
              </div>
            </Html>
            <Html
              position={[0, -1.15, 0.4]}
              center
              distanceFactor={6}
              zIndexRange={[20, 0]}
            >
              <div className="whitespace-nowrap rounded border border-neon/50 bg-void/85 px-2 py-1 text-center font-mono text-[10px] backdrop-blur-sm">
                <div className="text-neon">体型</div>
                <div className="text-white uppercase">{view.bodyType}</div>
              </div>
            </Html>
          </>
        )}
      </group>

      {/* 地面网格 */}
      <Grid
        position={[0, -1.05, 0]}
        args={[12, 12]}
        cellSize={0.3}
        cellThickness={0.6}
        cellColor="#22E3DC"
        sectionSize={1.2}
        sectionThickness={1.2}
        sectionColor="#FF2E88"
        fadeDistance={14}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* 雾化 */}
      <fog attach="fog" args={["#070A12", 6, 16]} />
    </>
  );
}

export default function ModelScene({ captures, view }: ModelSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.8, 3.2], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent captures={captures} view={view} />
        <Environment preset="night" />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={1.5}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 0.2, 0]}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}

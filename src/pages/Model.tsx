import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Camera,
  Eye,
  Grid3x3,
  Maximize2,
  RefreshCw,
  Ruler,
  ScanLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ModelScene from "@/components/model/ModelScene";
import { useScanStore } from "@/store/scanStore";
import { generateDemoCaptures } from "@/utils/demoData";
import { cn } from "@/lib/utils";
import type { BodyTypePreset } from "@/types/scan";

const BODY_TYPES: { value: BodyTypePreset; label: string; desc: string }[] = [
  { value: "slim", label: "瘦削型", desc: "低体脂 · 修长" },
  { value: "standard", label: "标准型", desc: "匀称 · 平均" },
  { value: "athletic", label: "健壮型", desc: "高肌肉量 · 厚实" },
];

export default function Model() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const captures = useScanStore((s) => s.captures);
  const view = useScanStore((s) => s.view);
  const setView = useScanStore((s) => s.setView);
  const setBodyType = useScanStore((s) => s.setBodyType);
  const finalizeSession = useScanStore((s) => s.finalizeSession);

  // 若无采集数据，使用演示数据
  const effectiveCaptures = useMemo(() => {
    if (captures.length > 0) return captures;
    return generateDemoCaptures();
  }, [captures]);

  // 进入页面时若有真实数据，自动 finalize 生成 session（含 measurements）
  const [finalized, setFinalized] = useState(false);
  useEffect(() => {
    if (captures.length > 0 && !finalized) {
      finalizeSession();
      setFinalized(true);
    }
  }, [captures, finalized, finalizeSession]);

  const handleResetView = () => {
    // 通过重新挂载 Canvas 重置（简化方案）
    setView({ autoRotate: !view.autoRotate });
    setTimeout(() => setView({ autoRotate: view.autoRotate }), 50);
  };

  const handleRescan = () => {
    navigate("/scan");
  };

  const handleViewReport = () => {
    navigate("/report");
  };

  return (
    <div className="relative min-h-screen w-full bg-void pt-16 lg:pl-64 lg:pt-0">
      {/* 背景 */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(34,227,220,0.08), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,46,136,0.06), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex h-screen flex-col lg:h-screen">
        {/* 顶部信息栏 */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-cyber/15 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-cyber/40 bg-cyber/5">
              <Box size={18} className="text-cyber" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-widest text-white">
                三维建模
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-cyber/70">
                {isDemo || captures.length === 0
                  ? "DEMO MODE · 演示数据"
                  : `${captures.length} 视角已采集`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRescan} className="btn-ghost">
              <RefreshCw size={14} />
              重新扫描
            </button>
            <button onClick={handleViewReport} className="btn-cyber">
              <TrendingUp size={14} />
              查看报告
            </button>
          </div>
        </header>

        {/* 主体：3D 视口 + 侧边面板 */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* 3D 视口 */}
          <div className="relative flex-1 overflow-hidden">
            <ModelScene captures={effectiveCaptures} view={view} />

            {/* 视口 HUD */}
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
              <div className="pointer-events-auto flex items-center gap-2 rounded border border-cyber/30 bg-void/70 px-3 py-1.5 backdrop-blur-md">
                <ScanLine size={12} className="text-cyber" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-cyber">
                  MESH READY
                </span>
              </div>
              <div className="pointer-events-auto rounded border border-cyber/20 bg-void/70 px-3 py-2 font-mono text-[10px] text-ash backdrop-blur-md">
                <div className="mb-1 text-cyber">CAMERA</div>
                <div>FOV 45° · POS [0,0.8,3.2]</div>
                <div>TARGET [0,0.2,0]</div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 top-4 flex flex-col gap-2">
              <div className="pointer-events-auto rounded border border-neon/30 bg-void/70 px-3 py-2 text-right font-mono text-[10px] backdrop-blur-md">
                <div className="text-neon">MODEL</div>
                <div className="text-white">{view.heightScale} cm</div>
                <div className="text-ash uppercase">{view.bodyType}</div>
              </div>
            </div>

            {/* 操作提示 */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="rounded-full border border-cyber/20 bg-void/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ash backdrop-blur-md">
                <span className="text-cyber">拖拽</span> 旋转 ·{" "}
                <span className="text-cyber">滚轮</span> 缩放 ·{" "}
                <span className="text-cyber">右键</span> 平移
              </div>
            </div>
          </div>

          {/* 侧边控制面板 */}
          <aside className="flex w-full flex-shrink-0 flex-col gap-4 overflow-y-auto border-t border-cyber/15 bg-abyss/60 p-5 backdrop-blur-md lg:w-80 lg:border-l lg:border-t-0">
            {/* 视图控件 */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyber">
                <Eye size={12} />
                视图控制
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setView({ autoRotate: !view.autoRotate })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all",
                    view.autoRotate
                      ? "border-cyber bg-cyber/15 text-cyber shadow-cyber"
                      : "border-ash/30 text-ash hover:text-cyber"
                  )}
                >
                  <RefreshCw size={12} />
                  自动旋转
                </button>
                <button
                  onClick={() => setView({ wireframe: !view.wireframe })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all",
                    view.wireframe
                      ? "border-cyber bg-cyber/15 text-cyber shadow-cyber"
                      : "border-ash/30 text-ash hover:text-cyber"
                  )}
                >
                  <Grid3x3 size={12} />
                  线框模式
                </button>
                <button
                  onClick={() => setView({ showKeypoints: !view.showKeypoints })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all",
                    view.showKeypoints
                      ? "border-cyber bg-cyber/15 text-cyber shadow-cyber"
                      : "border-ash/30 text-ash hover:text-cyber"
                  )}
                >
                  <Sparkles size={12} />
                  关键点
                </button>
                <button
                  onClick={() => setView({ showLabels: !view.showLabels })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all",
                    view.showLabels
                      ? "border-cyber bg-cyber/15 text-cyber shadow-cyber"
                      : "border-ash/30 text-ash hover:text-cyber"
                  )}
                >
                  <Ruler size={12} />
                  标注
                </button>
              </div>
              <button
                onClick={handleResetView}
                className="btn-ghost mt-2 w-full"
              >
                <Maximize2 size={12} />
                重置视角
              </button>
            </section>

            {/* 身高滑块 */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyber">
                <Camera size={12} />
                身高校准
              </h3>
              <div className="card-cyber p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ash">
                    HEIGHT
                  </span>
                  <span className="font-display text-xl text-cyber text-glow-cyber">
                    {view.heightScale}
                    <span className="ml-1 text-xs text-ash">cm</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={view.heightScale}
                  onChange={(e) =>
                    setView({ heightScale: parseInt(e.target.value, 10) })
                  }
                  className="range-cyber w-full"
                />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-ash/60">
                  <span>140</span>
                  <span>175</span>
                  <span>210</span>
                </div>
              </div>
            </section>

            {/* 体型预设 */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyber">
                <Box size={12} />
                体型预设
              </h3>
              <div className="flex flex-col gap-2">
                {BODY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setBodyType(t.value)}
                    className={cn(
                      "rounded border px-3 py-2 text-left transition-all",
                      view.bodyType === t.value
                        ? "border-cyber bg-cyber/10 shadow-cyber"
                        : "border-ash/25 hover:border-cyber/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-white">
                        {t.label}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase",
                          view.bodyType === t.value
                            ? "text-cyber"
                            : "text-ash/60"
                        )}
                      >
                        {t.value}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-ash">
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 模型信息 */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyber">
                <Ruler size={12} />
                模型信息
              </h3>
              <div className="card-cyber space-y-2 p-4 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-ash">视角数</span>
                  <span className="text-cyber">{effectiveCaptures.length}/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">关键点</span>
                  <span className="text-cyber">33 KP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">网格</span>
                  <span className="text-cyber">~18 MESH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">渲染器</span>
                  <span className="text-cyber">WebGL2</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

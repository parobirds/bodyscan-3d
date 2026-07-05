import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Box,
  Calendar,
  Camera,
  FileJson,
  FileBarChart2,
  History,
  Image as ImageIcon,
  Info,
  Ruler,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useScanStore } from "@/store/scanStore";
import {
  downloadDataUrl,
  downloadJson,
  formatTime,
  loadHistory,
} from "@/utils/storage";
import { computeMeasurements } from "@/utils/measurements";
import { generateDemoCaptures } from "@/utils/demoData";
import { cn } from "@/lib/utils";
import type { BodyMeasurements, ScanSession } from "@/types/scan";

interface MetricCard {
  key: keyof BodyMeasurements | string;
  label: string;
  unit: string;
  Icon: typeof Ruler;
  accent: "cyber" | "neon" | "amber2";
}

const METRICS: MetricCard[] = [
  { key: "height", label: "身高", unit: "cm", Icon: User, accent: "cyber" },
  { key: "shoulderWidth", label: "肩宽", unit: "cm", Icon: Ruler, accent: "cyber" },
  { key: "armSpan", label: "臂展", unit: "cm", Icon: Ruler, accent: "cyber" },
  { key: "chest", label: "胸围", unit: "cm", Icon: Activity, accent: "neon" },
  { key: "waist", label: "腰围", unit: "cm", Icon: Activity, accent: "neon" },
  { key: "hip", label: "臀围", unit: "cm", Icon: Activity, accent: "neon" },
  { key: "leftArm", label: "左臂长", unit: "cm", Icon: Ruler, accent: "amber2" },
  { key: "leftLeg", label: "左腿长", unit: "cm", Icon: Ruler, accent: "amber2" },
];

export default function Report() {
  const navigate = useNavigate();
  const currentSession = useScanStore((s) => s.currentSession);
  const captures = useScanStore((s) => s.captures);
  const view = useScanStore((s) => s.view);
  const refreshHistory = useScanStore((s) => s.refreshHistory);
  const calibrationHeight = useScanStore((s) => s.calibrationHeight);

  const [history, setHistory] = useState<ScanSession[]>([]);

  // 生成或复用测量数据
  const session = useMemo<ScanSession | null>(() => {
    if (currentSession) return currentSession;
    if (captures.length > 0) {
      const measurements = computeMeasurements(
        captures,
        calibrationHeight || view.heightScale,
        view.bodyType
      );
      return {
        id: "current",
        captures,
        calibrationHeight: calibrationHeight || view.heightScale,
        measurements,
        createdAt: Date.now(),
      };
    }
    // 演示数据
    const demo = generateDemoCaptures();
    const measurements = computeMeasurements(demo, 175, "standard");
    return {
      id: "demo",
      captures: demo,
      calibrationHeight: 175,
      measurements,
      createdAt: Date.now(),
    };
  }, [currentSession, captures, calibrationHeight, view]);

  useEffect(() => {
    refreshHistory();
    setHistory(loadHistory());
  }, [refreshHistory]);

  const handleExportJson = () => {
    if (!session) return;
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: "0.1",
        device: navigator.userAgent,
      },
      session,
    };
    downloadJson(payload, `bodyscan_${session.id}.json`);
  };

  const handleExportPng = () => {
    // 从 Model 页的 canvas 截图（简化：直接生成一张报告图）
    const canvas = document.querySelector(
      "canvas"
    ) as HTMLCanvasElement | null;
    if (canvas) {
      try {
        const url = canvas.toDataURL("image/png");
        downloadDataUrl(url, `bodyscan_${session?.id ?? "export"}.png`);
        return;
      } catch {
        // 截图失败则忽略
      }
    }
    // 回退：生成简易数据图
    const dataUrl = generateReportImage(session);
    downloadDataUrl(dataUrl, `bodyscan_${session?.id ?? "report"}.png`);
  };

  const handleRescan = () => navigate("/scan");
  const handleViewModel = () => navigate("/model");

  const m = session?.measurements;
  const isDemo = session?.id === "demo";

  return (
    <div className="relative min-h-screen w-full bg-void pt-16 lg:pl-64 lg:pt-0">
      {/* 背景 */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(34,227,220,0.08), transparent 50%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-12">
        {/* 页头 */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-cyber/40 bg-cyber/5 shadow-cyber">
              <FileBarChart2 size={22} className="text-cyber" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-cyber/70">
                REPORT · 数据报告
              </div>
              <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-4xl">
                身体尺寸分析
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleViewModel} className="btn-ghost">
              <Box size={14} />
              查看模型
            </button>
            <button onClick={handleExportJson} className="btn-ghost">
              <FileJson size={14} />
              导出 JSON
            </button>
            <button onClick={handleExportPng} className="btn-ghost">
              <ImageIcon size={14} />
              导出 PNG
            </button>
            <button onClick={handleRescan} className="btn-cyber">
              <Camera size={14} />
              重新扫描
            </button>
          </div>
        </header>

        {/* 会话元信息 */}
        <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[11px]">
          {isDemo && (
            <span className="rounded border border-amber2/40 bg-amber2/10 px-2 py-1 uppercase tracking-widest text-amber2">
              DEMO DATA · 演示数据
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded border border-cyber/30 bg-abyss/60 px-2 py-1 text-ash">
            <Calendar size={11} className="text-cyber" />
            {session ? formatTime(session.createdAt) : "--"}
          </span>
          <span className="flex items-center gap-1.5 rounded border border-cyber/30 bg-abyss/60 px-2 py-1 text-ash">
            <Sparkles size={11} className="text-cyber" />
            KP: 33 × {session?.captures.length ?? 0} 视角
          </span>
          <span className="flex items-center gap-1.5 rounded border border-cyber/30 bg-abyss/60 px-2 py-1 text-ash">
            <Ruler size={11} className="text-cyber" />
            校准身高: {session?.calibrationHeight ?? 0} cm
          </span>
        </div>

        {/* 数据卡片网格 */}
        <section className="mb-10">
          <SectionLabel index="01" title="关键尺寸" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {METRICS.map((metric, i) => {
              const value = (m?.[metric.key as keyof BodyMeasurements] as number) ?? 0;
              const accentClass =
                metric.accent === "cyber"
                  ? "text-cyber"
                  : metric.accent === "neon"
                  ? "text-neon"
                  : "text-amber2";
              const borderClass =
                metric.accent === "cyber"
                  ? "border-cyber/30 hover:border-cyber/60 hover:shadow-cyber"
                  : metric.accent === "neon"
                  ? "border-neon/30 hover:border-neon/60 hover:shadow-neon"
                  : "border-amber2/30 hover:border-amber2/60";
              return (
                <div
                  key={metric.key}
                  className={cn(
                    "card-cyber group p-4 transition-all",
                    borderClass
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <metric.Icon size={16} className={accentClass} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-ash/60">
                      {metric.key.toString().toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "font-display text-3xl font-bold tabular-nums",
                        accentClass
                      )}
                    >
                      {value}
                    </span>
                    <span className="font-mono text-xs text-ash">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="mt-1 font-body text-xs text-ash">
                    {metric.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 体型分析 */}
        <section className="mb-10">
          <SectionLabel index="02" title="体型分析" />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
            {/* 左：体型示意图 */}
            <div className="card-cyber relative grid place-items-center p-6">
              <BodyShapeDiagram
                shape={m?.bodyShape ?? "未知"}
                shoulder={m?.shoulderWidth ?? 0}
                waist={m?.waist ?? 0}
                hip={m?.hip ?? 0}
              />
            </div>

            {/* 右：分析文本 */}
            <div className="card-cyber p-6">
              <div className="mb-4 flex items-center justify-between border-b border-cyber/10 pb-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-cyber/70">
                    BODY SHAPE · 体型分类
                  </div>
                  <div className="font-display text-2xl font-bold text-cyber text-glow-cyber">
                    {m?.bodyShape ?? "未知"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ash/70">
                    BMI
                  </div>
                  <div className="font-display text-2xl font-bold text-neon">
                    {m?.bmi?.toFixed(1) ?? "--"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <AnalysisRow
                  label="估算体重"
                  value={`${m?.weightEstimate ?? "--"} kg`}
                />
                <AnalysisRow
                  label="肩臀比"
                  value={
                    m?.shoulderWidth && m?.hip
                      ? (m.shoulderWidth / m.hip).toFixed(2)
                      : "--"
                  }
                />
                <AnalysisRow
                  label="腰臀比"
                  value={
                    m?.waist && m?.hip
                      ? (m.waist / m.hip).toFixed(2)
                      : "--"
                  }
                />
                <AnalysisRow
                  label="臂展身高比"
                  value={
                    m?.armSpan && m?.height
                      ? (m.armSpan / m.height).toFixed(2)
                      : "--"
                  }
                />
              </div>

              <div className="mt-5 rounded-md border border-cyber/15 bg-void/60 p-4">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyber">
                  <Info size={11} />
                  健康建议
                </div>
                <ul className="space-y-1.5 font-body text-xs leading-relaxed text-ash">
                  <BodyAdvice m={m} />
                </ul>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded border border-amber2/20 bg-amber2/5 p-3">
                <Info size={12} className="mt-0.5 flex-shrink-0 text-amber2" />
                <p className="font-mono text-[10px] leading-relaxed text-amber2/80">
                  数据基于单目摄像头姿态估算，仅供参考。围度数据为基于身高与体型系数的经验估算，与真实测量可能存在 ±5% 偏差。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 围度对比图 */}
        <section className="mb-10">
          <SectionLabel index="03" title="围度可视化" />
          <div className="mt-4 card-cyber p-6">
            <CircumferenceChart
              chest={m?.chest ?? 0}
              waist={m?.waist ?? 0}
              hip={m?.hip ?? 0}
            />
          </div>
        </section>

        {/* 历史记录 */}
        <section className="mb-10">
          <SectionLabel
            index="04"
            title="历史记录"
            subtitle={`最近 ${Math.min(history.length, 5)} 次扫描对比`}
          />
          <div className="mt-4">
            {history.length === 0 ? (
              <div className="card-cyber flex flex-col items-center justify-center gap-3 p-10 text-center">
                <History size={32} className="text-ash/40" />
                <div className="font-mono text-xs uppercase tracking-widest text-ash/60">
                  暂无历史记录
                </div>
                <p className="max-w-xs font-body text-xs text-ash/50">
                  完成一次扫描后，历史记录将自动保存于此（最多 5 条，本地存储）。
                </p>
              </div>
            ) : (
              <div className="card-cyber overflow-hidden">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-cyber/15 text-cyber/80">
                      <th className="px-4 py-3 text-left uppercase tracking-widest">
                        时间
                      </th>
                      <th className="px-4 py-3 text-right uppercase tracking-widest">
                        身高
                      </th>
                      <th className="px-4 py-3 text-right uppercase tracking-widest">
                        肩宽
                      </th>
                      <th className="px-4 py-3 text-right uppercase tracking-widest">
                        胸围
                      </th>
                      <th className="px-4 py-3 text-right uppercase tracking-widest">
                        腰围
                      </th>
                      <th className="px-4 py-3 text-right uppercase tracking-widest">
                        臀围
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-widest">
                        体型
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((h, i) => (
                      <tr
                        key={h.id}
                        className={cn(
                          "border-b border-cyber/5 transition-colors hover:bg-cyber/5",
                          i === 0 && "bg-cyber/5"
                        )}
                      >
                        <td className="px-4 py-3 text-ash">
                          <span className="text-cyber">
                            {i === 0 && "● "}
                          </span>
                          {formatTime(h.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-white">
                          {h.measurements.height}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ash">
                          {h.measurements.shoulderWidth}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ash">
                          {h.measurements.chest}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ash">
                          {h.measurements.waist}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ash">
                          {h.measurements.hip}
                        </td>
                        <td className="px-4 py-3 text-cyber">
                          {h.measurements.bodyShape}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="flex flex-col items-center justify-center gap-4 rounded-xl border border-cyber/20 bg-abyss/40 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              开始一次新的扫描
            </h3>
            <p className="mt-1 font-body text-sm text-ash">
              重新采集，获取更精准的人体数据
            </p>
          </div>
          <button onClick={handleRescan} className="btn-cyber group">
            <Camera size={16} />
            启动扫描仪
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </section>
      </main>
    </div>
  );
}

function SectionLabel({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-cyber/70">{index}</span>
        <span className="h-4 w-px bg-cyber/40" />
        <h2 className="font-display text-xl font-bold tracking-wide text-white">
          {title}
        </h2>
      </div>
      {subtitle && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-ash/60">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-cyber/10 bg-void/40 px-3 py-2">
      <span className="text-ash">{label}</span>
      <span className="text-cyber">{value}</span>
    </div>
  );
}

function BodyAdvice({ m }: { m?: BodyMeasurements }) {
  if (!m) {
    return <li className="text-ash/60">暂无数据</li>;
  }
  const advice: string[] = [];
  const bmi = m.bmi ?? 0;
  if (bmi > 0) {
    if (bmi < 18.5)
      advice.push("BMI 偏低，建议增加营养摄入并配合力量训练。");
    else if (bmi < 24)
      advice.push("BMI 处于健康范围，保持当前生活方式与运动频率。");
    else if (bmi < 28)
      advice.push("BMI 偏高，建议增加有氧运动并控制热量摄入。");
    else advice.push("BMI 偏高，建议咨询专业人士制定减脂计划。");
  }
  if (m.waist && m.hip) {
    const whr = m.waist / m.hip;
    if (whr > 0.9)
      advice.push("腰臀比偏高，建议加强核心训练以改善脂肪分布。");
  }
  if (m.shoulderWidth && m.leftArm && m.rightArm) {
    const diff = Math.abs(m.leftArm - m.rightArm);
    if (diff > 2)
      advice.push(
        `左右臂长差异 ${diff.toFixed(1)}cm，注意对称性训练。`
      );
  }
  advice.push("建议每 4-8 周复测一次，追踪体型变化趋势。");

  return (
    <>
      {advice.map((a, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-cyber" />
          <span>{a}</span>
        </li>
      ))}
    </>
  );
}

/** 体型示意图（SVG） */
function BodyShapeDiagram({
  shape,
  shoulder,
  waist,
  hip,
}: {
  shape: string;
  shoulder: number;
  waist: number;
  hip: number;
}) {
  // 归一化到 SVG 坐标
  const max = Math.max(shoulder, waist, hip, 1);
  const sW = (shoulder / max) * 80 + 20;
  const wW = (waist / max) * 80 + 20;
  const hW = (hip / max) * 80 + 20;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 280" className="h-64 w-48">
        {/* 头 */}
        <circle cx="100" cy="30" r="18" stroke="#22E3DC" strokeWidth="1.5" fill="none" />
        {/* 颈 */}
        <line x1="100" y1="48" x2="100" y2="60" stroke="#22E3DC" strokeWidth="1.5" />
        {/* 肩部线 */}
        <line
          x1={100 - sW / 2}
          y1="60"
          x2={100 + sW / 2}
          y2="60"
          stroke="#22E3DC"
          strokeWidth="2"
        />
        {/* 躯干轮廓（沙漏/矩形/倒三角） */}
        <path
          d={`M ${100 - sW / 2} 60
              Q ${100 - sW / 2 - 4} 90 ${100 - wW / 2} 110
              Q ${100 - wW / 2} 130 ${100 - hW / 2} 150
              L ${100 + hW / 2} 150
              Q ${100 + wW / 2} 130 ${100 + wW / 2} 110
              Q ${100 + sW / 2 + 4} 90 ${100 + sW / 2} 60 Z`}
          stroke="#22E3DC"
          strokeWidth="1.5"
          fill="rgba(34,227,220,0.08)"
        />
        {/* 腿 */}
        <line x1={100 - hW / 4} y1="150" x2={100 - hW / 4} y2="250" stroke="#FF2E88" strokeWidth="1.5" />
        <line x1={100 + hW / 4} y1="150" x2={100 + hW / 4} y2="250" stroke="#FF2E88" strokeWidth="1.5" />
        {/* 标注线 */}
        <line x1={100 + sW / 2 + 5} y1="60" x2={180} y2="60" stroke="#22E3DC" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="184" y="63" fill="#22E3DC" fontSize="8" fontFamily="monospace">
          {shoulder}
        </text>
        <line x1={100 + wW / 2 + 5} y1="110" x2={180} y2="110" stroke="#22E3DC" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="184" y="113" fill="#22E3DC" fontSize="8" fontFamily="monospace">
          {waist}
        </text>
        <line x1={100 + hW / 2 + 5} y1="150" x2={180} y2="150" stroke="#22E3DC" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="184" y="153" fill="#22E3DC" fontSize="8" fontFamily="monospace">
          {hip}
        </text>
      </svg>
      <div className="mt-2 font-display text-lg font-bold text-cyber text-glow-cyber">
        {shape}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ash/60">
        BODY SHAPE
      </div>
    </div>
  );
}

/** 围度条形对比图 */
function CircumferenceChart({
  chest,
  waist,
  hip,
}: {
  chest: number;
  waist: number;
  hip: number;
}) {
  const max = Math.max(chest, waist, hip, 1);
  const bars = [
    { label: "胸围", value: chest, color: "#22E3DC" },
    { label: "腰围", value: waist, color: "#FF2E88" },
    { label: "臀围", value: hip, color: "#FFB547" },
  ];
  return (
    <div className="space-y-5">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-ash">
              {b.label}
            </span>
            <span
              className="font-display text-lg font-bold tabular-nums"
              style={{ color: b.color }}
            >
              {b.value}
              <span className="ml-1 text-xs text-ash">cm</span>
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-abyss">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(b.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${b.color}, ${b.color}66)`,
                boxShadow: `0 0 12px ${b.color}80`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="mt-4 flex items-center justify-between border-t border-cyber/10 pt-3 font-mono text-[10px] text-ash/60">
        <span className="flex items-center gap-1.5">
          <TrendingUp size={11} className="text-cyber" />
          基于身高与体型系数估算
        </span>
        <span>EXP MODEL · v0.1</span>
      </div>
    </div>
  );
}

/** 生成简易报告图（PNG 回退方案） */
function generateReportImage(session: ScanSession | null): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx || !session) return "";

  // 背景
  ctx.fillStyle = "#070A12";
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = "#22E3DC";
  ctx.font = "bold 32px monospace";
  ctx.fillText("BodyScan 3D · Report", 40, 60);

  ctx.fillStyle = "#8A95B0";
  ctx.font = "14px monospace";
  ctx.fillText(`Session: ${session.id}`, 40, 90);
  ctx.fillText(`Time: ${formatTime(session.createdAt)}`, 40, 110);

  const m = session.measurements;
  const rows = [
    `Height:        ${m.height} cm`,
    `Shoulder:      ${m.shoulderWidth} cm`,
    `Arm Span:      ${m.armSpan} cm`,
    `Chest (est):   ${m.chest} cm`,
    `Waist (est):   ${m.waist} cm`,
    `Hip (est):     ${m.hip} cm`,
    `Body Shape:    ${m.bodyShape}`,
    `BMI:           ${m.bmi ?? "--"}`,
  ];
  ctx.fillStyle = "#E8EDF7";
  ctx.font = "16px monospace";
  rows.forEach((r, i) => ctx.fillText(r, 40, 170 + i * 28));

  return canvas.toDataURL("image/png");
}

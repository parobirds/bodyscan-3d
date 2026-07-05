import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Box,
  BrainCircuit,
  Camera,
  Cpu,
  Eye,
  FileBarChart2,
  Layers,
  Lock,
  ScanLine,
  Shirt,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";

const WORKFLOW = [
  {
    index: "01",
    title: "授权摄像头",
    desc: "点击启动，浏览器原生 API 获取视频流",
    Icon: Camera,
  },
  {
    index: "02",
    title: "多角度采集",
    desc: "正/侧/背三视角，AI 实时检测 33 个关键点",
    Icon: ScanLine,
  },
  {
    index: "03",
    title: "三维建模",
    desc: "关键点驱动几何体拼接，即时生成 3D 人体",
    Icon: Box,
  },
  {
    index: "04",
    title: "数据报告",
    desc: "身高、围度、体型分析，可导出 JSON/PNG",
    Icon: FileBarChart2,
  },
];

const FEATURES = [
  {
    title: "AI 姿态识别",
    desc: "基于 MediaPipe Pose Landmarker，33 个关键点实时推理，WASM + GPU 加速，纯前端 0 上传。",
    Icon: BrainCircuit,
    accent: "cyber",
  },
  {
    title: "浏览器原生渲染",
    desc: "Three.js + React Three Fiber 构建 3D 场景，OrbitControls 任意视角查看，无需安装插件。",
    Icon: Cpu,
    accent: "neon",
  },
  {
    title: "隐私本地化",
    desc: "所有摄像头帧仅在本机推理，模型与数据不离开浏览器，历史记录存于 localStorage。",
    Icon: Lock,
    accent: "amber2",
  },
];

const SCENARIOS = [
  {
    title: "健身追踪",
    desc: "周期性扫描对比体型变化，量化训练成果",
    Icon: TrendingUp,
  },
  {
    title: "服装定制",
    desc: "远程采集尺寸，量身定制无需上门量体",
    Icon: Shirt,
  },
  {
    title: "康复理疗",
    desc: "记录体态与对称性，辅助康复进度评估",
    Icon: Activity,
  },
  {
    title: "3D 创作",
    desc: "快速生成人体参考模型，导入创作流程",
    Icon: Sparkles,
  },
];

const STATS = [
  { value: "33", label: "关键点", unit: "KP" },
  { value: "3", label: "采集视角", unit: "VIEW" },
  { value: "30s", label: "建模时长", unit: "FAST" },
  { value: "0", label: "数据上传", unit: "PRIVACY" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void pt-16 lg:pl-64 lg:pt-0">
      {/* 背景层 */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-30" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(34,227,220,0.12), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(255,46,136,0.08), transparent 55%)",
        }}
      />
      {/* 装饰扫描线 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber/60 to-transparent" />

      <main className="relative z-10">
        {/* HERO 区 */}
        <section className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 py-20 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            {/* 左：文案 */}
            <div className="animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyber/30 bg-cyber/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyber">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber" />
                BODYSCAN · 3D HUMAN MODELING
              </div>

              <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                <span className="block text-glow-cyber">摄像头</span>
                <span className="block bg-gradient-to-r from-cyber via-cyber to-neon bg-clip-text text-transparent">
                  三维人体
                </span>
                <span className="block text-white">建模系统</span>
              </h1>

              <p className="mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-ash sm:text-lg">
                打开摄像头，AI 实时识别 33 个人体关键点，
                <span className="text-cyber">30 秒内</span>
                完成正/侧/背三视角采集，自动构建可交互的三维人体模型并估算身体尺寸。
                全程本地推理，隐私不上云。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/scan" className="btn-cyber group">
                  <Camera size={16} />
                  启动扫描仪
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link to="/model?demo=1" className="btn-ghost">
                  <Eye size={14} />
                  查看演示模型
                </Link>
              </div>

              {/* 数据统计 */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="card-cyber p-3 transition-all hover:border-cyber/40 hover:shadow-cyber"
                  >
                    <div className="font-display text-2xl font-bold text-cyber text-glow-cyber">
                      {s.value}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-ash">
                      {s.label}
                    </div>
                    <div className="font-mono text-[8px] uppercase text-ash/50">
                      {s.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右：3D 装饰元素 */}
            <div className="relative hidden h-[520px] items-center justify-center lg:flex">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* 工作流程 */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <SectionHeader
            index="01"
            title="工作流程"
            subtitle="从摄像头到三维模型，四步完成"
          />
          <div className="relative mt-12">
            {/* 连线 */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-cyber/40 via-cyber/20 to-transparent lg:block" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {WORKFLOW.map((step, i) => (
                <div
                  key={step.index}
                  className="relative animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-cyber/40 bg-abyss shadow-cyber">
                    <step.Icon size={24} className="text-cyber" />
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-cyber font-mono text-[10px] font-bold text-void">
                      {step.index}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold tracking-wide text-white">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-ash">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 技术亮点 */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <SectionHeader
            index="02"
            title="技术亮点"
            subtitle="前沿 Web 技术，浏览器内完成全部计算"
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => {
              const accentColor =
                f.accent === "cyber"
                  ? "text-cyber border-cyber/40"
                  : f.accent === "neon"
                  ? "text-neon border-neon/40"
                  : "text-amber2 border-amber2/40";
              const glowColor =
                f.accent === "cyber"
                  ? "hover:shadow-cyber"
                  : f.accent === "neon"
                  ? "hover:shadow-neon"
                  : "";
              return (
                <div
                  key={f.title}
                  className={`card-cyber group p-6 transition-all hover:-translate-y-1 ${glowColor}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-md border bg-void/60 ${accentColor}`}
                  >
                    <f.Icon size={22} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold tracking-wide text-white">
                    {f.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-ash">
                    {f.desc}
                  </p>
                  <div className="mt-4 h-px w-full bg-gradient-to-r from-cyber/30 to-transparent" />
                  <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ash/60">
                    <Layers size={11} />
                    {f.accent === "cyber"
                      ? "MediaPipe Tasks Vision"
                      : f.accent === "neon"
                      ? "Three.js · R3F"
                      : "localStorage · 零上传"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 应用场景 */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <SectionHeader
            index="03"
            title="应用场景"
            subtitle="一个工具，多重用途"
          />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCENARIOS.map((s, i) => (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-lg border border-cyber/15 bg-abyss/50 p-5 transition-all hover:border-cyber/40"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="pointer-events-none absolute -right-4 -top-4 opacity-10 transition-opacity group-hover:opacity-30">
                  <s.Icon size={64} className="text-cyber" />
                </div>
                <s.Icon size={20} className="mb-3 text-cyber" />
                <h3 className="mb-1 font-display text-base font-bold tracking-wide text-white">
                  {s.title}
                </h3>
                <p className="font-body text-xs leading-relaxed text-ash">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <div className="relative overflow-hidden rounded-xl border border-cyber/30 bg-gradient-to-br from-abyss to-void p-10 text-center lg:p-16">
            <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-30" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-cyber/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-neon/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber/30 bg-void/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyber">
                <Timer size={11} />
                READY TO SCAN
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
                <span className="text-glow-cyber">即刻</span> 开始你的
                <span className="bg-gradient-to-r from-cyber to-neon bg-clip-text text-transparent">
                  {" "}
                  三维建模
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-body text-base text-ash">
                无需注册、无需安装、无需上传。打开网页，授权摄像头，30 秒获取你的人体三维模型。
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/scan" className="btn-cyber group">
                  <Camera size={16} />
                  启动扫描仪
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link to="/report" className="btn-ghost">
                  <FileBarChart2 size={14} />
                  查看示例报告
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="border-t border-cyber/10 px-6 py-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-display text-xs tracking-widest text-cyber">
              <Activity size={14} />
              BODYSCAN<span className="text-ash">/3D</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ash/60">
              React · Three.js · MediaPipe · 隐私本地化
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-l-2 border-cyber/40 pl-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-cyber/70">{index}</span>
        <span className="h-px w-8 bg-cyber/40" />
      </div>
      <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-4xl">
        {title}
      </h2>
      <p className="font-body text-sm text-ash">{subtitle}</p>
    </div>
  );
}

/** Hero 区右侧装饰：纯 CSS 人体轮廓 + 扫描动画 */
function HeroVisual() {
  return (
    <div className="relative h-full w-full">
      {/* 外圈装饰 */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[440px] w-[440px] animate-spin-slow rounded-full border border-dashed border-cyber/30">
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber shadow-cyber" />
          <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-neon" />
        </div>
      </div>

      {/* 中圈 */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[340px] w-[340px] rounded-full border border-cyber/20" />
      </div>

      {/* 人体轮廓 SVG */}
      <div className="absolute inset-0 grid place-items-center">
        <svg
          viewBox="0 0 200 400"
          className="h-[400px] w-[200px] drop-shadow-[0_0_24px_rgba(34,227,220,0.4)]"
          fill="none"
        >
          {/* 头 */}
          <circle cx="100" cy="40" r="22" stroke="#22E3DC" strokeWidth="1.5" />
          {/* 颈 */}
          <line x1="100" y1="62" x2="100" y2="80" stroke="#22E3DC" strokeWidth="1.5" />
          {/* 肩 */}
          <line x1="60" y1="85" x2="140" y2="85" stroke="#22E3DC" strokeWidth="1.5" />
          {/* 躯干 */}
          <path
            d="M60 85 L70 200 L130 200 L140 85"
            stroke="#22E3DC"
            strokeWidth="1.5"
          />
          {/* 手臂 */}
          <line x1="60" y1="85" x2="40" y2="180" stroke="#22E3DC" strokeWidth="1.5" />
          <line x1="40" y1="180" x2="50" y2="260" stroke="#22E3DC" strokeWidth="1.5" />
          <line x1="140" y1="85" x2="160" y2="180" stroke="#22E3DC" strokeWidth="1.5" />
          <line x1="160" y1="180" x2="150" y2="260" stroke="#22E3DC" strokeWidth="1.5" />
          {/* 腿 */}
          <line x1="70" y1="200" x2="75" y2="320" stroke="#FF2E88" strokeWidth="1.5" />
          <line x1="75" y1="320" x2="80" y2="380" stroke="#FF2E88" strokeWidth="1.5" />
          <line x1="130" y1="200" x2="125" y2="320" stroke="#FF2E88" strokeWidth="1.5" />
          <line x1="125" y1="320" x2="120" y2="380" stroke="#FF2E88" strokeWidth="1.5" />

          {/* 关键点 */}
          {[
            [100, 40],
            [60, 85],
            [140, 85],
            [40, 180],
            [160, 180],
            [50, 260],
            [150, 260],
            [70, 200],
            [130, 200],
            [75, 320],
            [125, 320],
            [80, 380],
            [120, 380],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="3"
              fill="#22E3DC"
              className="animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </svg>
      </div>

      {/* 扫描线 */}
      <div className="absolute inset-x-12 top-12 bottom-12 overflow-hidden rounded-full">
        <div className="absolute inset-x-0 h-24 animate-scan-down bg-scan-sweep" />
      </div>

      {/* HUD 数据角标 */}
      <div className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-widest text-cyber/60">
        <div>KP: 33/33</div>
        <div>CONF: 0.97</div>
      </div>
      <div className="absolute right-2 top-2 text-right font-mono text-[9px] uppercase tracking-widest text-cyber/60">
        <div>SCAN: ACTIVE</div>
        <div>FPS: 60</div>
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-widest text-neon/70">
        <div>HUMANOID.v1</div>
      </div>
      <div className="absolute bottom-2 right-2 text-right font-mono text-[9px] uppercase tracking-widest text-amber2/70">
        <div>RENDER: WEBGL2</div>
      </div>
    </div>
  );
}

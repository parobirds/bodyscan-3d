import { NavLink, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  ScanLine,
  Box,
  FileBarChart2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  index: string;
  Icon: typeof HomeIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "首页", index: "01", Icon: HomeIcon },
  { to: "/scan", label: "扫描采集", index: "02", Icon: ScanLine },
  { to: "/model", label: "三维建模", index: "03", Icon: Box },
  { to: "/report", label: "数据报告", index: "04", Icon: FileBarChart2 },
];

export default function Navigation() {
  const location = useLocation();
  const isScanPage = location.pathname === "/scan";

  // 扫描页采用沉浸式布局，导航变更为底部最小化
  if (isScanPage) {
    return (
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="pointer-events-auto flex items-center gap-2 font-display text-sm tracking-widest text-cyber"
        >
          <Activity size={18} className="text-cyber" />
          BODYSCAN<span className="text-ash">/3D</span>
        </NavLink>
        <NavLink to="/" className="btn-ghost pointer-events-auto">
          退出扫描
        </NavLink>
      </nav>
    );
  }

  return (
    <>
      {/* 桌面左侧导航 */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-cyber/15 bg-abyss/80 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-3 border-b border-cyber/10 px-6 py-6">
          <div className="relative grid h-10 w-10 place-items-center rounded-md border border-cyber/40 bg-cyber/5">
            <Activity size={20} className="text-cyber" />
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse-glow rounded-full bg-cyber" />
          </div>
          <div>
            <div className="font-display text-base font-bold tracking-widest text-white">
              BODYSCAN
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyber/70">
              3D · v0.1
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-md px-4 py-3 font-mono text-sm transition-all",
                  isActive
                    ? "bg-cyber/10 text-cyber"
                    : "text-ash hover:bg-cyber/5 hover:text-cyber"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-cyber transition-opacity",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <item.Icon size={18} />
                  <span className="flex-1 tracking-wider">{item.label}</span>
                  <span className="text-[10px] text-ash/50">{item.index}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-cyber/10 px-6 py-4">
          <div className="font-mono text-[10px] leading-relaxed text-ash/60">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber" />
              SYSTEM ONLINE
            </div>
            <div>本地推理 · 隐私保护</div>
            <div>MediaPipe Pose · 33 KP</div>
          </div>
        </div>
      </aside>

      {/* 移动端顶部导航 */}
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-cyber/15 bg-abyss/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-display text-sm tracking-widest text-cyber"
        >
          <Activity size={16} />
          BODYSCAN<span className="text-ash">/3D</span>
        </NavLink>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "grid h-9 w-9 place-items-center rounded-md transition-colors",
                  isActive
                    ? "bg-cyber/15 text-cyber"
                    : "text-ash hover:text-cyber"
                )
              }
              title={item.label}
            >
              <item.Icon size={16} />
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

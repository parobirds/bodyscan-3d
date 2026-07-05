import type { ScanSession } from "@/types/scan";

const HISTORY_KEY = "bodyscan_history";
const CALIBRATION_KEY = "bodyscan_calibration";
const MAX_HISTORY = 5;

/** 读取历史扫描记录 */
export function loadHistory(): ScanSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 追加一条历史记录，超出则截断 */
export function appendHistory(session: ScanSession): ScanSession[] {
  const history = loadHistory();
  const next = [session, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // 忽略写入失败（如配额超限）
  }
  return next;
}

/** 清空历史 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/** 读取校准身高 */
export function loadCalibration(): number {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { height: number };
    return parsed.height || 0;
  } catch {
    return 0;
  }
}

/** 写入校准身高 */
export function saveCalibration(height: number): void {
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify({ height }));
  } catch {
    // 忽略
  }
}

/** 生成会话 ID */
export function generateSessionId(): string {
  return `scan_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** 下载 JSON */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

/** 下载 PNG（来自 dataURL） */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  triggerDownload(dataUrl, filename);
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** 格式化时间戳为本地字符串 */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

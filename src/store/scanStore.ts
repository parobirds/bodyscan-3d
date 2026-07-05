import { create } from "zustand";
import type {
  BodyMeasurements,
  BodyTypePreset,
  CaptureFrame,
  ModelViewSettings,
  ScanSession,
} from "@/types/scan";
import {
  appendHistory,
  generateSessionId,
  loadCalibration,
  loadHistory,
} from "@/utils/storage";
import { computeMeasurements } from "@/utils/measurements";

interface ScanState {
  // 采集数据
  captures: CaptureFrame[];
  calibrationHeight: number;
  currentSession: ScanSession | null;
  history: ScanSession[];

  // 模型视图设置
  view: ModelViewSettings;

  // 操作
  addCapture: (frame: CaptureFrame) => void;
  resetCaptures: () => void;
  setCalibrationHeight: (h: number) => void;
  finalizeSession: () => ScanSession | null;
  refreshHistory: () => ScanSession[];
  setView: (partial: Partial<ModelViewSettings>) => void;
  setBodyType: (t: BodyTypePreset) => void;
}

const defaultView: ModelViewSettings = {
  autoRotate: true,
  wireframe: false,
  showKeypoints: false,
  showLabels: true,
  bodyType: "standard",
  heightScale: loadCalibration() || 170,
};

export const useScanStore = create<ScanState>((set, get) => ({
  captures: [],
  calibrationHeight: loadCalibration(),
  currentSession: null,
  history: loadHistory(),
  view: defaultView,

  addCapture: (frame) => {
    const existing = get().captures;
    const filtered = existing.filter((c) => c.angle !== frame.angle);
    set({ captures: [...filtered, frame] });
  },

  resetCaptures: () => set({ captures: [], currentSession: null }),

  setCalibrationHeight: (h) => {
    set({ calibrationHeight: h });
    set((s) => ({
      view: { ...s.view, heightScale: h || s.view.heightScale },
    }));
  },

  finalizeSession: () => {
    const { captures, calibrationHeight, view } = get();
    if (!captures.length) return null;

    const measurements: BodyMeasurements = computeMeasurements(
      captures,
      calibrationHeight || view.heightScale,
      view.bodyType
    );

    const session: ScanSession = {
      id: generateSessionId(),
      captures,
      calibrationHeight: calibrationHeight || view.heightScale,
      measurements,
      createdAt: Date.now(),
    };

    const history = appendHistory(session);
    set({ currentSession: session, history });
    return session;
  },

  refreshHistory: () => {
    const history = loadHistory();
    set({ history });
    return history;
  },

  setView: (partial) =>
    set((s) => ({ view: { ...s.view, ...partial } })),

  setBodyType: (t) =>
    set((s) => ({ view: { ...s.view, bodyType: t } })),
}));

import { fabric } from 'fabric';
import { create } from 'zustand';
import type {
  AIGenerationJobStatus,
  CanvasSnapshot,
  SockColorKey,
  TextControlsState,
} from '../types/designer';

type DesignerState = {
  canvas: fabric.Canvas | null;
  selectedColor: SockColorKey;
  activeObject: fabric.Object | null;
  textControls: TextControlsState;
  history: CanvasSnapshot[];
  historyStep: number;
  isRestoringHistory: boolean;
  isExporting: boolean;
  exportError: string | null;
  aiJobId: string | null;
  aiStatus: AIGenerationJobStatus | null;
  aiStatusMessage: string | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setSelectedColor: (color: SockColorKey) => void;
  setActiveObject: (object: fabric.Object | null) => void;
  setTextControls: (patch: Partial<TextControlsState>) => void;
  resetTextControls: () => void;
  setHistory: (history: CanvasSnapshot[], step: number) => void;
  setIsRestoringHistory: (value: boolean) => void;
  setIsExporting: (value: boolean) => void;
  setExportError: (message: string | null) => void;
  setAIGenerationState: (
    patch: Partial<{
      aiJobId: string | null;
      aiStatus: AIGenerationJobStatus | null;
      aiStatusMessage: string | null;
    }>,
  ) => void;
};

const defaultTextControls: TextControlsState = {
  text: '',
  fontFamily: 'Arial',
  fontSize: 36,
  textAlign: 'center',
  fill: '#000000',
  bold: false,
  italic: false,
  underline: false,
};

export const useDesignerStore = create<DesignerState>((set) => ({
  canvas: null,
  selectedColor: 'white',
  activeObject: null,
  textControls: defaultTextControls,
  history: [],
  historyStep: -1,
  isRestoringHistory: false,
  isExporting: false,
  exportError: null,
  aiJobId: null,
  aiStatus: null,
  aiStatusMessage: null,
  setCanvas: (canvas) => set({ canvas }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setActiveObject: (activeObject) => set({ activeObject }),
  setTextControls: (patch) =>
    set((state) => ({ textControls: { ...state.textControls, ...patch } })),
  resetTextControls: () => set({ textControls: defaultTextControls }),
  setHistory: (history, historyStep) => set({ history, historyStep }),
  setIsRestoringHistory: (isRestoringHistory) => set({ isRestoringHistory }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportError: (exportError) => set({ exportError }),
  setAIGenerationState: (patch) =>
    set((state) => ({
      aiJobId: patch.aiJobId === undefined ? state.aiJobId : patch.aiJobId,
      aiStatus: patch.aiStatus === undefined ? state.aiStatus : patch.aiStatus,
      aiStatusMessage:
        patch.aiStatusMessage === undefined
          ? state.aiStatusMessage
          : patch.aiStatusMessage,
    })),
}));

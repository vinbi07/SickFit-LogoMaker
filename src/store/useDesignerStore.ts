import { fabric } from 'fabric';
import { create } from 'zustand';
import type { CanvasSnapshot, SockColorKey, TextControlsState } from '../types/designer';

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
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setSelectedColor: (color: SockColorKey) => void;
  setActiveObject: (object: fabric.Object | null) => void;
  setTextControls: (patch: Partial<TextControlsState>) => void;
  resetTextControls: () => void;
  setHistory: (history: CanvasSnapshot[], step: number) => void;
  setIsRestoringHistory: (value: boolean) => void;
  setIsExporting: (value: boolean) => void;
  setExportError: (message: string | null) => void;
};

const defaultTextControls: TextControlsState = {
  text: '',
  fontFamily: 'Arial',
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
}));

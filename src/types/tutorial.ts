export type TutorialStepId =
  | "welcome-toolbar"
  | "tools-panel"
  | "canvas-stage"
  | "layers-panel"
  | "settings-panel"
  | "export-action"
  | "advanced-text-tip";

export type TutorialStep = {
  id: TutorialStepId;
  title: string;
  description: string;
  targetSelector: string;
  placement?: "top" | "right" | "bottom" | "left";
  spotlightOffsetX?: number;
  spotlightOffsetY?: number;
  spotlightPadding?: number;
  offsetX?: number;
  offsetY?: number;
  actionHint?: string;
  requiresTargetClick?: boolean;
};

export type TutorialPersistedState = {
  hasAnsweredFirstVisit: boolean;
  completed: boolean;
  currentStepIndex: number;
  completedStepIds: TutorialStepId[];
};

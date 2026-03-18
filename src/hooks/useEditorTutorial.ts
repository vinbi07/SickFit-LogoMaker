import { useCallback, useEffect, useMemo, useState } from "react";
import type { TutorialPersistedState, TutorialStepId } from "../types/tutorial";

const STORAGE_KEY = "sf-editor-tutorial-v1";

const DEFAULT_STATE: TutorialPersistedState = {
  hasAnsweredFirstVisit: false,
  completed: false,
  currentStepIndex: 0,
  completedStepIds: [],
};

function readPersistedState(): TutorialPersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<TutorialPersistedState>;
    return {
      hasAnsweredFirstVisit: Boolean(parsed.hasAnsweredFirstVisit),
      completed: Boolean(parsed.completed),
      currentStepIndex:
        typeof parsed.currentStepIndex === "number" && parsed.currentStepIndex >= 0
          ? parsed.currentStepIndex
          : 0,
      completedStepIds: Array.isArray(parsed.completedStepIds)
        ? (parsed.completedStepIds.filter((value): value is TutorialStepId =>
            typeof value === "string",
          ) as TutorialStepId[])
        : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writePersistedState(value: TutorialPersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage errors in private modes or full quotas.
  }
}

type UseEditorTutorialOptions = {
  stepCount: number;
  allowAutostart: boolean;
};

type UseEditorTutorialResult = {
  isPromptOpen: boolean;
  isTutorialOpen: boolean;
  hasCompletedTutorial: boolean;
  currentStepIndex: number;
  completedStepIds: TutorialStepId[];
  showFirstVisitPrompt: () => void;
  startTutorial: () => void;
  skipFirstVisitPrompt: () => void;
  closeTutorial: () => void;
  completeCurrentStep: (stepId: TutorialStepId) => void;
  goNext: () => void;
  goBack: () => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
};

export function useEditorTutorial({
  stepCount,
  allowAutostart,
}: UseEditorTutorialOptions): UseEditorTutorialResult {
  const [persisted, setPersisted] = useState<TutorialPersistedState>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_STATE;
    }

    return readPersistedState();
  });
  const [shouldSuppressPrompt, setShouldSuppressPrompt] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const isPromptOpen =
    allowAutostart &&
    !persisted.hasAnsweredFirstVisit &&
    !persisted.completed &&
    !isTutorialOpen &&
    !shouldSuppressPrompt;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writePersistedState(persisted);
  }, [persisted]);

  const updatePersisted = useCallback(
    (updater: (prev: TutorialPersistedState) => TutorialPersistedState) => {
      setPersisted((prev) => {
        const next = updater(prev);
        if (next.currentStepIndex >= stepCount) {
          return { ...next, currentStepIndex: Math.max(stepCount - 1, 0) };
        }

        return next;
      });
    },
    [stepCount],
  );

  const showFirstVisitPrompt = useCallback(() => {
    setShouldSuppressPrompt(false);
  }, []);

  const startTutorial = useCallback(() => {
    setShouldSuppressPrompt(true);
    setIsTutorialOpen(true);
    updatePersisted((prev) => ({
      ...prev,
      hasAnsweredFirstVisit: true,
      currentStepIndex: Math.min(prev.currentStepIndex, Math.max(stepCount - 1, 0)),
    }));
  }, [stepCount, updatePersisted]);

  const skipFirstVisitPrompt = useCallback(() => {
    setShouldSuppressPrompt(true);
    updatePersisted((prev) => ({ ...prev, hasAnsweredFirstVisit: true }));
  }, [updatePersisted]);

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
  }, []);

  const completeCurrentStep = useCallback(
    (stepId: TutorialStepId) => {
      updatePersisted((prev) => {
        if (prev.completedStepIds.includes(stepId)) {
          return prev;
        }
        return { ...prev, completedStepIds: [...prev.completedStepIds, stepId] };
      });
    },
    [updatePersisted],
  );

  const goNext = useCallback(() => {
    updatePersisted((prev) => {
      const lastIndex = Math.max(stepCount - 1, 0);
      if (prev.currentStepIndex >= lastIndex) {
        return {
          ...prev,
          completed: true,
          hasAnsweredFirstVisit: true,
          currentStepIndex: lastIndex,
        };
      }

      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      };
    });
  }, [stepCount, updatePersisted]);

  const goBack = useCallback(() => {
    updatePersisted((prev) => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
    }));
  }, [updatePersisted]);

  const skipTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    updatePersisted((prev) => ({ ...prev, hasAnsweredFirstVisit: true }));
  }, [updatePersisted]);

  const replayTutorial = useCallback(() => {
    setShouldSuppressPrompt(true);
    setIsTutorialOpen(true);
    setPersisted((prev) => ({
      ...prev,
      hasAnsweredFirstVisit: true,
      completed: false,
      currentStepIndex: 0,
      completedStepIds: [],
    }));
  }, []);

  const result = useMemo<UseEditorTutorialResult>(
    () => ({
      isPromptOpen,
      isTutorialOpen,
      hasCompletedTutorial: persisted.completed,
      currentStepIndex: persisted.currentStepIndex,
      completedStepIds: persisted.completedStepIds,
      showFirstVisitPrompt,
      startTutorial,
      skipFirstVisitPrompt,
      closeTutorial,
      completeCurrentStep,
      goNext,
      goBack,
      skipTutorial,
      replayTutorial,
    }),
    [
      closeTutorial,
      completeCurrentStep,
      goBack,
      goNext,
      isPromptOpen,
      isTutorialOpen,
      persisted.completed,
      persisted.completedStepIds,
      persisted.currentStepIndex,
      replayTutorial,
      showFirstVisitPrompt,
      skipFirstVisitPrompt,
      skipTutorial,
      startTutorial,
    ],
  );

  return result;
}

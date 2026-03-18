import { useEffect, useMemo, useState } from "react";
import type { TutorialStep } from "../../types/tutorial";
import styles from "../../styles/TutorialOverlay.module.css";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TutorialOverlayProps = {
  step: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  nextDisabled: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
};

const DEFAULT_SPOTLIGHT_PADDING = 10;

function readTargetRect(
  selector: string,
  spotlightOffsetX = 0,
  spotlightOffsetY = 0,
  spotlightPadding = DEFAULT_SPOTLIGHT_PADDING,
): Rect | null {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const bounds = element.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  return {
    top: bounds.top - spotlightPadding + spotlightOffsetY,
    left: bounds.left - spotlightPadding + spotlightOffsetX,
    width: Math.max(2, bounds.width + spotlightPadding * 2),
    height: Math.max(2, bounds.height + spotlightPadding * 2),
  };
}

function getCardStyle(
  rect: Rect | null,
  placement: TutorialStep["placement"],
  offsetX = 0,
  offsetY = 0,
) {
  const maxWidth = 360;
  if (!rect) {
    return {
      top: `calc(50% + ${offsetY}px)`,
      left: `calc(50% + ${offsetX}px)`,
      transform: "translate(-50%, -50%)",
      width: `min(${maxWidth}px, calc(100vw - 2rem))`,
    };
  }

  const gap = 18;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  if (placement === "left") {
    const left = Math.max(12, rect.left - maxWidth - gap);
    return {
      top: `${Math.max(12, rect.top + offsetY)}px`,
      left: `${Math.max(12, left + offsetX)}px`,
      width: `${maxWidth}px`,
    };
  }

  if (placement === "right") {
    const left = Math.min(
      viewportWidth - maxWidth - 12,
      rect.left + rect.width + gap,
    );
    return {
      top: `${Math.max(12, rect.top + offsetY)}px`,
      left: `${Math.max(12, left + offsetX)}px`,
      width: `${maxWidth}px`,
    };
  }

  if (placement === "top") {
    const top = Math.max(12, rect.top - 220);
    const left = Math.min(
      viewportWidth - maxWidth - 12,
      Math.max(12, rect.left + rect.width / 2 - maxWidth / 2),
    );

    return {
      top: `${Math.max(12, top + offsetY)}px`,
      left: `${Math.max(12, left + offsetX)}px`,
      width: `${maxWidth}px`,
    };
  }

  const top = Math.min(viewportHeight - 220, rect.top + rect.height + gap);
  const left = Math.min(
    viewportWidth - maxWidth - 12,
    Math.max(12, rect.left + rect.width / 2 - maxWidth / 2),
  );

  return {
    top: `${Math.max(12, top + offsetY)}px`,
    left: `${Math.max(12, left + offsetX)}px`,
    width: `${maxWidth}px`,
  };
}

export function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  nextDisabled,
  onBack,
  onNext,
  onSkip,
  onClose,
}: TutorialOverlayProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  useEffect(() => {
    const sync = () => {
      setTargetRect(
        readTargetRect(
          step.targetSelector,
          step.spotlightOffsetX ?? 0,
          step.spotlightOffsetY ?? 0,
          step.spotlightPadding ?? DEFAULT_SPOTLIGHT_PADDING,
        ),
      );
    };

    sync();
    const rafId = window.requestAnimationFrame(sync);

    const target = document.querySelector(step.targetSelector);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }

    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [
    step.spotlightOffsetX,
    step.spotlightOffsetY,
    step.spotlightPadding,
    step.targetSelector,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const cardStyle = useMemo(
    () =>
      getCardStyle(
        targetRect,
        step.placement ?? "bottom",
        step.offsetX ?? 0,
        step.offsetY ?? 0,
      ),
    [step.offsetX, step.offsetY, step.placement, targetRect],
  );

  return (
    <div className={styles.tutorialRoot} aria-live="polite">
      <div className={styles.dimmedOverlay} role="presentation" />
      {targetRect ? (
        <div
          className={styles.spotlight}
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
          role="presentation"
        />
      ) : null}

      <section
        className={styles.stepCard}
        style={cardStyle}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.stepHeader}>
          <p className={styles.progressLabel}>
            Step {stepNumber} of {totalSteps}
          </p>
          <button
            type="button"
            className={styles.closeIcon}
            onClick={onClose}
            aria-label="Close tutorial"
          >
            x
          </button>
        </header>

        <h3>{step.title}</h3>
        <p>{step.description}</p>
        {step.actionHint ? (
          <p className={styles.actionHint}>{step.actionHint}</p>
        ) : null}

        <div className={styles.stepActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onBack}
            disabled={stepNumber <= 1}
          >
            Back
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onSkip}
          >
            Skip tutorial
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onNext}
            disabled={nextDisabled}
          >
            {stepNumber >= totalSteps ? "Finish" : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}

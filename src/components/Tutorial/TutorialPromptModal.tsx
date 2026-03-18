import styles from "../../styles/TutorialOverlay.module.css";

type TutorialPromptModalProps = {
  onStart: () => void;
  onSkip: () => void;
};

export function TutorialPromptModal({
  onStart,
  onSkip,
}: TutorialPromptModalProps) {
  return (
    <div className={styles.promptOverlay} role="presentation">
      <div
        className={styles.promptCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-prompt-title"
      >
        <h2 id="tutorial-prompt-title">
          Is this your first time using the editor?
        </h2>
        <p>
          A quick guided tour can walk you through tools, layers, settings, and
          export in under two minutes.
        </p>
        <div className={styles.promptActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onStart}
          >
            Start Tutorial
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

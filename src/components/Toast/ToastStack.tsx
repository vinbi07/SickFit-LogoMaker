import styles from "../../styles/ToastStack.module.css";

export type ToastMessage = {
  id: number;
  text: string;
  type: "success" | "error" | "info";
};

type ToastStackProps = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className={styles.stack} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.type === "success" ? styles.success : ""} ${
            toast.type === "error" ? styles.error : styles.info
          }`}
          role="status"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

import styles from "../../styles/SockDesigner.module.css";

export function CanvasInstructions() {
  return (
    <div className={styles.canvasInstructions}>
      <p>
        <strong>Controls</strong>
      </p>
      <ul>
        <li>Hold Alt and drag to pan.</li>
        <li>Use the mouse wheel to zoom in and out.</li>
      </ul>
    </div>
  );
}

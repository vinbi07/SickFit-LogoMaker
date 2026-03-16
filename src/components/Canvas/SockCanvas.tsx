import type { RefObject } from "react";
import styles from "../../styles/SockDesigner.module.css";

type SockCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function SockCanvas({ canvasRef }: SockCanvasProps) {
  return <canvas ref={canvasRef} className={styles.mainCanvas} />;
}

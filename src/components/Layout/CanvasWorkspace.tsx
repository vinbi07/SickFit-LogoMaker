import type { RefObject } from "react";
import { SockCanvas } from "../Canvas/SockCanvas";
import { CanvasInstructions } from "../Canvas/CanvasInstructions";
import styles from "../../styles/CanvasWorkspace.module.css";

export type CanvasDebugInfo = {
  canvasReady: boolean;
  canvasSize: string;
  domCanvasSize: string;
  wrapperSize: string;
  zoom: string;
  objectCount: number;
  activeObjectType: string;
  hasBackgroundImage: boolean;
  backgroundImageInfo: string;
  centerPixel: string;
  topLeftPixel: string;
  upperCenterPixel: string;
  selectedColor: string;
  activeTool: string;
  loadStatus: string;
  lastBackgroundUrl: string;
  lastBackgroundError: string;
  exportError: string;
};

type CanvasWorkspaceProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  zoomPercent: number;
  debugInfo: CanvasDebugInfo;
};

export function CanvasWorkspace({
  canvasRef,
  zoomPercent,
}: CanvasWorkspaceProps) {
  return (
    <section className={styles.workspace}>
      <div className={styles.stage}>
        {/*
        <aside className={styles.debugOverlay} aria-live="polite">
          <strong>Canvas Debug</strong>
          <div className={styles.debugGrid}>
            <span>Canvas Ready</span>
            <span>{debugInfo.canvasReady ? "yes" : "no"}</span>
            <span>Canvas Size</span>
            <span>{debugInfo.canvasSize}</span>
            <span>DOM Canvas Size</span>
            <span>{debugInfo.domCanvasSize}</span>
            <span>Wrapper Size</span>
            <span>{debugInfo.wrapperSize}</span>
            <span>Zoom</span>
            <span>{debugInfo.zoom}</span>
            <span>Objects</span>
            <span>{debugInfo.objectCount}</span>
            <span>Active Object</span>
            <span>{debugInfo.activeObjectType}</span>
            <span>Background</span>
            <span>{debugInfo.hasBackgroundImage ? "set" : "missing"}</span>
            <span>BG Image Info</span>
            <span>{debugInfo.backgroundImageInfo}</span>
            <span>Center Pixel</span>
            <span>{debugInfo.centerPixel}</span>
            <span>Top-Left Pixel</span>
            <span>{debugInfo.topLeftPixel}</span>
            <span>Upper Center Pixel</span>
            <span>{debugInfo.upperCenterPixel}</span>
            <span>Selected Color</span>
            <span>{debugInfo.selectedColor}</span>
            <span>Active Tool</span>
            <span>{debugInfo.activeTool}</span>
            <span>Load Status</span>
            <span>{debugInfo.loadStatus}</span>
            <span>Export Error</span>
            <span>{debugInfo.exportError}</span>
            <span>Last BG Error</span>
            <span>{debugInfo.lastBackgroundError}</span>
            <span>Last BG URL</span>
            <span className={styles.debugUrl}>
              {debugInfo.lastBackgroundUrl}
            </span>
          </div>
        </aside>
        */}
        <SockCanvas canvasRef={canvasRef} />
      </div>
      <div className={styles.workspaceMeta}>
        <span>Zoom: {zoomPercent}%</span>
        <span>Hold Alt + Drag to pan</span>
        <span>Wheel to zoom</span>
      </div>
      <CanvasInstructions />
    </section>
  );
}

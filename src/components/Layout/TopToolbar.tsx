import type { TextControlsState } from "../../types/designer";
import styles from "../../styles/TopToolbar.module.css";

type TopToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  isExporting: boolean;
  zoomPercent: number;
  snapEnabled: boolean;
  isTextSelected: boolean;
  textControls: TextControlsState;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
  downloadButtonLabel?: string;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
  onToggleSnap: () => void;
  onTextControlsChange: (patch: Partial<TextControlsState>) => void;
};

const fontOptions = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Palatino Linotype",
  "Tahoma",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
  "Lucida Console",
  "Monaco",
  "Impact",
  "Comic Sans MS",
  "Lucida Sans Unicode",
  "Gill Sans",
  "Franklin Gothic Medium",
  "Segoe UI",
  "Candara",
  "Optima",
  "Futura",
  "Century Gothic",
  "Bookman",
];

export function TopToolbar({
  canUndo,
  canRedo,
  isExporting,
  zoomPercent,
  snapEnabled,
  isTextSelected,
  textControls,
  onUndo,
  onRedo,
  onDeleteSelected,
  onDownload,
  downloadButtonLabel,
  onZoomOut,
  onZoomIn,
  onZoomReset,
  onToggleSnap,
  onTextControlsChange,
}: TopToolbarProps) {
  const setFontSize = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      return;
    }
    const clamped = Math.max(8, Math.min(240, Math.round(nextValue)));
    onTextControlsChange({ fontSize: clamped });
  };

  return (
    <div className={styles.toolbar} data-tutorial="top-toolbar">
      <div className={styles.brandGroup} data-tutorial="toolbar-brand">
        <span className={styles.brandTitle}>SickFit</span>
        <span className={styles.brandSubtle}>Custom Sock Editor</span>
      </div>

      <div
        className={styles.commandGroup}
        data-tutorial="toolbar-history-controls"
      >
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          data-tutorial="toolbar-undo"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          data-tutorial="toolbar-redo"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          data-tutorial="toolbar-delete"
        >
          Delete
        </button>
      </div>

      <div
        className={styles.commandGroup}
        data-tutorial="toolbar-zoom-controls"
      >
        <button
          type="button"
          onClick={onZoomOut}
          data-tutorial="toolbar-zoom-out"
        >
          -
        </button>
        <button
          type="button"
          className={styles.zoomReadout}
          onClick={onZoomReset}
          data-tutorial="toolbar-zoom-readout"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          data-tutorial="toolbar-zoom-in"
        >
          +
        </button>
        <button
          type="button"
          className={snapEnabled ? styles.toggleActive : ""}
          onClick={onToggleSnap}
          data-tutorial="toolbar-snap-toggle"
        >
          Snap
        </button>
      </div>

      {isTextSelected ? (
        <div
          className={styles.contextGroup}
          data-tutorial="toolbar-text-settings"
        >
          <select
            aria-label="Font family"
            value={textControls.fontFamily}
            onChange={(event) =>
              onTextControlsChange({ fontFamily: event.target.value })
            }
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

          <div className={styles.sizeControl}>
            <button
              type="button"
              onClick={() => setFontSize(textControls.fontSize - 1)}
              aria-label="Decrease font size"
            >
              -
            </button>
            <input
              aria-label="Font size"
              type="number"
              min={8}
              max={240}
              step={1}
              value={textControls.fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
            <button
              type="button"
              onClick={() => setFontSize(textControls.fontSize + 1)}
              aria-label="Increase font size"
            >
              +
            </button>
          </div>

          <input
            aria-label="Text color"
            type="color"
            value={textControls.fill}
            onChange={(event) =>
              onTextControlsChange({ fill: event.target.value })
            }
          />

          <button
            type="button"
            className={textControls.bold ? styles.toggleActive : ""}
            onClick={() => onTextControlsChange({ bold: !textControls.bold })}
          >
            B
          </button>
          <button
            type="button"
            className={textControls.italic ? styles.toggleActive : ""}
            onClick={() =>
              onTextControlsChange({ italic: !textControls.italic })
            }
          >
            I
          </button>
          <button
            type="button"
            className={textControls.underline ? styles.toggleActive : ""}
            onClick={() =>
              onTextControlsChange({ underline: !textControls.underline })
            }
          >
            U
          </button>

          <select
            aria-label="Text align"
            value={textControls.textAlign}
            onChange={(event) =>
              onTextControlsChange({
                textAlign: event.target.value as
                  | "left"
                  | "center"
                  | "right"
                  | "justify",
              })
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      ) : (
        <div className={styles.contextHint}>
          Select a text layer to edit typography.
        </div>
      )}

      <button
        type="button"
        className={styles.downloadButton}
        disabled={isExporting}
        onClick={onDownload}
        data-tutorial="toolbar-export"
      >
        {isExporting
          ? (downloadButtonLabel ?? "Exporting...")
          : (downloadButtonLabel ?? "Download Mockup")}
      </button>
    </div>
  );
}

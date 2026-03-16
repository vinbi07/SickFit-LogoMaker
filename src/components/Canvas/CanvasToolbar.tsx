import styles from "../../styles/CanvasToolbar.module.css";

type CanvasToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  isExporting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
};

export function CanvasToolbar({
  canUndo,
  canRedo,
  isExporting,
  onUndo,
  onRedo,
  onDeleteSelected,
  onDownload,
}: CanvasToolbarProps) {
  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDeleteSelected}
        >
          Delete Selected
        </button>
      </div>

      <button
        type="button"
        className={styles.downloadButton}
        disabled={isExporting}
        onClick={onDownload}
      >
        {isExporting ? "Exporting..." : "Download Mockup & Continue"}
      </button>
    </>
  );
}

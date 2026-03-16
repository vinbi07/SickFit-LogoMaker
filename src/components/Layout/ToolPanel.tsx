import { ColorPicker } from "../Controls/ColorPicker";
import { TextControls } from "../Controls/TextControls";
import { UploadImage } from "../Controls/UploadImage";
import type { EditorToolKey } from "./LeftDock";
import type { SockColorKey, TextControlsState } from "../../types/designer";
import styles from "../../styles/ToolPanel.module.css";

type ToolPanelProps = {
  activeTool: EditorToolKey;
  selectedColor: SockColorKey;
  textControls: TextControlsState;
  exportError: string | null;
  onColorSelect: (color: SockColorKey) => void;
  onUpload: (file: File) => Promise<void>;
  onTextControlsChange: (patch: Partial<TextControlsState>) => void;
  onAddText: () => void;
};

function FuturePanel({ title, body }: { title: string; body: string }) {
  return (
    <section className={styles.futureSection}>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

export function ToolPanel({
  activeTool,
  selectedColor,
  textControls,
  exportError,
  onColorSelect,
  onUpload,
  onTextControlsChange,
  onAddText,
}: ToolPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2>Design Tools</h2>
      </div>

      <div className={styles.content}>
        {activeTool === "upload" && <UploadImage onUpload={onUpload} />}
        {activeTool === "text" && (
          <TextControls
            controls={textControls}
            onControlsChange={onTextControlsChange}
            onAddText={onAddText}
          />
        )}
        {activeTool === "colors" && (
          <ColorPicker selectedColor={selectedColor} onSelect={onColorSelect} />
        )}
        {activeTool === "shapes" && (
          <FuturePanel
            title="Shapes"
            body="Shape tools will be available in a future update."
          />
        )}
        {activeTool === "patterns" && (
          <FuturePanel
            title="Patterns"
            body="Pattern presets will be available in a future update."
          />
        )}
        {activeTool === "sockStyle" && (
          <FuturePanel
            title="Sock Style"
            body="Additional sock style options are planned for a future update."
          />
        )}
      </div>

      {exportError ? <p className={styles.errorText}>{exportError}</p> : null}
    </section>
  );
}

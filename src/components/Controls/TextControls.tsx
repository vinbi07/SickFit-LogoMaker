import type { TextControlsState } from "../../types/designer";
import styles from "../../styles/TextControls.module.css";

type TextControlsProps = {
  controls: TextControlsState;
  onControlsChange: (patch: Partial<TextControlsState>) => void;
  onAddText: () => void;
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

export function TextControls({
  controls,
  onControlsChange,
  onAddText,
}: TextControlsProps) {
  return (
    <section className={styles.section}>
      <h2>Step 3 (optional): Add Text</h2>
      <div className={styles.card}>
        <input
          type="text"
          value={controls.text}
          className={styles.textInput}
          placeholder="Your text here"
          onChange={(event) => onControlsChange({ text: event.target.value })}
        />

        <button
          type="button"
          className={styles.addTextButton}
          onClick={onAddText}
        >
          Add Text
        </button>

        <div className={styles.controlGroup}>
          <label htmlFor="font-select">Font:</label>
          <select
            id="font-select"
            value={controls.fontFamily}
            onChange={(event) =>
              onControlsChange({ fontFamily: event.target.value })
            }
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="color-picker">Color:</label>
          <input
            id="color-picker"
            type="color"
            className={styles.colorPicker}
            value={controls.fill}
            onChange={(event) => onControlsChange({ fill: event.target.value })}
          />
        </div>

        <div className={styles.optionRow}>
          <button
            type="button"
            className={controls.bold ? styles.activeOption : ""}
            onClick={() => onControlsChange({ bold: !controls.bold })}
          >
            Bold
          </button>
          <button
            type="button"
            className={controls.italic ? styles.activeOption : ""}
            onClick={() => onControlsChange({ italic: !controls.italic })}
          >
            Italic
          </button>
          <button
            type="button"
            className={controls.underline ? styles.activeOption : ""}
            onClick={() => onControlsChange({ underline: !controls.underline })}
          >
            Underline
          </button>
        </div>
      </div>
    </section>
  );
}

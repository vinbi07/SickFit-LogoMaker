import type { SockColorKey } from "../../types/designer";
import {
  colorHexByKey,
  colorNameByKey,
  colorOrder,
} from "../../utils/sockImages";
import styles from "../../styles/ControlsPanel.module.css";

type ColorPickerProps = {
  selectedColor: SockColorKey;
  onSelect: (color: SockColorKey) => void;
};

export function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <section className={styles.section}>
      <h2>Step 1: Choose a color</h2>
      <div className={styles.colorPicker}>
        {colorOrder.map((color) => {
          const hex = colorHexByKey[color];
          const active = color === selectedColor;
          return (
            <button
              key={color}
              type="button"
              aria-label={colorNameByKey[color]}
              className={`${styles.colorCircle} ${active ? styles.activeCircle : ""}`}
              style={{ backgroundColor: hex }}
              onClick={() => onSelect(color)}
            />
          );
        })}
      </div>
      <div className={styles.selectedColorName}>
        {colorNameByKey[selectedColor]}
      </div>
    </section>
  );
}

import styles from "../../styles/LayersPanel.module.css";

export type LayerItem = {
  id: string;
  label: string;
  index: number;
  isActive: boolean;
};

type LayersPanelProps = {
  layers: LayerItem[];
  onSelectLayer: (index: number) => void;
  onDeleteLayer: (index: number) => void;
  onMoveLayer: (index: number, direction: "up" | "down") => void;
};

export function LayersPanel({
  layers,
  onSelectLayer,
  onDeleteLayer,
  onMoveLayer,
}: LayersPanelProps) {
  return (
    <section
      className={styles.panel}
      aria-label="Layers panel"
      data-tutorial="layers-panel"
    >
      <div className={styles.headerRow}>
        <h2>Layers</h2>
      </div>
      {layers.length === 0 ? (
        <p className={styles.empty}>No editable layers yet.</p>
      ) : (
        <ul className={styles.layerList}>
          {layers
            .slice()
            .reverse()
            .map((layer) => (
              <li key={layer.id} className={styles.layerItem}>
                <button
                  type="button"
                  className={`${styles.selectLayer} ${layer.isActive ? styles.activeLayer : ""}`}
                  onClick={() => onSelectLayer(layer.index)}
                >
                  {layer.label}
                </button>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => onMoveLayer(layer.index, "up")}
                    aria-label={`Move ${layer.label} up`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveLayer(layer.index, "down")}
                    aria-label={`Move ${layer.label} down`}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onDeleteLayer(layer.index)}
                    aria-label={`Delete ${layer.label}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

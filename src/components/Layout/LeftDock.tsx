import styles from "../../styles/LeftDock.module.css";

export type EditorToolKey =
  | "upload"
  | "text"
  | "colors"
  | "shapes"
  | "patterns"
  | "sockStyle";

type LeftDockProps = {
  activeTool: EditorToolKey;
  onSelectTool: (tool: EditorToolKey) => void;
};

const tools: { key: EditorToolKey; label: string; shortLabel: string }[] = [
  { key: "upload", label: "Upload", shortLabel: "Up" },
  { key: "text", label: "Text", shortLabel: "Tx" },
  { key: "colors", label: "Colors", shortLabel: "Cl" },
  { key: "shapes", label: "Shapes", shortLabel: "Sh" },
  { key: "patterns", label: "Patterns", shortLabel: "Pt" },
  { key: "sockStyle", label: "Sock Style", shortLabel: "Sk" },
];

export function LeftDock({ activeTool, onSelectTool }: LeftDockProps) {
  return (
    <nav className={styles.dock} aria-label="Design tools">
      <div className={styles.brand}>
        <img
          src="https://cdn.shopify.com/s/files/1/0582/5324/6628/files/SickFit_-_RED.png?v=1736220882"
          alt="SickFit"
        />
      </div>
      {tools.map((tool) => {
        const isActive = tool.key === activeTool;
        return (
          <button
            key={tool.key}
            type="button"
            className={`${styles.toolButton} ${isActive ? styles.activeTool : ""}`}
            onClick={() => onSelectTool(tool.key)}
            title={tool.label}
            aria-label={tool.label}
          >
            <span className={styles.shortLabel}>{tool.shortLabel}</span>
            <span className={styles.longLabel}>{tool.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

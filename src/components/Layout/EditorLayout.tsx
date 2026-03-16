import type { ReactNode } from "react";
import styles from "../../styles/EditorLayout.module.css";

type EditorLayoutProps = {
  topToolbar: ReactNode;
  leftDock: ReactNode;
  toolPanel: ReactNode;
  canvasWorkspace: ReactNode;
  bottomDock: ReactNode;
};

export function EditorLayout({
  topToolbar,
  leftDock,
  toolPanel,
  canvasWorkspace,
  bottomDock,
}: EditorLayoutProps) {
  return (
    <div className={styles.editorLayout}>
      <header className={styles.topBar}>{topToolbar}</header>
      <div className={styles.mainArea}>
        <aside className={styles.leftRail}>{leftDock}</aside>
        <aside className={styles.toolDrawer}>{toolPanel}</aside>
        <main className={styles.workspace}>{canvasWorkspace}</main>
      </div>
      <footer className={styles.bottomDock}>{bottomDock}</footer>
    </div>
  );
}

import { useEffect } from 'react';

type ShortcutOptions = {
  onUndo: () => void;
  onRedo: () => void;
};

export function useKeyboardShortcuts({ onUndo, onRedo }: ShortcutOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandKey = event.ctrlKey || event.metaKey;
      if (!isCommandKey) {
        return;
      }

      if (event.key.toLowerCase() !== 'z') {
        return;
      }

      event.preventDefault();

      if (event.shiftKey) {
        onRedo();
        return;
      }

      onUndo();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onUndo, onRedo]);
}

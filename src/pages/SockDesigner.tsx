import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { CanvasInstructions } from "../components/Canvas/CanvasInstructions";
import { CanvasToolbar } from "../components/Canvas/CanvasToolbar";
import { SockCanvas } from "../components/Canvas/SockCanvas";
import { ColorPicker } from "../components/Controls/ColorPicker";
import { TextControls } from "../components/Controls/TextControls";
import { UploadImage } from "../components/Controls/UploadImage";
import { ToastStack, type ToastMessage } from "../components/Toast/ToastStack";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { useCanvasInteractions } from "../hooks/useCanvasInteractions";
import { useCanvasSelectionSync } from "../hooks/useCanvasSelectionSync";
import { useFabricCanvas } from "../hooks/useFabricCanvas";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useDesignerStore } from "../store/useDesignerStore";
import type {
  ExportConfig,
  SockColorKey,
  TextControlsState,
} from "../types/designer";
import { exportMockup } from "../utils/exportMockup";
import { loadImageFromDataUrl } from "../utils/fabricImageLoader";
import { overlayTemplateUrl, sockImages } from "../utils/sockImages";
import styles from "../styles/SockDesigner.module.css";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export function SockDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasInitialized = useRef(false);
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const canvas = useDesignerStore((state) => state.canvas);
  const selectedColor = useDesignerStore((state) => state.selectedColor);
  const activeObject = useDesignerStore((state) => state.activeObject);
  const textControls = useDesignerStore((state) => state.textControls);
  const isExporting = useDesignerStore((state) => state.isExporting);
  const exportError = useDesignerStore((state) => state.exportError);
  const setSelectedColor = useDesignerStore((state) => state.setSelectedColor);
  const setTextControls = useDesignerStore((state) => state.setTextControls);
  const setIsExporting = useDesignerStore((state) => state.setIsExporting);
  const setExportError = useDesignerStore((state) => state.setExportError);

  const { loadSockBackground } = useFabricCanvas(canvasRef);
  const history = useCanvasHistory(canvas);

  const addToast = useCallback((text: string, type: ToastMessage["type"]) => {
    const nextId = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id: nextId, text, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== nextId));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useCanvasInteractions(canvas);
  useCanvasSelectionSync(canvas);

  useKeyboardShortcuts({ onUndo: history.undo, onRedo: history.redo });

  useEffect(() => {
    if (!canvas || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    loadSockBackground(selectedColor, true)
      .then(() => history.pushSnapshot())
      .catch(() => {
        setExportError("Unable to load initial sock image.");
        addToast("Unable to load initial sock image.", "error");
      });
  }, [
    addToast,
    canvas,
    history,
    loadSockBackground,
    selectedColor,
    setExportError,
  ]);

  const handleColorSelect = useCallback(
    async (color: SockColorKey) => {
      setSelectedColor(color);
      await loadSockBackground(color, true);
      history.pushSnapshot();
      addToast(`Sock color changed to ${color}.`, "info");
    },
    [addToast, history, loadSockBackground, setSelectedColor],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!canvas) {
        addToast("Canvas not ready yet. Please try again.", "error");
        return;
      }

      const validMimeTypes = ["image/png", "image/jpeg", "image/avif"];
      if (!validMimeTypes.includes(file.type)) {
        addToast(
          "Unsupported file type. Please use PNG, JPEG, or AVIF.",
          "error",
        );
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const image = await loadImageFromDataUrl(dataUrl);

        image.set({
          left: canvas.getWidth() / 2 - (image.width ?? 100) / 4,
          top: canvas.getHeight() / 2 - (image.height ?? 100) / 4,
          scaleX: 0.5,
          scaleY: 0.5,
          cornerStyle: "circle",
          transparentCorners: false,
          selectable: true,
        });

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.requestRenderAll();
        addToast("Image added to canvas.", "success");
      } catch {
        setExportError("Image upload failed. Please try another file.");
        addToast("Image upload failed. Please try another file.", "error");
      }
    },
    [addToast, canvas, setExportError],
  );

  const applyTextPatchToCanvas = useCallback(
    (patch: Partial<TextControlsState>) => {
      if (!canvas || !activeObject || activeObject.type !== "text") {
        return;
      }

      const textObject = activeObject as fabric.Text;

      if (patch.text !== undefined) {
        textObject.set("text", patch.text);
      }
      if (patch.fontFamily !== undefined) {
        textObject.set("fontFamily", patch.fontFamily);
      }
      if (patch.fill !== undefined) {
        textObject.set("fill", patch.fill);
      }
      if (patch.bold !== undefined) {
        textObject.set("fontWeight", patch.bold ? "bold" : "normal");
      }
      if (patch.italic !== undefined) {
        textObject.set("fontStyle", patch.italic ? "italic" : "normal");
      }
      if (patch.underline !== undefined) {
        textObject.set("underline", patch.underline);
      }

      canvas.requestRenderAll();
      history.pushSnapshot();
    },
    [activeObject, canvas, history],
  );

  const handleTextControlsChange = useCallback(
    (patch: Partial<TextControlsState>) => {
      setTextControls(patch);
      applyTextPatchToCanvas(patch);
    },
    [applyTextPatchToCanvas, setTextControls],
  );

  const handleAddText = useCallback(() => {
    if (!canvas || !textControls.text.trim()) {
      return;
    }

    const text = new fabric.Text(textControls.text.trim(), {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fontSize: 36,
      fontFamily: textControls.fontFamily,
      fill: textControls.fill,
      fontWeight: textControls.bold ? "bold" : "normal",
      fontStyle: textControls.italic ? "italic" : "normal",
      underline: textControls.underline,
      originX: "center",
      originY: "center",
      selectable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }, [canvas, textControls]);

  const handleDeleteSelected = useCallback(() => {
    if (!canvas) {
      return;
    }

    const object = canvas.getActiveObject();
    if (!object) {
      return;
    }

    canvas.remove(object);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [canvas]);

  const exportConfig = useMemo<ExportConfig>(() => {
    return {
      templateUrl: overlayTemplateUrl,
      mockupUrl: sockImages[selectedColor].right,
      redirectUrl: "/pages/custom-sock-form",
      fileName: `sock-${selectedColor}-custom.png`,
      printArea: {
        xRatio: 0.12,
        yRatio: 0.28,
        widthRatio: 0.76,
        heightRatio: 0.45,
      },
    };
  }, [selectedColor]);

  const handleDownload = useCallback(async () => {
    if (!canvas) {
      addToast("Canvas not ready yet. Please try again.", "error");
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      await exportMockup(canvas, exportConfig);
    } catch {
      setExportError(
        "Download failed. One or more images may block cross-origin export.",
      );
      addToast(
        "Download failed. Please verify image source permissions.",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  }, [addToast, canvas, exportConfig, setExportError, setIsExporting]);

  return (
    <div className={styles.page}>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <h1 className={styles.disclaimer}>
        Sorry, Mock Up Tool only for Desktop
      </h1>

      <div className={styles.toolContainer}>
        <section className={styles.canvasPanel}>
          <SockCanvas canvasRef={canvasRef} />
          <CanvasToolbar
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            isExporting={isExporting}
            onUndo={history.undo}
            onRedo={history.redo}
            onDeleteSelected={handleDeleteSelected}
            onDownload={handleDownload}
          />
          <CanvasInstructions />
        </section>

        <aside className={styles.controlsPanel}>
          <h1 className={styles.title}>
            Let's Create
            <br />
            Your Perfect Sock
          </h1>

          <div className={styles.controlsGrid}>
            <div className={styles.groupHalf}>
              <ColorPicker
                selectedColor={selectedColor}
                onSelect={handleColorSelect}
              />
            </div>
            <div className={styles.groupHalf}>
              <UploadImage onUpload={handleUpload} />
            </div>
            <div className={styles.groupFull}>
              <TextControls
                controls={textControls}
                onControlsChange={handleTextControlsChange}
                onAddText={handleAddText}
              />
            </div>
          </div>
          {exportError && <p className={styles.errorText}>{exportError}</p>}
        </aside>
      </div>
    </div>
  );
}

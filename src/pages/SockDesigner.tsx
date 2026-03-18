import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  CanvasWorkspace,
  type CanvasDebugInfo,
} from "../components/Layout/CanvasWorkspace";
import { EditorLayout } from "../components/Layout/EditorLayout";
import { LeftDock, type EditorToolKey } from "../components/Layout/LeftDock";
import { LayersPanel } from "../components/Layout/LayersPanel";
import { ToolPanel } from "../components/Layout/ToolPanel";
import { TopToolbar } from "../components/Layout/TopToolbar";
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
import {
  downloadMockupDataUrl,
  renderMockupPreview,
} from "../utils/exportMockup";
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
  const initializedCanvasRef = useRef<fabric.Canvas | null>(null);
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTool, setActiveTool] = useState<EditorToolKey>("upload");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [layerRevision, setLayerRevision] = useState(0);
  const [backgroundLoadStatus, setBackgroundLoadStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [lastBackgroundUrl, setLastBackgroundUrl] = useState("");
  const [lastBackgroundError, setLastBackgroundError] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [exportFileNameBase, setExportFileNameBase] = useState("sock-custom");

  const canvas = useDesignerStore((state) => state.canvas);
  const selectedColor = useDesignerStore((state) => state.selectedColor);
  const activeObject = useDesignerStore((state) => state.activeObject);
  const textControls = useDesignerStore((state) => state.textControls);
  const isExporting = useDesignerStore((state) => state.isExporting);
  const exportError = useDesignerStore((state) => state.exportError);
  const aiStatus = useDesignerStore((state) => state.aiStatus);
  const aiStatusMessage = useDesignerStore((state) => state.aiStatusMessage);
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
    if (!canvas || initializedCanvasRef.current === canvas) {
      return;
    }

    const initialColor: SockColorKey = "white";

    initializedCanvasRef.current = canvas;
    setBackgroundLoadStatus("loading");
    setLastBackgroundUrl(sockImages[initialColor]?.right ?? "");
    setLastBackgroundError("");
    setSelectedColor(initialColor);
    loadSockBackground(initialColor, true)
      .then(() => {
        setBackgroundLoadStatus("ready");
        history.pushSnapshot();
        setLayerRevision((value) => value + 1);
      })
      .catch(() => {
        initializedCanvasRef.current = null;
        canvas.setWidth(700);
        canvas.setHeight(700);
        canvas.setBackgroundColor("#ffffff", () => {
          canvas.requestRenderAll();
        });
        setBackgroundLoadStatus("error");
        setLastBackgroundError("initial background load failed");
        setExportError("Unable to load initial sock image.");
        addToast("Unable to load initial sock image.", "error");
      });
  }, [
    addToast,
    canvas,
    history,
    loadSockBackground,
    setExportError,
    setSelectedColor,
  ]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const syncZoom = () => {
      setZoomPercent(Math.round(canvas.getZoom() * 100));
    };

    const syncLayers = () => {
      setLayerRevision((value) => value + 1);
    };

    syncZoom();
    syncLayers();

    canvas.on("mouse:wheel", syncZoom);
    canvas.on("object:added", syncLayers);
    canvas.on("object:removed", syncLayers);
    canvas.on("object:modified", syncLayers);
    canvas.on("selection:created", syncLayers);
    canvas.on("selection:updated", syncLayers);
    canvas.on("selection:cleared", syncLayers);

    return () => {
      canvas.off("mouse:wheel", syncZoom);
      canvas.off("object:added", syncLayers);
      canvas.off("object:removed", syncLayers);
      canvas.off("object:modified", syncLayers);
      canvas.off("selection:created", syncLayers);
      canvas.off("selection:updated", syncLayers);
      canvas.off("selection:cleared", syncLayers);
    };
  }, [canvas]);

  const handleColorSelect = useCallback(
    async (color: SockColorKey) => {
      try {
        setBackgroundLoadStatus("loading");
        setLastBackgroundUrl(sockImages[color]?.right ?? "");
        setLastBackgroundError("");
        setSelectedColor(color);
        await loadSockBackground(color, false);
        setBackgroundLoadStatus("ready");
        history.pushSnapshot();
        setLayerRevision((value) => value + 1);
        addToast(`Sock color changed to ${color}.`, "info");
      } catch {
        if (canvas) {
          canvas.setWidth(700);
          canvas.setHeight(700);
          canvas.setBackgroundColor("#ffffff", () => {
            canvas.requestRenderAll();
          });
        }
        setBackgroundLoadStatus("error");
        setLastBackgroundError(`failed to load color ${color}`);
        setExportError("Unable to switch sock color. Please try again.");
        addToast("Unable to switch sock color. Please try again.", "error");
      }
    },
    [
      addToast,
      canvas,
      history,
      loadSockBackground,
      setExportError,
      setSelectedColor,
    ],
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
      if (patch.fontSize !== undefined) {
        textObject.set("fontSize", Math.max(8, Math.min(240, patch.fontSize)));
      }
      if (patch.textAlign !== undefined) {
        textObject.set("textAlign", patch.textAlign);
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
      fontSize: textControls.fontSize,
      fontFamily: textControls.fontFamily,
      textAlign: textControls.textAlign,
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

  const setZoom = useCallback(
    (nextZoom: number) => {
      if (!canvas) {
        return;
      }

      const clamped = Math.max(0.5, Math.min(3, nextZoom));
      const centerPoint = new fabric.Point(
        canvas.getWidth() / 2,
        canvas.getHeight() / 2,
      );
      canvas.zoomToPoint(centerPoint, clamped);
      canvas.requestRenderAll();
      setZoomPercent(Math.round(clamped * 100));
    },
    [canvas],
  );

  const handleZoomIn = useCallback(() => {
    if (!canvas) {
      return;
    }
    setZoom(canvas.getZoom() + 0.1);
  }, [canvas, setZoom]);

  const handleZoomOut = useCallback(() => {
    if (!canvas) {
      return;
    }
    setZoom(canvas.getZoom() - 0.1);
  }, [canvas, setZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

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

  const downloadButtonLabel = useMemo(() => {
    if (!isExporting) {
      return "Generate Mockup";
    }

    return "Exporting...";
  }, [isExporting]);

  const normalizeFileName = useCallback((name: string) => {
    const normalized = name
      .trim()
      .replace(/\.png$/i, "")
      .replace(/[\\/:*?"<>|]/g, "-");
    if (!normalized) {
      return "mockup-export.png";
    }

    return `${normalized}.png`;
  }, []);

  useEffect(() => {
    if (!canvas || !snapEnabled) {
      return;
    }

    const threshold = 8;

    const onObjectMoving = (event: fabric.IEvent<Event>) => {
      const target = event.target;
      if (!target) {
        return;
      }

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      const printArea = {
        left: canvasWidth * exportConfig.printArea.xRatio,
        top: canvasHeight * exportConfig.printArea.yRatio,
        width: canvasWidth * exportConfig.printArea.widthRatio,
        height: canvasHeight * exportConfig.printArea.heightRatio,
      };

      const center = target.getCenterPoint();
      const bounds = target.getBoundingRect(true, true);

      let nextCenterX = center.x;
      let nextCenterY = center.y;

      if (Math.abs(center.x - canvasWidth / 2) < threshold) {
        nextCenterX = canvasWidth / 2;
      }
      if (Math.abs(center.y - canvasHeight / 2) < threshold) {
        nextCenterY = canvasHeight / 2;
      }

      const boundsLeft = bounds.left;
      const boundsRight = bounds.left + bounds.width;
      const boundsTop = bounds.top;
      const boundsBottom = bounds.top + bounds.height;

      const printLeft = printArea.left;
      const printRight = printArea.left + printArea.width;
      const printTop = printArea.top;
      const printBottom = printArea.top + printArea.height;

      if (Math.abs(boundsLeft - printLeft) < threshold) {
        nextCenterX += printLeft - boundsLeft;
      } else if (Math.abs(boundsRight - printRight) < threshold) {
        nextCenterX += printRight - boundsRight;
      }

      if (Math.abs(boundsTop - printTop) < threshold) {
        nextCenterY += printTop - boundsTop;
      } else if (Math.abs(boundsBottom - printBottom) < threshold) {
        nextCenterY += printBottom - boundsBottom;
      }

      target.setPositionByOrigin(
        new fabric.Point(nextCenterX, nextCenterY),
        "center",
        "center",
      );
    };

    canvas.on("object:moving", onObjectMoving);

    return () => {
      canvas.off("object:moving", onObjectMoving);
    };
  }, [
    canvas,
    exportConfig.printArea.heightRatio,
    exportConfig.printArea.widthRatio,
    exportConfig.printArea.xRatio,
    exportConfig.printArea.yRatio,
    snapEnabled,
  ]);

  const layers = useMemo(() => {
    if (!canvas) {
      return [];
    }

    // Forces recomputation when canvas object events bump revision.
    void layerRevision;

    return canvas.getObjects().map((object, index) => {
      const labelType = object.type === "text" ? "Text" : "Image";
      return {
        id: `${object.type ?? "layer"}-${index}`,
        label: `${labelType} ${index + 1}`,
        index,
        isActive: activeObject === object,
      };
    });
  }, [activeObject, canvas, layerRevision]);

  const handleSelectLayer = useCallback(
    (index: number) => {
      if (!canvas) {
        return;
      }

      const object = canvas.getObjects()[index];
      if (!object) {
        return;
      }

      canvas.setActiveObject(object);
      canvas.requestRenderAll();
    },
    [canvas],
  );

  const handleDeleteLayer = useCallback(
    (index: number) => {
      if (!canvas) {
        return;
      }

      const object = canvas.getObjects()[index];
      if (!object) {
        return;
      }

      canvas.remove(object);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setLayerRevision((value) => value + 1);
    },
    [canvas],
  );

  const handleMoveLayer = useCallback(
    (index: number, direction: "up" | "down") => {
      if (!canvas) {
        return;
      }

      const objects = canvas.getObjects();
      const object = objects[index];
      if (!object) {
        return;
      }

      const step = direction === "up" ? 1 : -1;
      const targetIndex = Math.max(
        0,
        Math.min(objects.length - 1, index + step),
      );
      if (targetIndex === index) {
        return;
      }

      object.moveTo(targetIndex);
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
      history.pushSnapshot();
      setLayerRevision((value) => value + 1);
    },
    [canvas, history],
  );

  const handleRegularExport = useCallback(async () => {
    if (!canvas) {
      addToast("Canvas not ready yet. Please try again.", "error");
      return;
    }

    setExportError(null);
    setIsExporting(true);
    setPreviewDataUrl(null);
    setIsPreviewModalOpen(true);
    setExportFileNameBase(exportConfig.fileName.replace(/\.png$/i, ""));

    try {
      const dataUrl = await renderMockupPreview(canvas, exportConfig);
      setPreviewDataUrl(dataUrl);
    } catch (error) {
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : "Download failed. One or more images may block cross-origin export.";

      setExportError(fallbackMessage);
      setIsPreviewModalOpen(false);
      addToast(
        "Download failed. Please verify image source permissions.",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  }, [addToast, canvas, exportConfig, setExportError, setIsExporting]);

  const handleDownload = useCallback(() => {
    if (isExporting) {
      return;
    }

    setIsExportModalOpen(true);
  }, [isExporting]);

  const handleChooseRegularExport = useCallback(() => {
    setIsExportModalOpen(false);
    void handleRegularExport();
  }, [handleRegularExport]);

  const handleChooseAIGeneration = useCallback(() => {
    addToast("AI Generation is coming soon.", "info");
  }, [addToast]);

  const handleDownloadPreview = useCallback(() => {
    if (!previewDataUrl) {
      return;
    }

    const fileName = normalizeFileName(exportFileNameBase);
    downloadMockupDataUrl(previewDataUrl, fileName);
    setIsPreviewModalOpen(false);
    addToast("Mockup downloaded.", "success");
  }, [addToast, exportFileNameBase, normalizeFileName, previewDataUrl]);

  const canvasDebugInfo = useMemo<CanvasDebugInfo>(() => {
    void layerRevision;
    void zoomPercent;

    const width = canvas?.getWidth() ?? 0;
    const height = canvas?.getHeight() ?? 0;
    const lowerCanvasElement = canvas?.getElement();
    const upperCanvasElement = canvas?.getSelectionElement();
    const wrapperElement = lowerCanvasElement?.parentElement;
    const domCanvasWidth = lowerCanvasElement?.clientWidth ?? 0;
    const domCanvasHeight = lowerCanvasElement?.clientHeight ?? 0;
    const wrapperWidth = wrapperElement?.clientWidth ?? 0;
    const wrapperHeight = wrapperElement?.clientHeight ?? 0;

    const backgroundImage = canvas?.backgroundImage as fabric.Image | undefined;
    const backgroundImageInfo = backgroundImage
      ? `w:${backgroundImage.width ?? 0} h:${backgroundImage.height ?? 0} sx:${backgroundImage.scaleX ?? 0} sy:${backgroundImage.scaleY ?? 0} visible:${backgroundImage.visible !== false} opacity:${backgroundImage.opacity ?? 1}`
      : "none";

    let centerPixel = "n/a";
    let topLeftPixel = "n/a";
    let upperCenterPixel = "n/a";

    try {
      const context2d = lowerCanvasElement?.getContext("2d");
      if (context2d && width > 1 && height > 1) {
        const centerData = context2d.getImageData(
          Math.floor(width / 2),
          Math.floor(height / 2),
          1,
          1,
        ).data;
        const topLeftData = context2d.getImageData(1, 1, 1, 1).data;

        centerPixel = `${centerData[0]},${centerData[1]},${centerData[2]},${centerData[3]}`;
        topLeftPixel = `${topLeftData[0]},${topLeftData[1]},${topLeftData[2]},${topLeftData[3]}`;
      }

      const upperContext2d = upperCanvasElement?.getContext("2d");
      if (upperContext2d && width > 1 && height > 1) {
        const upperData = upperContext2d.getImageData(
          Math.floor(width / 2),
          Math.floor(height / 2),
          1,
          1,
        ).data;
        upperCenterPixel = `${upperData[0]},${upperData[1]},${upperData[2]},${upperData[3]}`;
      }
    } catch {
      centerPixel = "unreadable";
      topLeftPixel = "unreadable";
      upperCenterPixel = "unreadable";
    }

    return {
      canvasReady: Boolean(canvas),
      canvasSize: `${width}x${height}`,
      domCanvasSize: `${domCanvasWidth}x${domCanvasHeight}`,
      wrapperSize: `${wrapperWidth}x${wrapperHeight}`,
      zoom: `${Math.round((canvas?.getZoom() ?? 0) * 100)}%`,
      objectCount: canvas?.getObjects().length ?? 0,
      activeObjectType: activeObject?.type ?? "none",
      hasBackgroundImage: Boolean(canvas?.backgroundImage),
      backgroundImageInfo,
      centerPixel,
      topLeftPixel,
      upperCenterPixel,
      selectedColor,
      activeTool,
      loadStatus: backgroundLoadStatus,
      lastBackgroundUrl: lastBackgroundUrl || "none",
      lastBackgroundError: lastBackgroundError || "none",
      exportError: exportError ?? "none",
      aiStatus: aiStatus ?? "none",
      aiStatusMessage: aiStatusMessage ?? "none",
    };
  }, [
    activeObject?.type,
    activeTool,
    aiStatus,
    aiStatusMessage,
    backgroundLoadStatus,
    canvas,
    exportError,
    lastBackgroundError,
    lastBackgroundUrl,
    layerRevision,
    selectedColor,
    zoomPercent,
  ]);

  return (
    <div className={styles.page}>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <h1 className={styles.disclaimer}>
        Sorry, Mock Up Tool only for Desktop
      </h1>

      <EditorLayout
        topToolbar={
          <TopToolbar
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            isExporting={isExporting}
            zoomPercent={zoomPercent}
            snapEnabled={snapEnabled}
            isTextSelected={activeObject?.type === "text"}
            textControls={textControls}
            onUndo={history.undo}
            onRedo={history.redo}
            onDeleteSelected={handleDeleteSelected}
            onDownload={handleDownload}
            downloadButtonLabel={downloadButtonLabel}
            onZoomOut={handleZoomOut}
            onZoomIn={handleZoomIn}
            onZoomReset={handleZoomReset}
            onToggleSnap={() => setSnapEnabled((value) => !value)}
            onTextControlsChange={handleTextControlsChange}
          />
        }
        leftDock={
          <LeftDock activeTool={activeTool} onSelectTool={setActiveTool} />
        }
        toolPanel={
          <ToolPanel
            activeTool={activeTool}
            selectedColor={selectedColor}
            textControls={textControls}
            exportError={exportError}
            onColorSelect={handleColorSelect}
            onUpload={handleUpload}
            onTextControlsChange={handleTextControlsChange}
            onAddText={handleAddText}
          />
        }
        canvasWorkspace={
          <CanvasWorkspace
            canvasRef={canvasRef}
            zoomPercent={zoomPercent}
            debugInfo={canvasDebugInfo}
          />
        }
        bottomDock={
          <LayersPanel
            layers={layers}
            onSelectLayer={handleSelectLayer}
            onDeleteLayer={handleDeleteLayer}
            onMoveLayer={handleMoveLayer}
          />
        }
      />

      {isExportModalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            className={styles.exportModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="export-modal-title">Choose Export Type</h2>
            <p>Export your current design now, or wait for AI generation.</p>

            <div className={styles.modalActions}>
              <button type="button" onClick={handleChooseRegularExport}>
                Regular Export
              </button>
              <button type="button" disabled onClick={handleChooseAIGeneration}>
                AI Generation (Coming Soon)
              </button>
            </div>

            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {isPreviewModalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => {
            if (!isExporting) {
              setIsPreviewModalOpen(false);
            }
          }}
        >
          <div
            className={styles.previewModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="preview-modal-title">Mockup Preview</h2>
            <p>
              {isExporting
                ? "Rendering your mockup preview..."
                : "Review the preview, choose a filename, then download."}
            </p>

            <div className={styles.previewViewport}>
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Generated mockup preview"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.previewPlaceholder}>
                  Preparing preview...
                </div>
              )}
            </div>

            <label className={styles.fileNameField}>
              File name
              <div className={styles.fileNameRow}>
                <input
                  type="text"
                  value={exportFileNameBase}
                  onChange={(event) =>
                    setExportFileNameBase(event.target.value)
                  }
                  placeholder="sock-custom"
                />
                <span className={styles.fileExt}>.png</span>
              </div>
            </label>

            <div className={styles.modalActions}>
              <button
                type="button"
                disabled={!previewDataUrl || isExporting}
                onClick={handleDownloadPreview}
              >
                Download PNG
              </button>
            </div>

            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setIsPreviewModalOpen(false)}
              disabled={isExporting}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

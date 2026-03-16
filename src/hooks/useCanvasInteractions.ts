import { useEffect } from 'react';
import { fabric } from 'fabric';

export function useCanvasInteractions(canvas: fabric.Canvas | null): void {
  useEffect(() => {
    if (!canvas) {
      return;
    }

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const onMouseDown = (opt: fabric.IEvent<Event>) => {
      const event = opt.e as MouseEvent;
      if (event.altKey || event.button === 1) {
        isDragging = true;
        lastPosX = event.clientX;
        lastPosY = event.clientY;
        canvas.selection = false;
      }
    };

    const onMouseMove = (opt: fabric.IEvent<Event>) => {
      if (!isDragging) {
        return;
      }

      const event = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform;
      if (!vpt) {
        return;
      }

      vpt[4] += event.clientX - lastPosX;
      vpt[5] += event.clientY - lastPosY;
      canvas.requestRenderAll();
      lastPosX = event.clientX;
      lastPosY = event.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      canvas.selection = true;
    };

    const onMouseWheel = (opt: fabric.IEvent<Event>) => {
      const event = opt.e as WheelEvent;
      const delta = event.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 3) {
        zoom = 3;
      }
      if (zoom < 0.5) {
        zoom = 0.5;
      }

      canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);
      event.preventDefault();
      event.stopPropagation();
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
    canvas.on('mouse:wheel', onMouseWheel);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
      canvas.off('mouse:wheel', onMouseWheel);
    };
  }, [canvas]);
}

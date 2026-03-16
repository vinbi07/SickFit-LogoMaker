export function getCanvasScale(
  imageWidth: number,
  imageHeight: number,
  maxCanvasWidth = 800,
): number {
  const viewportWidth = Math.max(window.innerWidth - 40, 320);
  const viewportHeight = Math.max(window.innerHeight - 120, 320);
  const widthLimit = Math.min(viewportWidth, maxCanvasWidth);
  return Math.min(widthLimit / imageWidth, viewportHeight / imageHeight, 0.5);
}

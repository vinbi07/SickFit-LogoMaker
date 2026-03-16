import { fabric } from 'fabric';

function loadImageElement(
  url: string,
  crossOrigin?: '' | 'anonymous' | 'use-credentials',
): Promise<HTMLImageElement> {
  const timeoutMs = 20000;

  return new Promise((resolve, reject) => {
    const image = new Image();
    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      reject(new Error('Image load timed out'));
    }, timeoutMs);

    image.onload = () => {
      if (timedOut) {
        return;
      }

      window.clearTimeout(timeoutId);
      resolve(image);
    };

    image.onerror = () => {
      if (timedOut) {
        return;
      }

      window.clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };

    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }

    image.src = url;
  });
}

export function loadFabricImage(url: string): Promise<fabric.Image> {
  return loadImageElement(url, 'anonymous')
    .catch(() => {
      // Some remote hosts omit CORS headers; fallback keeps editor usable.
      return loadImageElement(url);
    })
    .then((imageElement) => new fabric.Image(imageElement));
}

export function loadImageFromDataUrl(dataUrl: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      dataUrl,
      (img: fabric.Image) => {
        if (!img) {
          reject(new Error('Failed to parse uploaded image'));
          return;
        }
        resolve(img);
      },
      { crossOrigin: 'anonymous' },
    );
  });
}

import { fabric } from 'fabric';

export function loadFabricImage(url: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      url,
      (img: fabric.Image) => {
        if (!img) {
          reject(new Error('Failed to load image'));
          return;
        }
        resolve(img);
      },
      { crossOrigin: 'anonymous' },
    );
  });
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

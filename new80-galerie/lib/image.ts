'use client';

export type Processed = {
  thumb: Blob; thumbType: string; thumbExt: 'webp' | 'jpg';
  full: Blob; width: number; height: number; color: string;
};

const THUMB = 600;   // grille
const FULL = 2000;   // visionneuse + enregistrement

function draw(bmp: ImageBitmap, max: number) {
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('encodage'))), type, q));

function couleurMoyenne(bmp: ImageBitmap) {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  // assombrie pour rester discrète sur fond noir
  const k = 0.55;
  return '#' + [r, g, b].map((v) => Math.round(v * k).toString(16).padStart(2, '0')).join('');
}

/** Génère la vignette (~600 px WebP) et la version visionneuse (~2000 px JPEG q85) dans le navigateur. */
export async function processImage(file: File): Promise<Processed> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const fullCanvas = draw(bmp, FULL);
    const full = await toBlob(fullCanvas, 'image/jpeg', 0.85);
    const thumbCanvas = draw(bmp, THUMB);
    let thumb = await toBlob(thumbCanvas, 'image/webp', 0.78);
    let thumbExt: 'webp' | 'jpg' = 'webp';
    if (thumb.type !== 'image/webp') {
      // Safari ne sait pas encoder en WebP : repli JPEG
      thumb = await toBlob(thumbCanvas, 'image/jpeg', 0.78);
      thumbExt = 'jpg';
    }
    return { thumb, thumbType: thumb.type, thumbExt, full, width: fullCanvas.width, height: fullCanvas.height, color: couleurMoyenne(bmp) };
  } finally {
    bmp.close();
  }
}

/**
 * Client-side image preparation.
 *
 * Downscaling before upload is a quota decision, not a cosmetic one: vision
 * tokens scale with pixels, free tiers are metered per day, and a 12MP phone
 * photo of a leaf carries no more diagnostic detail than a 1024px one. It also
 * makes uploads survive a weak rural connection.
 */

/** Longest edge in pixels. Enough for lesion detail, small enough to stay cheap. */
const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export interface PreparedImage {
  /** JPEG data URL, ready to POST. */
  dataUrl: string;
  width: number;
  height: number;
  approxBytes: number;
}

export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageError';
  }
}

function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap handles EXIF orientation and is far faster on mobile.
  if ('createImageBitmap' in window) {
    return createImageBitmap(file).catch(() => loadViaElement(file));
  }
  return loadViaElement(file);
}

function loadViaElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError('That file could not be opened as an image.'));
    };
    image.src = url;
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (file.size === 0) throw new ImageError('That file is empty.');

  // HEIC from iPhones often lacks a usable type string, so an empty type is
  // allowed through and validated by the decode attempt instead.
  if (file.type && !ACCEPTED.includes(file.type)) {
    throw new ImageError('Please choose a photo file such as JPEG, PNG or WebP.');
  }

  const source = await loadBitmap(file);
  const sourceWidth = 'width' in source ? source.width : 0;
  const sourceHeight = 'height' in source ? source.height : 0;

  if (!sourceWidth || !sourceHeight) {
    throw new ImageError('That image has no readable dimensions.');
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new ImageError('This browser could not process the image.');

  context.imageSmoothingQuality = 'high';
  context.drawImage(source as CanvasImageSource, 0, 0, width, height);

  if ('close' in source) source.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  if (dataUrl.length < 64) throw new ImageError('The image could not be encoded.');

  return {
    dataUrl,
    width,
    height,
    approxBytes: Math.floor((dataUrl.length * 3) / 4),
  };
}

/** Small thumbnail for farm history. Full images are never persisted. */
export async function makeThumbnail(dataUrl: string, edge = 96): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new ImageError('Could not read image for thumbnail.'));
    element.src = dataUrl;
  });

  const scale = Math.min(1, edge / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext('2d');
  if (!context) return dataUrl;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.6);
}

"use client";
// Browser-side image helpers for the frame builder.
import { frameGeometry } from "@/lib/frame";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];

export function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export function validatePhoto(file: File): string | null {
  const okType = OK_TYPES.includes(file.type) || /\.(jpe?g|png|heic|heif)$/i.test(file.name);
  if (!okType) return "Please choose a JPG, PNG or HEIC photo.";
  if (file.size > MAX_UPLOAD_BYTES) return "That photo is over 20 MB. Please choose a smaller file.";
  return null;
}

export interface LoadedPhoto {
  url: string; // object URL the browser can display
  width: number;
  height: number;
}

/** Makes a displayable URL (converting HEIC to JPEG if needed) and reads its pixel size. */
export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  let blob: Blob = file;
  if (isHeic(file)) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
    blob = Array.isArray(out) ? out[0] : out;
  }
  const url = URL.createObjectURL(blob);
  const img = await loadImageEl(url);
  return { url, width: img.naturalWidth, height: img.naturalHeight };
}

export function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image"));
    img.src = src;
  });
}

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Renders the crop (react-easy-crop croppedAreaPixels, which are relative to
 * the rotated image) to a canvas, scaled so the long edge is at most maxEdge.
 */
export async function cropToCanvas(src: string, area: PixelArea, rotation = 0, maxEdge = 1400): Promise<HTMLCanvasElement> {
  const img = await loadImageEl(src);
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bw = img.naturalWidth * cos + img.naturalHeight * sin;
  const bh = img.naturalWidth * sin + img.naturalHeight * cos;

  // Draw rotated image onto a bounding canvas, then cut the area out.
  const rotCanvas = document.createElement("canvas");
  rotCanvas.width = Math.round(bw);
  rotCanvas.height = Math.round(bh);
  const rctx = rotCanvas.getContext("2d")!;
  rctx.translate(bw / 2, bh / 2);
  rctx.rotate(rad);
  rctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const scale = Math.min(1, maxEdge / Math.max(area.width, area.height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(area.width * scale));
  out.height = Math.max(1, Math.round(area.height * scale));
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(rotCanvas, area.x, area.y, area.width, area.height, 0, 0, out.width, out.height);
  return out;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), type, quality));
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] || "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Downscales any image source to a small JPEG data URL (for cart thumbnails). */
export async function thumbnailDataUrl(src: string | HTMLCanvasElement, maxEdge = 360) {
  const el = typeof src === "string" ? await loadImageEl(src) : src;
  const w = el instanceof HTMLImageElement ? el.naturalWidth : el.width;
  const h = el instanceof HTMLImageElement ? el.naturalHeight : el.height;
  const s = Math.min(1, maxEdge / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#FBF3EA";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(el, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

/**
 * Draws the framed photo (moulding, optional mat and engraving) to a canvas.
 * This becomes the preview image saved with the order.
 */
export async function renderFramedPreview(opts: {
  photo: HTMLCanvasElement;
  dims: { w: number; h: number };
  frameColor: string;
  frameShade: string;
  mat: boolean;
  engraving?: string;
  scriptFont?: string;
}) {
  const { photo, dims, frameColor, frameShade, mat, engraving } = opts;
  const geo = frameGeometry(dims, mat, !!engraving);
  const ppi = 1100 / Math.max(geo.outerW, geo.outerH);
  const moulding = geo.moulding * ppi;
  const matW = geo.mat * ppi;
  const plaque = geo.plaque * ppi;
  const pw = dims.w * ppi;
  const ph = dims.h * ppi;
  const W = Math.round(pw + 2 * (moulding + matW));
  const H = Math.round(ph + 2 * (moulding + matW) + plaque);
  const pad = 40;
  const c = document.createElement("canvas");
  c.width = W + pad * 2;
  c.height = H + pad * 2;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#FBF3EA";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.translate(pad, pad);

  ctx.save();
  ctx.shadowColor = "rgba(60,35,20,0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, frameColor);
  g.addColorStop(0.5, frameShade);
  g.addColorStop(1, frameColor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Bevel lines for depth
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.strokeRect(moulding - 1, moulding - 1, W - 2 * moulding + 2, H - 2 * moulding + 2);

  ctx.fillStyle = mat || engraving ? "#FBF8F3" : "#000";
  ctx.fillRect(moulding, moulding, W - 2 * moulding, H - 2 * moulding);
  ctx.drawImage(photo, moulding + matW, moulding + matW, pw, ph);
  if (mat) {
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.strokeRect(moulding + matW, moulding + matW, pw, ph);
  }
  if (engraving) {
    ctx.fillStyle = "#6B3A1E";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.round(plaque * 0.5)}px ${opts.scriptFont || "Georgia, serif"}`;
    ctx.fillText(engraving, W / 2, moulding + matW * 2 + ph + plaque / 2, W - 2 * moulding - 20);
  }
  return c;
}

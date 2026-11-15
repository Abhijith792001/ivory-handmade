"use client";
import * as THREE from "three";

let linen: THREE.CanvasTexture | null = null;

/** Procedural woven-linen texture (no image download). */
export function getLinenTexture() {
  if (linen) return linen;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#EFE3D3";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < size; i += 2) {
    ctx.fillStyle = `rgba(120, 85, 55, ${0.025 + Math.random() * 0.05})`;
    ctx.fillRect(0, i, size, 1);
    ctx.fillStyle = `rgba(255, 250, 240, ${0.03 + Math.random() * 0.05})`;
    ctx.fillRect(i, 0, 1, size);
  }
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(110, 80, 50, ${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1);
  }
  linen = new THREE.CanvasTexture(c);
  linen.wrapS = linen.wrapT = THREE.RepeatWrapping;
  linen.repeat.set(10, 10);
  linen.colorSpace = THREE.SRGBColorSpace;
  linen.anisotropy = 4;
  return linen;
}

let paper: THREE.CanvasTexture | null = null;
/** Subtle paper grain used on the box. White base so it tints with material colour. */
export function getPaperTexture() {
  if (paper) return paper;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2500; i++) {
    const v = 225 + Math.random() * 30;
    ctx.fillStyle = `rgba(${v},${v - 4},${v - 10},0.5)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  paper = new THREE.CanvasTexture(c);
  paper.wrapS = paper.wrapT = THREE.RepeatWrapping;
  paper.repeat.set(3, 3);
  paper.colorSpace = THREE.SRGBColorSpace;
  return paper;
}

/** Note card texture with the message written in the brand's script font. */
export function drawNoteCard(canvas: HTMLCanvasElement, text: string, fontFamily: string) {
  const W = 1024;
  const H = 640;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FBF6EE";
  ctx.fillRect(0, 0, W, H);
  // paper speckle
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(150,110,70,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  // little sprig in the corner
  ctx.strokeStyle = "#6E7F52";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W - 60, H - 40);
  ctx.bezierCurveTo(W - 90, H - 120, W - 120, H - 170, W - 170, H - 230);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const t = 0.2 + i * 0.2;
    const x = W - 60 - 110 * t;
    const y = H - 40 - 190 * t;
    ctx.fillStyle = "rgba(110,127,82,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + (i % 2 ? 22 : -22), y, 22, 9, i % 2 ? -0.6 : 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(107,58,30,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.fillStyle = "#6B3A1E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const msg = text.trim() || "With love ♡";
  // word-wrap into up to 4 lines, shrinking font to fit
  let fontSize = 96;
  let lines: string[] = [];
  for (; fontSize >= 44; fontSize -= 6) {
    ctx.font = `${fontSize}px ${fontFamily}, cursive`;
    lines = [];
    let line = "";
    for (const word of msg.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > W - 220 && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    if (lines.length * fontSize * 1.1 < H - 160) break;
  }
  const lh = fontSize * 1.1;
  lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, W / 2 - 30, H / 2 - ((lines.length - 1) * lh) / 2 + i * lh));
}

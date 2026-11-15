// Makes the web logo from the brand PNG: trims the white margin and turns the
// white background into real transparency ("colour to alpha"), so the logo sits
// cleanly on the ivory backgrounds. The original file is left untouched.
// Usage: node scripts/prepare-logo.mjs [in] [out]
import sharp from "sharp";

const input = process.argv[2] || "public/images/ivory-logo.png";
const output = process.argv[3] || "public/images/ivory-logo-web.png";

const trimmed = await sharp(input).flatten({ background: "#ffffff" }).trim({ background: "#ffffff", threshold: 18 }).toBuffer();
const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  // Alpha = how far the darkest channel is from white; then un-mix the white.
  const a = 1 - Math.min(r, g, b) / 255;
  if (a < 0.02) {
    data[i + 3] = 0;
    continue;
  }
  data[i] = Math.round(Math.max(0, Math.min(255, (r - 255 * (1 - a)) / a)));
  data[i + 1] = Math.round(Math.max(0, Math.min(255, (g - 255 * (1 - a)) / a)));
  data[i + 2] = Math.round(Math.max(0, Math.min(255, (b - 255 * (1 - a)) / a)));
  data[i + 3] = Math.round(a * 255);
}

const pad = Math.round(info.width * 0.02);
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`${output}: ${meta.width}×${meta.height}`);

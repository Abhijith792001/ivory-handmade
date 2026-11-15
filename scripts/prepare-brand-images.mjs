// One-off helper: crops the brand collage into individual photos for the site.
// Usage: node scripts/prepare-brand-images.mjs "<path to collage.png>" "<path to dappled bg.png>"
import sharp from "sharp";
const [collage, bg] = process.argv.slice(2);
const S = 3.2; // collage coordinates below are measured on a 2000px-wide preview
const tiles = {
  "tag": [1312, 4, 490, 538],
  "giftbox": [1000, 562, 790, 270],
  "pouch": [4, 848, 548, 482],
  "thankyou": [572, 848, 410, 482],
  "green-card": [998, 848, 290, 482],
  "candle": [1300, 940, 698, 390],
  "logo-sprig": [1000, 110, 300, 290],
};
for (const [name, [x, y, w, h]] of Object.entries(tiles)) {
  await sharp(collage)
    .extract({ left: Math.round(x * S), top: Math.round(y * S), width: Math.round(w * S), height: Math.round(h * S) })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`public/images/${name}.webp`);
}
await sharp(collage).resize({ width: 1600 }).webp({ quality: 78 }).toFile("public/images/brand-collage.webp");
if (bg) await sharp(bg).resize({ width: 2000 }).webp({ quality: 75 }).toFile("public/images/hero-bg.webp");
console.log("done");

/*
 * Builds the bitmap icons from src/app/icon.svg (the source of the mark):
 * apple-icon.png at 180px, full bleed (iOS rounds the corners itself), and
 * favicon.ico with 16, 32 and 48px PNGs inside, for clients that only ask
 * for /favicon.ico. Run it after changing icon.svg: node scripts/make-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const APP = new URL("../src/app/", import.meta.url);
const svg = readFileSync(new URL("icon.svg", APP));
const png = (size, source = svg) => sharp(source, { density: (72 * size) / 32 }).resize(size, size).png().toBuffer();

// iOS draws its own rounded corners, so the tile is square.
const square = Buffer.from(svg.toString().replace(' rx="6"', ""));
writeFileSync(new URL("apple-icon.png", APP), await png(180, square));

// An .ico is a 6-byte header, a 16-byte entry per image, then the images (PNG is allowed inside).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => png(size)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
writeFileSync(new URL("favicon.ico", APP), Buffer.concat([header, ...images]));
console.log("apple-icon.png, favicon.ico:", sizes.join("/"), "px");

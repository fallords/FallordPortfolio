// Writes public/noise.png: a 128x128 greyscale noise tile for the film grain over the page (globals.css, .grain).
// Run with `node scripts/make-noise.mjs`; the output is committed, so this only runs when the tile should change.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const SIZE = 128;
let seed = 1984;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// One filter byte (0, none) before each row of greyscale pixels.
const raw = Buffer.alloc(SIZE * (SIZE + 1));
for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE + 1)] = 0;
    for (let x = 0; x < SIZE; x++) raw[y * (SIZE + 1) + 1 + x] = Math.floor(rand() * 256);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
};

const header = Buffer.alloc(13);
header.writeUInt32BE(SIZE, 0);
header.writeUInt32BE(SIZE, 4);
header[8] = 8; // bit depth
header[9] = 0; // greyscale
const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("public/noise.png", png);
console.log("public/noise.png", png.length, "bytes");

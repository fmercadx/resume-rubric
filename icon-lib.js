/* Draws the app icon as PNG files, with no image library.

   A PNG is a header, a deflated block of raw pixel rows, and a footer. Node ships
   zlib, so the whole thing is about sixty lines and adds no dependency. */

const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const AMBER = [240, 180, 41];
const INK = [11, 14, 20];

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/* distance from a point to a line segment, used to draw the tick with soft edges */
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function icon(size, round, fg, square) {
  const r = round ? size / 2 : (square ? 0 : size * 0.22);  // corner radius
  const stroke = size * 0.1;             // tick thickness
  const rows = [];

  // the tick, in the same proportions as the mark on the site
  const a = [size * 0.27, size * 0.51], b = [size * 0.42, size * 0.66], c = [size * 0.74, size * 0.33];

  for (let y = 0; y < size; y++) {
    const bpp = square ? 3 : 4;
    const row = Buffer.alloc(size * bpp + 1);
    row[0] = 0;                          // filter type none
    for (let x = 0; x < size; x++) {
      // rounded square coverage
      const cx = Math.min(Math.max(x + 0.5, r), size - r);
      const cy = Math.min(Math.max(y + 0.5, r), size - r);
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      let alpha = Math.max(0, Math.min(1, r - d + 0.5));
      if (x + 0.5 > r && x + 0.5 < size - r && y + 0.5 > r && y + 0.5 < size - r) alpha = 1;

      let col = AMBER;
      if (fg) alpha = 0;   // adaptive foreground keeps only the tick
      const dt = Math.min(
        distToSeg(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]),
        distToSeg(x + 0.5, y + 0.5, b[0], b[1], c[0], c[1])
      );
      const tick = Math.max(0, Math.min(1, stroke / 2 - dt + 0.5));
      if (fg && tick > 0) alpha = tick;
      if (tick > 0) col = [
        Math.round(AMBER[0] + (INK[0] - AMBER[0]) * tick),
        Math.round(AMBER[1] + (INK[1] - AMBER[1]) * tick),
        Math.round(AMBER[2] + (INK[2] - AMBER[2]) * tick)
      ];

      const o = 1 + x * bpp;
      if (square) {
        // flatten onto the brand background so nothing depends on transparency
        row[o] = col[0]; row[o + 1] = col[1]; row[o + 2] = col[2];
      } else {
        row[o] = col[0]; row[o + 1] = col[1]; row[o + 2] = col[2];
        row[o + 3] = Math.round(alpha * 255);
      }
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = square ? 2 : 6;    // 2 is truecolour, 6 adds alpha. Apple forbids alpha.
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* maskable icons need the artwork inside the safe circle, so it sits on a full bleed square */



/* variants the app stores ask for:
   round   - a circle instead of a rounded square, for Android round launchers
   fg      - the tick on transparent, for Android adaptive foreground
   square  - hard corners and no alpha, which Apple requires */
module.exports = { icon: function(size, round, fg, square){ return icon(size, round, fg, square); } };

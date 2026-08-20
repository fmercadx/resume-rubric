/* Draws the app icon as PNG, with no image library.

   The mark is the score dial from the app itself: a ring three quarters filled,
   with a tick inside it. It reads as a score rather than as a generic checkmark,
   and it still holds together at 32 pixels.

   Edges are smoothed by drawing at four times the size and averaging down, which
   is simpler to get right than working out coverage analytically.

   Variants:
     round   circle instead of a rounded square, for Android round launchers
     fg      mark only on transparent, for the Android adaptive foreground
     square  hard corners and no alpha channel, which Apple requires
*/

const zlib = require("zlib");

const INK = [11, 14, 20];
const AMBER = [240, 180, 41];
const PAPER = [247, 244, 238];

const SS = 4;                 // supersample factor

function crcTable() {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
}
const TABLE = crcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
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

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/* is this point inside the three quarter arc, including its rounded ends */
function inArc(px, py, cx, cy, radius, halfWidth) {
  const d = Math.hypot(px - cx, py - cy);
  const start = -Math.PI / 2;              // twelve o'clock
  const sweep = Math.PI * 1.5;             // three quarters, clockwise
  if (Math.abs(d - radius) <= halfWidth) {
    let a = Math.atan2(py - cy, px - cx);
    let rel = a - start;
    while (rel < 0) rel += Math.PI * 2;
    if (rel <= sweep) return true;
  }
  // the round caps at each end
  for (const angle of [start, start + sweep]) {
    const ex = cx + Math.cos(angle) * radius;
    const ey = cy + Math.sin(angle) * radius;
    if (Math.hypot(px - ex, py - ey) <= halfWidth) return true;
  }
  return false;
}

function inRing(px, py, cx, cy, radius, halfWidth) {
  return Math.abs(Math.hypot(px - cx, py - cy) - radius) <= halfWidth;
}

/* one sample: returns [r,g,b,a] at 0..255 */
function sample(x, y, S, opts) {
  const cx = S / 2, cy = S / 2;
  const radius = S * 0.315;
  const halfWidth = S * 0.052;

  // tick, proportioned to sit inside the ring
  const t1 = [S * 0.375, S * 0.505], t2 = [S * 0.462, S * 0.592], t3 = [S * 0.638, S * 0.405];
  const tickHalf = S * 0.045;

  const onTick = Math.min(
    distToSeg(x, y, t1[0], t1[1], t2[0], t2[1]),
    distToSeg(x, y, t2[0], t2[1], t3[0], t3[1])
  ) <= tickHalf;

  const onArc = inArc(x, y, cx, cy, radius, halfWidth);
  const onTrack = inRing(x, y, cx, cy, radius, halfWidth);

  /* the adaptive foreground carries only the mark, on nothing */
  if (opts.fg) {
    if (onTick) return [PAPER[0], PAPER[1], PAPER[2], 255];
    if (onArc) return [AMBER[0], AMBER[1], AMBER[2], 255];
    if (onTrack) return [PAPER[0], PAPER[1], PAPER[2], 40];
    return [0, 0, 0, 0];
  }

  /* is this pixel inside the icon shape at all */
  let inside;
  if (opts.square) {
    inside = true;
  } else if (opts.round) {
    inside = Math.hypot(x - cx, y - cy) <= S / 2;
  } else {
    const r = S * 0.22;
    const qx = Math.min(Math.max(x, r), S - r);
    const qy = Math.min(Math.max(y, r), S - r);
    inside = Math.hypot(x - qx, y - qy) <= r;
  }
  if (!inside) return [0, 0, 0, 0];

  if (onTick) return [PAPER[0], PAPER[1], PAPER[2], 255];
  if (onArc) return [AMBER[0], AMBER[1], AMBER[2], 255];
  if (onTrack) {
    // faint track, blended onto the background
    const m = 0.16;
    return [
      Math.round(INK[0] + (PAPER[0] - INK[0]) * m),
      Math.round(INK[1] + (PAPER[1] - INK[1]) * m),
      Math.round(INK[2] + (PAPER[2] - INK[2]) * m),
      255
    ];
  }
  return [INK[0], INK[1], INK[2], 255];
}

function icon(size, round, fg, square) {
  const opts = { round: !!round, fg: !!fg, square: !!square };
  const bpp = square ? 3 : 4;
  const rows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(size * bpp + 1);
    row[0] = 0;                                   // filter: none
    for (let x = 0; x < size; x++) {
      // average SS x SS samples for a clean edge
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) * (size / size);
          const py = (y + (sy + 0.5) / SS) * (size / size);
          const s = sample(px, py, size, opts);
          r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
        }
      }
      const n = SS * SS;
      const alpha = a / n;
      const o = 1 + x * bpp;
      if (alpha < 0.5) {
        if (square) { row[o] = INK[0]; row[o + 1] = INK[1]; row[o + 2] = INK[2]; }
        else { row[o] = 0; row[o + 1] = 0; row[o + 2] = 0; row[o + 3] = 0; }
        continue;
      }
      const rr = Math.round(r / a), gg = Math.round(g / a), bb = Math.round(b / a);
      if (square) {
        row[o] = rr; row[o + 1] = gg; row[o + 2] = bb;
      } else {
        row[o] = rr; row[o + 1] = gg; row[o + 2] = bb; row[o + 3] = Math.round(alpha);
      }
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = square ? 2 : 6;   // 2 is truecolour, 6 adds alpha. Apple forbids alpha.
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

module.exports = { icon };

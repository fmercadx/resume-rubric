/* Draws the app icon as PNG, with no image library.

   The mark is the score dial from the app itself: a ring three quarters filled,
   with a tick inside. It reads as a score rather than as a generic checkmark, and
   it still holds together at 32 pixels.

   The ground is amber and the mark is drawn in ink. A bright icon carries further
   in a store grid than a dark one, and it can never sink into a dark wallpaper.

   Edges are smoothed by drawing at four times the size and averaging down, which
   is simpler to get right than working out coverage analytically.

   Variants, passed as options:
     round   circle instead of a rounded square, for Android round launchers
     fg      mark only on transparent, for the Android adaptive foreground
     square  hard corners and no alpha channel, which Apple requires
     scale   shrinks the mark within the canvas, so the adaptive foreground keeps
             its artwork inside the safe circle the launcher mask leaves visible
*/

const zlib = require("zlib");

const INK = [11, 14, 20];
const AMBER = [240, 180, 41];

const SS = 4;                 // supersample factor

/* Android gives an adaptive foreground a 108dp canvas but only guarantees the
   middle 66dp is visible. The mark spans 0.734 of its own box, so shrinking the
   box to this fraction lands the outer edge of the ring on 66/108. */
const FG_SCALE = 0.83;

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
  for (const angle of [start, start + sweep]) {          // the round caps
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
  const k = S * opts.scale;                              // the box the mark is drawn in
  const radius = k * 0.315;
  const halfWidth = k * 0.052;

  // tick, proportioned to sit inside the ring
  const off = (S - k) / 2;
  const t1 = [off + k * 0.375, off + k * 0.505];
  const t2 = [off + k * 0.462, off + k * 0.592];
  const t3 = [off + k * 0.638, off + k * 0.405];
  const tickHalf = k * 0.045;

  const onTick = Math.min(
    distToSeg(x, y, t1[0], t1[1], t2[0], t2[1]),
    distToSeg(x, y, t2[0], t2[1], t3[0], t3[1])
  ) <= tickHalf;

  const onArc = inArc(x, y, cx, cy, radius, halfWidth);
  const onTrack = inRing(x, y, cx, cy, radius, halfWidth);

  /* the adaptive foreground carries only the mark, on nothing. The launcher paints
     the amber behind it from the background layer. */
  if (opts.fg) {
    if (onTick || onArc) return [INK[0], INK[1], INK[2], 255];
    if (onTrack) return [INK[0], INK[1], INK[2], 51];    // the unearned part, 20 percent
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

  if (onTick || onArc) return [INK[0], INK[1], INK[2], 255];
  if (onTrack) {
    const m = 0.2;                                       // faint ink, blended onto the amber
    return [
      Math.round(AMBER[0] + (INK[0] - AMBER[0]) * m),
      Math.round(AMBER[1] + (INK[1] - AMBER[1]) * m),
      Math.round(AMBER[2] + (INK[2] - AMBER[2]) * m),
      255
    ];
  }
  return [AMBER[0], AMBER[1], AMBER[2], 255];
}

function icon(size, options) {
  const o = options || {};
  const opts = {
    round: !!o.round,
    fg: !!o.fg,
    square: !!o.square,
    scale: o.scale || (o.fg ? FG_SCALE : 1)
  };
  const bpp = opts.square ? 3 : 4;
  const rows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(size * bpp + 1);
    row[0] = 0;                                   // filter: none
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;             // average SS x SS samples
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const s = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, opts);
          r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
        }
      }
      const alpha = a / (SS * SS);
      const p = 1 + x * bpp;
      if (alpha < 0.5) {
        if (opts.square) { row[p] = AMBER[0]; row[p + 1] = AMBER[1]; row[p + 2] = AMBER[2]; }
        else { row[p] = 0; row[p + 1] = 0; row[p + 2] = 0; row[p + 3] = 0; }
        continue;
      }
      row[p] = Math.round(r / a); row[p + 1] = Math.round(g / a); row[p + 2] = Math.round(b / a);
      if (!opts.square) row[p + 3] = Math.round(alpha);
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = opts.square ? 2 : 6;   // 2 is truecolour, 6 adds alpha. Apple forbids alpha.
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

module.exports = { icon, INK, AMBER, FG_SCALE };

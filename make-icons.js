/* Writes the website and PWA icons.

   The drawing itself lives in icon-lib.js, which the app icon script uses too, so
   there is only one copy of the mark and the two can never drift apart. */

const fs = require("fs");
const path = require("path");
const { icon } = require("./icon-lib");

const OUT = path.join(__dirname, "icons");
fs.mkdirSync(OUT, { recursive: true });

/* name, size, then the variant.
   apple-touch-icon is drawn square and opaque because iOS rounds the corners
   itself, and it fills any transparent pixels with black rather than leaving
   them clear. */
const FILES = [
  ["icon-192.png", 192, { }],
  ["icon-512.png", 512, { }],
  ["apple-touch-icon.png", 180, { square: true }]
];

FILES.forEach(([name, size, opt]) => {
  const png = icon(size, false, false, !!opt.square);
  fs.writeFileSync(path.join(OUT, name), png);
  console.log("  " + name.padEnd(22) + size + "x" + size +
              (opt.square ? "  opaque" : "") + "  " + (png.length / 1024).toFixed(1) + " KB");
});

/* Round three. Keeps only the directions that survived 32px, fixes the inverted
   one, and tries the brighter ground, since a dark icon can disappear on a dark
   home screen wallpaper. */
const puppeteer = require("puppeteer");
const path = require("path");

const INK = "#0B0E14";
const AMBER = "#F0B429";
const PAPER = "#F7F4EE";
const BAD = "#FB7185";        // the colour the app already uses for a lost point

const ring = (c, w = 10, on = 150, off = 51) =>
  `<circle cx="50" cy="50" r="32" fill="none" stroke="${c}" stroke-width="${w}"
           stroke-linecap="round" stroke-dasharray="${on} ${off}" transform="rotate(-90 50 50)"/>`;
const track = (c, w = 10, op = ".16") =>
  `<circle cx="50" cy="50" r="32" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}"/>`;
const tick = (c, w = 8.5) =>
  `<path d="M38 50 L47 59 L64 40" fill="none" stroke="${c}" stroke-width="${w}"
         stroke-linecap="round" stroke-linejoin="round"/>`;
const arrow = c =>
  `<path d="M50 62 L50 39" stroke="${c}" stroke-width="8.5" stroke-linecap="round"/>
   <path d="M40 48 L50 38 L60 48" fill="none" stroke="${c}" stroke-width="8.5"
         stroke-linecap="round" stroke-linejoin="round"/>`;

const DESIGNS = {
  "A-current": { bg: INK, svg: track(PAPER) + ring(AMBER) + tick(PAPER) },

  /* the same mark on the bright ground, drawn properly this time */
  "B-amber-tick": { bg: AMBER, svg: track(INK, 10, ".2") + ring(INK) + tick(INK) },

  /* bolder: fatter ring, fatter tick, more contrast between them */
  "C-bold": { bg: INK, svg: track(PAPER, 13, ".18") + ring(AMBER, 13) + tick(PAPER, 10) },

  /* the arrow, which was the one new idea that held at 32 */
  "D-arrow": { bg: INK, svg: track(PAPER) + ring(AMBER) + arrow(PAPER) },
  "E-arrow-amber": { bg: AMBER, svg: track(INK, 10, ".2") + ring(INK) + arrow(INK) },

  /* two tone: the earned part amber, the lost part in the same pink the app uses
     for a low bar. Says score more literally than a single colour does. */
  "F-two-tone": { bg: INK, svg:
    `<circle cx="50" cy="50" r="32" fill="none" stroke="${BAD}" stroke-width="10"
             stroke-linecap="round" stroke-dasharray="38 163" stroke-dashoffset="-153"
             transform="rotate(-90 50 50)"/>` + ring(AMBER) + tick(PAPER) },

  /* the tick breaking out through the gap in the ring, so the two shapes are one */
  "G-tick-breaks": { bg: INK, svg: track(PAPER) + ring(AMBER, 10, 138, 63) +
    `<path d="M34 52 L46 64 L72 28" fill="none" stroke="${PAPER}" stroke-width="9"
           stroke-linecap="round" stroke-linejoin="round"/>` },

  /* the number, which did read at 60 */
  "H-number": { bg: INK, svg: track(PAPER) + ring(AMBER) +
    `<text x="50" y="50" fill="${PAPER}" font-family="-apple-system,Segoe UI,Roboto,Arial"
           font-size="34" font-weight="600" text-anchor="middle" dominant-baseline="central"
           letter-spacing="-1.5">73</text>` },

  /* a monogram, the safest way to be distinctive without being a checkmark */
  "I-monogram": { bg: INK, svg: track(PAPER) + ring(AMBER) +
    `<text x="50" y="51" fill="${PAPER}" font-family="Georgia,'Times New Roman',serif"
           font-size="42" font-weight="700" text-anchor="middle" dominant-baseline="central">R</text>` },

  /* the ring with a marker sitting at the score, like a dial pointer */
  "J-marker": { bg: INK, svg: track(PAPER) + ring(AMBER) + tick(PAPER, 7.5) +
    `<circle cx="50" cy="18" r="6.5" fill="${PAPER}"/>` }
};

function tile(key, size, label) {
  const d = DESIGNS[key];
  return `<div style="text-align:center">
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block">
      <rect width="100" height="100" rx="22" fill="${d.bg}"/>${d.svg}
    </svg>
    ${label ? `<div style="color:#8b8b8b;font-size:10.5px;margin-top:7px;font-family:ui-monospace,Menlo,monospace">${key}</div>` : ""}
  </div>`;
}

const keys = Object.keys(DESIGNS);
const head = t => `<div style="color:#7d7d7d;font-size:11px;letter-spacing:.09em;text-transform:uppercase;
  margin:0 0 15px;font-family:ui-monospace,Menlo,monospace">${t}</div>`;
const rowOf = (size, label) => `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end;margin-bottom:30px">
  ${keys.map(k => tile(k, size, label)).join("")}</div>`;

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:32px 34px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  ${head("full size")}${rowOf(104, true)}
  ${head("home screen, 60px")}${rowOf(60, true)}
  ${head("tiny, 32px")}${rowOf(32, false)}
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1330, height: 640, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, "icon-round3.png"), fullPage: true });
  await browser.close();
  console.log("  wrote icon-round3.png");
})();

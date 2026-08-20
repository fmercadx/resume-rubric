/* Renders icon options as a contact sheet so they can be compared side by side,
   and at small size, which is where most icons fall apart. */

const puppeteer = require("puppeteer");
const path = require("path");

const INK = "#0B0E14";
const AMBER = "#F0B429";
const PAPER = "#F7F4EE";

/* each design is an svg body drawn on a 100 x 100 grid */
const DESIGNS = {
  "a-current": { bg: AMBER, svg: `
    <path d="M27 51 L42 66 L74 33" fill="none" stroke="${INK}" stroke-width="10"
          stroke-linecap="round" stroke-linejoin="round"/>` },

  /* speedometer, gap at the bottom where a dial gap belongs */
  "b-dial-tick": { bg: INK, svg: `
    <path d="M26 72 A31 31 0 1 1 74 72" fill="none" stroke="${AMBER}" stroke-width="11" stroke-linecap="round"/>
    <path d="M37 49 L46 58 L64 39" fill="none" stroke="${PAPER}" stroke-width="9"
          stroke-linecap="round" stroke-linejoin="round"/>` },

  "c-dial-tick-amber": { bg: AMBER, svg: `
    <path d="M26 72 A31 31 0 1 1 74 72" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" opacity=".28"/>
    <path d="M26 72 A31 31 0 0 1 30 34" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M37 49 L46 58 L64 39" fill="none" stroke="${INK}" stroke-width="9"
          stroke-linecap="round" stroke-linejoin="round"/>` },

  /* the app gauge: full track, amber fill three quarters round */
  "d-ring-fill": { bg: INK, svg: `
    <circle cx="50" cy="50" r="30" fill="none" stroke="${PAPER}" stroke-width="12" opacity=".16"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="${AMBER}" stroke-width="12"
            stroke-linecap="round" stroke-dasharray="141 47" transform="rotate(-90 50 50)"/>` },

  "e-ring-tick": { bg: INK, svg: `
    <circle cx="50" cy="50" r="32" fill="none" stroke="${PAPER}" stroke-width="10" opacity=".16"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="${AMBER}" stroke-width="10"
            stroke-linecap="round" stroke-dasharray="150 51" transform="rotate(-90 50 50)"/>
    <path d="M38 50 L47 59 L64 40" fill="none" stroke="${PAPER}" stroke-width="8.5"
          stroke-linecap="round" stroke-linejoin="round"/>` },

  /* the marked line idea, with the contrast pushed up */
  "f-marked-line": { bg: AMBER, svg: `
    <rect x="33" y="28" width="43" height="8.5" rx="4.25" fill="${INK}" opacity=".32"/>
    <rect x="33" y="45.75" width="43" height="8.5" rx="4.25" fill="${INK}"/>
    <rect x="33" y="63.5" width="27" height="8.5" rx="4.25" fill="${INK}" opacity=".32"/>
    <rect x="20" y="43.5" width="7" height="13" rx="3.5" fill="${INK}"/>` },

  "g-marked-line-ink": { bg: INK, svg: `
    <rect x="33" y="28" width="43" height="8.5" rx="4.25" fill="${PAPER}" opacity=".28"/>
    <rect x="33" y="45.75" width="43" height="8.5" rx="4.25" fill="${AMBER}"/>
    <rect x="33" y="63.5" width="27" height="8.5" rx="4.25" fill="${PAPER}" opacity=".28"/>
    <rect x="20" y="43.5" width="7" height="13" rx="3.5" fill="${AMBER}"/>` },

  "h-ring-amber": { bg: AMBER, svg: `
    <circle cx="50" cy="50" r="32" fill="none" stroke="${INK}" stroke-width="10" opacity=".22"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="${INK}" stroke-width="10"
            stroke-linecap="round" stroke-dasharray="150 51" transform="rotate(-90 50 50)"/>
    <path d="M38 50 L47 59 L64 40" fill="none" stroke="${AMBER}" stroke-width="8.5"
          stroke-linecap="round" stroke-linejoin="round"/>` }
};

function tile(key, size, label) {
  const d = DESIGNS[key];
  const r = Math.round(size * 0.22);
  return `<div class="t">
    <svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="${(r / size) * 100}" fill="${d.bg}"/>
      ${d.svg}
    </svg>
    ${label ? `<span>${key}</span>` : ""}
  </div>`;
}

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#1a1a1a;font-family:-apple-system,Segoe UI,Roboto,Arial;padding:28px}
  h2{color:#fff;font-size:15px;font-weight:600;margin:0 0 14px;letter-spacing:.02em}
  h2 small{color:#888;font-weight:400}
  .row{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:34px}
  .t{display:flex;flex-direction:column;align-items:center;gap:7px}
  .t span{color:#999;font-size:11px;font-family:ui-monospace,Menlo,monospace}
  svg{display:block;border-radius:0}
</style></head><body>
  <h2>Full size <small>&nbsp; how it looks in a store listing</small></h2>
  <div class="row">${Object.keys(DESIGNS).map(k => tile(k, 128, true)).join("")}</div>
  <h2>Home screen size <small>&nbsp; 60px, the size that actually matters</small></h2>
  <div class="row">${Object.keys(DESIGNS).map(k => tile(k, 60, true)).join("")}</div>
  <h2>Tiny <small>&nbsp; 32px, notifications and settings lists</small></h2>
  <div class="row">${Object.keys(DESIGNS).map(k => tile(k, 32, false)).join("")}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 700, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 300));
  const out = path.join(__dirname, "icon-options.png");
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log("  wrote icon-options.png");
})();

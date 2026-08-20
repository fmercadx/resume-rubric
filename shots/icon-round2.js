/* A second round of icon options, all in the same three colours as the app.
   Rendered large and then at the two sizes that actually decide it. */
const puppeteer = require("puppeteer");
const path = require("path");

const INK = "#0B0E14";
const AMBER = "#F0B429";
const PAPER = "#F7F4EE";

/* a three quarter ring, drawn as a dasharray so the ends stay round.
   r=32 gives a circumference of 201, so 150 on and 51 off is three quarters. */
const ring = (color, w = 10, on = 150, off = 51, op = 1) =>
  `<circle cx="50" cy="50" r="32" fill="none" stroke="${color}" stroke-width="${w}"
           stroke-linecap="round" stroke-dasharray="${on} ${off}" transform="rotate(-90 50 50)" opacity="${op}"/>`;
const track = (color, w = 10, op = ".16") =>
  `<circle cx="50" cy="50" r="32" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`;
const tick = (color, w = 8.5) =>
  `<path d="M38 50 L47 59 L64 40" fill="none" stroke="${color}" stroke-width="${w}"
         stroke-linecap="round" stroke-linejoin="round"/>`;

/* six segments round a circle, one per scoring dimension, with the first four lit */
function segments(lit, dim, w = 10, litCount = 4) {
  const gap = 6, seg = 201 / 6 - gap;
  let out = "";
  for (let i = 0; i < 6; i++) {
    const off = i * (201 / 6);
    out += `<circle cx="50" cy="50" r="32" fill="none" stroke="${i < litCount ? lit : dim}"
             stroke-width="${w}" stroke-linecap="butt"
             stroke-dasharray="${seg} ${201 - seg}" stroke-dashoffset="${-off}"
             transform="rotate(-90 50 50)"/>`;
  }
  return out;
}

const DESIGNS = {
  /* what is live now, for comparison */
  "1-current": { bg: INK, svg: track(PAPER) + ring(AMBER) + tick(PAPER) },

  /* the gauge with nothing in it. Simplest thing that still says score. */
  "2-ring-only": { bg: INK, svg: track(PAPER, 13) + ring(AMBER, 13) },

  /* six segments, one per dimension of the rubric, four of them earned */
  "3-segments": { bg: INK, svg: segments(AMBER, "#2A3040", 11) },

  /* segments with the tick, so it still reads as a pass */
  "4-segments-tick": { bg: INK, svg: segments(AMBER, "#2A3040", 9) + tick(PAPER, 7.5) },

  /* the score written out. The real question is whether two digits survive 32px. */
  "5-number": { bg: INK, svg: track(PAPER) + ring(AMBER) +
    `<text x="50" y="50" fill="${PAPER}" font-family="-apple-system,Segoe UI,Roboto,Arial"
           font-size="34" font-weight="600" text-anchor="middle" dominant-baseline="central"
           letter-spacing="-1.5">73</text>` },

  /* the same mark inverted, amber ground */
  "6-inverted": { bg: AMBER, svg: track(INK, 10, ".22") + ring(INK) + tick(AMBER) },

  /* an arrow instead of a tick: the score going up rather than being approved */
  "7-arrow": { bg: INK, svg: track(PAPER) + ring(AMBER) +
    `<path d="M50 62 L50 39" stroke="${PAPER}" stroke-width="8.5" stroke-linecap="round"/>
     <path d="M40 48 L50 38 L60 48" fill="none" stroke="${PAPER}" stroke-width="8.5"
           stroke-linecap="round" stroke-linejoin="round"/>` },

  /* a page being marked: three lines, the graded one lit */
  "8-marked-page": { bg: INK, svg:
    `<rect x="26" y="20" width="48" height="60" rx="7" fill="${PAPER}" opacity=".14"/>
     <rect x="35" y="33" width="30" height="7" rx="3.5" fill="${PAPER}" opacity=".45"/>
     <rect x="35" y="46.5" width="30" height="7" rx="3.5" fill="${AMBER}"/>
     <rect x="35" y="60" width="18" height="7" rx="3.5" fill="${PAPER}" opacity=".45"/>` },

  /* the ring as a pen nib scoring a line: too clever? included to rule out */
  "9-ring-dot": { bg: INK, svg: track(PAPER) + ring(AMBER) +
    `<circle cx="50" cy="50" r="9" fill="${AMBER}"/>` },

  /* half dial, the speedometer reading */
  "10-half-dial": { bg: INK, svg:
    `<path d="M22 62 A28 28 0 1 1 78 62" fill="none" stroke="${PAPER}" stroke-width="11"
           stroke-linecap="round" opacity=".16"/>
     <path d="M22 62 A28 28 0 0 1 62 26" fill="none" stroke="${AMBER}" stroke-width="11" stroke-linecap="round"/>
     <path d="M50 62 L62 38" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>` }
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
const rowOf = (size, label) => `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end;margin-bottom:32px">
  ${keys.map(k => tile(k, size, label)).join("")}</div>`;

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:32px 34px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  ${head("full size, the store listing")}${rowOf(104, true)}
  ${head("home screen, 60px, the size that decides it")}${rowOf(60, true)}
  ${head("tiny, 32px, notifications and settings")}${rowOf(32, false)}
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1330, height: 700, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, "icon-round2.png"), fullPage: true });
  await browser.close();
  console.log("  wrote icon-round2.png");
})();

/* The six that survived, shown the way you will actually meet them: sitting on a
   home screen next to other apps, on a light wallpaper and a dark one. A dark icon
   can vanish on a dark wallpaper, and that is not visible on a contact sheet. */
const puppeteer = require("puppeteer");
const path = require("path");

const INK = "#0B0E14";
const AMBER = "#F0B429";
const PAPER = "#F7F4EE";
const BAD = "#FB7185";

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

const PICKS = [
  ["1", "dark, tick", INK, track(PAPER) + ring(AMBER) + tick(PAPER)],
  ["2", "amber, tick", AMBER, track(INK, 10, ".2") + ring(INK) + tick(INK)],
  ["3", "dark, arrow", INK, track(PAPER) + ring(AMBER) + arrow(PAPER)],
  ["4", "amber, arrow", AMBER, track(INK, 10, ".2") + ring(INK) + arrow(INK)],
  ["5", "score in two colours", INK,
    `<circle cx="50" cy="50" r="32" fill="none" stroke="${BAD}" stroke-width="10"
             stroke-linecap="round" stroke-dasharray="38 163" stroke-dashoffset="-153"
             transform="rotate(-90 50 50)"/>` + ring(AMBER) + tick(PAPER)],
  ["6", "tick breaking out", INK, track(PAPER) + ring(AMBER, 10, 138, 63) +
    `<path d="M34 52 L46 64 L72 28" fill="none" stroke="${PAPER}" stroke-width="9"
           stroke-linecap="round" stroke-linejoin="round"/>`]
];

const svg = (d, size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block">
  <rect width="100" height="100" rx="22" fill="${d[2]}"/>${d[3]}</svg>`;

/* a couple of neighbours so each one is judged in company, not alone */
const NEIGHBOURS = [["#2D6CDF", "M"], ["#1DB954", "S"], ["#E1306C", "P"]];
const neighbour = ([c, ch], size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block;opacity:.85">
  <rect width="100" height="100" rx="22" fill="${c}"/>
  <text x="50" y="52" fill="#fff" font-family="-apple-system,Segoe UI,Roboto,Arial" font-size="46"
        font-weight="600" text-anchor="middle" dominant-baseline="central">${ch}</text></svg>`;

function screen(bg, title, labelColor) {
  return `<div style="flex:1">
    <div style="color:#7d7d7d;font-size:11px;letter-spacing:.09em;text-transform:uppercase;
      margin:0 0 13px;font-family:ui-monospace,Menlo,monospace">${title}</div>
    <div style="background:${bg};border-radius:20px;padding:22px 20px">
      ${PICKS.map(d => `<div style="display:flex;gap:15px;align-items:center;margin-bottom:15px">
          ${svg(d, 58)}
          ${NEIGHBOURS.map(n => neighbour(n, 58)).join("")}
          <div style="color:${labelColor};font-size:12px;font-family:ui-monospace,Menlo,monospace;
            margin-left:6px;opacity:.75">${d[0]}. ${d[1]}</div>
        </div>`).join("")}
    </div>
  </div>`;
}

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:30px 32px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  <div style="display:flex;gap:26px;margin-bottom:30px">
    ${screen("linear-gradient(150deg,#0a0d14,#1d2433 60%,#0f1420)", "on a dark wallpaper", "#cfd4de")}
    ${screen("linear-gradient(150deg,#e8e2d6,#f6f2ea 55%,#dcd5c7)", "on a light wallpaper", "#2a2f38")}
  </div>
  <div style="color:#7d7d7d;font-size:11px;letter-spacing:.09em;text-transform:uppercase;
    margin:0 0 14px;font-family:ui-monospace,Menlo,monospace">large, and tiny</div>
  <div style="display:flex;gap:24px;align-items:flex-end">
    ${PICKS.map(d => `<div style="text-align:center">
      ${svg(d, 96)}
      <div style="margin-top:10px;display:flex;justify-content:center">${svg(d, 32)}</div>
      <div style="color:#8b8b8b;font-size:10.5px;margin-top:8px;font-family:ui-monospace,Menlo,monospace">${d[0]}. ${d[1]}</div>
    </div>`).join("")}
  </div>
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1150, height: 900, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, "icon-shortlist.png"), fullPage: true });
  await browser.close();
  console.log("  wrote icon-shortlist.png");
})();

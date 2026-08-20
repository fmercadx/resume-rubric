/* All twelve store screenshots on one sheet. The two sets are the same six screens
   at the two sizes the stores ask for. */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "app", "store", "screenshots");
const b64 = f => fs.readFileSync(path.join(DIR, f)).toString("base64");

const NAMES = ["1-score", "2-action-plan", "3-rewrite", "4-export-proof", "5-fields", "6-privacy"];
const LABELS = ["the score", "what to fix first", "the rewrite", "export proof", "every field", "privacy"];

const shot = (file, label, w) => {
  const p = path.join(DIR, file);
  const kb = Math.round(fs.statSync(p).size / 1024);
  return `<div style="text-align:center">
    <div style="width:${w}px;border-radius:12px;overflow:hidden;background:#000;
                box-shadow:0 8px 26px rgba(0,0,0,.5)">
      <img src="data:image/png;base64,${b64(file)}" style="width:100%;display:block">
    </div>
    <div style="color:#c8c8c8;font-size:11px;margin-top:9px">${label}</div>
    <div style="color:#777;font-size:10px;margin-top:3px;font-family:ui-monospace,Menlo,monospace">${kb} KB</div>
  </div>`;
};

const head = (t, sub) => `<div style="margin:0 0 16px">
  <span style="color:#e8e8e8;font-size:12px;letter-spacing:.09em;text-transform:uppercase;
    font-family:ui-monospace,Menlo,monospace">${t}</span>
  <span style="color:#777;font-size:11px;margin-left:10px;font-family:ui-monospace,Menlo,monospace">${sub}</span></div>`;

const row = (prefix, w) => `<div style="display:flex;gap:18px;align-items:flex-start;margin-bottom:36px">
  ${NAMES.map((n, i) => shot(`${prefix}-${n}.png`, LABELS[i], w)).join("")}</div>`;

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:32px 34px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  ${head("Google Play", "1080 x 1920, six screens")}
  ${row("play", 175)}
  ${head("Apple App Store", "1290 x 2796, the 6.7 inch size Apple reuses for smaller phones")}
  ${row("ios67", 175)}
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 900, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, "all-screenshots.png"), fullPage: true });
  await browser.close();
  console.log("  wrote all-screenshots.png");
})();

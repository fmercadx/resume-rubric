/* The icon where it will actually be met: sitting on a home screen, and then at
   the top of the app once it is opened. The app shot is the real store screenshot,
   not a mock up. */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const b64 = f => fs.readFileSync(path.join(root, f)).toString("base64");

const ICON = b64("app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png");
const SHOT = b64("app/store/screenshots/play-1-score.png");

/* a few plausible neighbours so it is judged in company */
const APPS = [
  ["#1A73E8", "G"], ["#25D366", "W"], ["#E1306C", "I"],
  ["#FF0000", "Y"], ["#1DA1F2", "T"], ["#7289DA", "D"], ["#FF9900", "A"]
];
const tile = ([c, ch]) => `<div style="text-align:center">
  <div style="width:58px;height:58px;border-radius:15px;background:${c};display:flex;
    align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:600">${ch}</div>
  <div style="color:#fff;font-size:10px;margin-top:6px;opacity:.85">&nbsp;</div></div>`;

const ours = `<div style="text-align:center">
  <img src="data:image/png;base64,${ICON}" style="width:58px;height:58px;border-radius:15px;display:block">
  <div style="color:#fff;font-size:10px;margin-top:6px;text-shadow:0 1px 3px rgba(0,0,0,.7)">Resume Rubric</div></div>`;

const phone = inner => `<div style="width:300px;height:600px;border-radius:34px;padding:8px;
  background:#22262e;box-shadow:0 18px 50px rgba(0,0,0,.55)">
  <div style="width:100%;height:100%;border-radius:27px;overflow:hidden;position:relative">${inner}</div></div>`;

const home = phone(`
  <div style="position:absolute;inset:0;background:linear-gradient(160deg,#1b2a4a,#3d2c52 45%,#1a1f33)"></div>
  <div style="position:absolute;inset:0;padding:26px 20px;display:flex;flex-direction:column">
    <div style="color:#fff;font-size:13px;opacity:.9;text-align:center;margin-bottom:20px">9:41</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px">${APPS.slice(0, 4).map(tile).join("")}</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px">
      ${ours}${APPS.slice(4).map(tile).join("")}</div>
  </div>`);

const open = phone(`<img src="data:image/png;base64,${SHOT}" style="width:100%;display:block">`);

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:36px 40px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  <div style="display:flex;gap:44px;align-items:flex-start">
    <div>${home}<div style="color:#8b8b8b;font-size:11px;margin-top:14px;text-align:center;
      font-family:ui-monospace,Menlo,monospace">on the home screen</div></div>
    <div>${open}<div style="color:#8b8b8b;font-size:11px;margin-top:14px;text-align:center;
      font-family:ui-monospace,Menlo,monospace">the app, opened</div></div>
  </div>
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 760, height: 730, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: path.join(__dirname, "icon-in-context.png"), fullPage: true });
  await browser.close();
  console.log("  wrote icon-in-context.png");
})();

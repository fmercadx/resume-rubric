/* A look at the icon as it will actually appear: large, then at the sizes a phone
   and a browser really draw it, in both the square and round launcher shapes. */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const b64 = f => fs.readFileSync(path.join(root, f)).toString("base64");
const img = (f, s, r) => `<img src="data:image/png;base64,${b64(f)}" style="width:${s}px;height:${s}px;display:block${r ? ";border-radius:50%" : ""}">`;

const row = items => `<div style="display:flex;gap:30px;align-items:flex-end">${items}</div>`;
const cell = (inner, label) => `<div style="text-align:center">${inner}
  <div style="color:#8b8b8b;font-size:11px;margin-top:9px;font-family:ui-monospace,Menlo,monospace">${label}</div></div>`;

const HTML = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#141414;padding:34px 38px;font-family:-apple-system,Segoe UI,Roboto,Arial">
  <div style="display:flex;gap:44px;align-items:flex-start">

    ${cell(img("icons/icon-512.png", 220), "the icon")}

    <div>
      <div style="color:#7d7d7d;font-size:11px;letter-spacing:.09em;text-transform:uppercase;margin-bottom:16px;font-family:ui-monospace,Menlo,monospace">as a phone draws it</div>
      ${row([
        cell(img("app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", 76), "home screen"),
        cell(img("app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png", 76), "round phones"),
        cell(img("icons/icon-192.png", 48), "app list"),
        cell(img("icons/icon-192.png", 30), "notification")
      ].join(""))}

      <div style="color:#7d7d7d;font-size:11px;letter-spacing:.09em;text-transform:uppercase;margin:30px 0 16px;font-family:ui-monospace,Menlo,monospace">before and after</div>
      ${row([
        cell(`<svg width="76" height="76" viewBox="0 0 24 24" style="display:block">
                <rect x="1" y="1" width="22" height="22" rx="6" fill="#F0B429"/>
                <path d="M6.5 12.2l3.2 3.3 7.8-7.4" fill="none" stroke="#0B0E14" stroke-width="2.4"
                      stroke-linecap="round" stroke-linejoin="round"/></svg>`, "old"),
        cell(img("icons/icon-512.png", 76), "new")
      ].join(""))}
    </div>
  </div>
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 760, height: 400, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: path.join(__dirname, "icon-look.png"), fullPage: true });
  await browser.close();
  console.log("  wrote icon-look.png");
})();

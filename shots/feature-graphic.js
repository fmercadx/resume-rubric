/* The 1024 x 500 banner Google Play requires. Rendered as a real page and captured,
   so it uses the same fonts and colours as the app rather than being drawn by hand. */

const puppeteer = require("puppeteer");
const path = require("path");

const OUT = path.join(__dirname, "..", "app", "store", "feature-graphic-1024x500.png");

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    width:1024px;height:500px;overflow:hidden;
    background:
      radial-gradient(ellipse 700px 420px at 78% 18%, rgba(240,180,41,.22), transparent 70%),
      #0B0E14;
    color:#F7F4EE;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Arial,sans-serif;
    display:flex;align-items:center;
  }
  .left{padding:0 0 0 68px;width:600px}
  .mark{display:flex;align-items:center;gap:13px;margin-bottom:30px}
  .mark svg{width:38px;height:38px}
  .mark span{font-size:26px;font-weight:650;letter-spacing:-.03em}
  h1{font-size:56px;line-height:1.06;letter-spacing:-.035em;font-weight:600;margin-bottom:20px}
  h1 em{font-style:italic;font-family:"Iowan Old Style",Georgia,serif;font-weight:400;color:#F0B429}
  p{font-size:20px;line-height:1.5;color:#AAB2C0;max-width:30ch}
  .tags{display:flex;gap:9px;margin-top:26px}
  .tags b{
    font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;font-weight:500;
    letter-spacing:.13em;text-transform:uppercase;color:#AAB2C0;
    border:1px solid rgba(247,244,238,.18);border-radius:100px;padding:6px 13px;
  }
  .right{position:relative;flex:1;height:100%}
  .dial{
    position:absolute;top:50%;right:78px;transform:translateY(-50%);
    width:250px;height:250px;
  }
  .dial text{fill:#F7F4EE;font-family:inherit}
  .num{font-size:76px;font-weight:600;letter-spacing:-.045em}
  .of{font-size:15px;fill:#7F8899;font-family:ui-monospace,Menlo,monospace;letter-spacing:.14em}
</style></head><body>
  <div class="left">
    <div class="mark">
      <svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5.3" fill="#F0B429"/>
      <circle cx="12" cy="12" r="7.56" fill="none" stroke="#0B0E14" stroke-width="2.5" opacity=".2"/>
      <circle cx="12" cy="12" r="7.56" fill="none" stroke="#0B0E14" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="35.6 11.9" transform="rotate(-90 12 12)"/>
      <path d="M9 12.12l2.09 2.09 4.22-4.49" fill="none" stroke="#0B0E14" stroke-width="2.16" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>resume rubric<span style="color:#F0B429">.</span></span>
    </div>
    <h1>Know why your resume<br>is <em>losing</em>, line by line.</h1>
    <p>Scores against the real job posting. Shows its whole rubric. Never invents a number.</p>
    <div class="tags"><b>No signup</b><b>Works offline</b><b>Nothing uploaded</b></div>
  </div>
  <div class="right">
    <svg class="dial" viewBox="0 0 260 260">
      <circle cx="130" cy="130" r="104" fill="none" stroke="#232937" stroke-width="18"/>
      <circle cx="130" cy="130" r="104" fill="none" stroke="#F0B429" stroke-width="18"
              stroke-linecap="round" stroke-dasharray="653" stroke-dashoffset="176"
              transform="rotate(-90 130 130)"/>
      <text class="num" x="130" y="146" text-anchor="middle">73</text>
      <text class="of" x="130" y="176" text-anchor="middle">OUT OF 100</text>
    </svg>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT, type: "png" });
  await browser.close();
  const fs = require("fs");
  const b = fs.readFileSync(OUT);
  console.log("  feature-graphic-1024x500.png  " + b.readUInt32BE(16) + "x" + b.readUInt32BE(20) +
              "  " + (b.length / 1024).toFixed(0) + " KB");
})();

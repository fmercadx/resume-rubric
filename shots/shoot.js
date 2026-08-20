/* Store screenshots at the exact sizes Google and Apple require.

   Google Play phone : 1080 x 1920   (360 css at 3x)
   Apple 6.7 inch    : 1290 x 2796   (430 css at 3x)

   Every shot is the real app in a real state, driven through the sample resume.
   Nothing here is a mockup. */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE || "https://resume-rubric-production.up.railway.app/";
const OUT = path.join(__dirname, "..", "app", "store", "screenshots");
const wait = ms => new Promise(r => setTimeout(r, ms));

const DEVICES = [
  { name: "play", css: [360, 640], scale: 3 },
  { name: "ios67", css: [430, 932], scale: 3 }
];

/* put a chosen element just under the sticky nav, so the shot is framed on it */
async function frame(page, selector, offset) {
  await page.evaluate((sel, off) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error("nothing matches " + sel);
    const y = el.getBoundingClientRect().top + window.scrollY - (off || 70);
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
  }, selector, offset);
  await wait(500);
}

const SHOTS = [
  {
    file: "1-score",
    run: async page => { await frame(page, ".res-top", 64); }
  },
  {
    file: "2-action-plan",
    run: async page => {
      await page.evaluate(() => document.querySelector('#res .tab[data-panel="p-plan"]').click());
      await wait(400);
      await frame(page, "#finishBox", 64);
    }
  },
  {
    file: "3-rewrite",
    run: async page => {
      await page.evaluate(() => document.querySelector('#res .tab[data-panel="p-rewrites"]').click());
      await wait(400);
      await frame(page, "#p-rewrites .rw", 64);
    }
  },
  {
    file: "4-export-proof",
    run: async page => {
      await page.evaluate(() => document.querySelector('#res .tab[data-panel="p-export"]').click());
      await wait(400);
      await page.evaluate(() => document.getElementById("verifyRt").click());
      await wait(3500);
      await frame(page, "#rtResult", 64);
      await page.evaluate(() => {
        const w = document.querySelector("#rtResult .tbl-wrap");
        if (w) w.scrollLeft = w.scrollWidth;
      });
      await wait(300);
    }
  },
  {
    file: "5-fields",
    run: async page => { await frame(page, "#fields .pops, #fields .fields", 90); }
  },
  {
    file: "6-privacy",
    run: async page => { await frame(page, "#compare .tbl-wrap", 80); }
  }
];

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb", "--hide-scrollbars"]
  });

  let made = 0;
  for (const dev of DEVICES) {
    const page = await browser.newPage();
    await page.setViewport({
      width: dev.css[0], height: dev.css[1],
      deviceScaleFactor: dev.scale, isMobile: true, hasTouch: true
    });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(SITE, { waitUntil: "networkidle2", timeout: 60000 });
    await wait(1200);

    /* load the sample through the page itself, since a synthetic click gets intercepted */
    /* the browser install button means nothing in a store listing */
    await page.evaluate(() => {
      const b = document.getElementById("installBtn");
      if (b) b.remove();
    });

    await page.evaluate(() => document.getElementById("sampleBtn").click());
    await wait(1800);

    const ok = await page.evaluate(() => ({
      words: document.getElementById("resumeCount").textContent,
      showing: document.getElementById("res").classList.contains("on")
    }));
    if (!ok.showing) { console.log("  " + dev.name + ": sample did not load, skipping"); await page.close(); continue; }
    console.log("  " + dev.name + ": sample loaded, " + ok.words);

    for (const shot of SHOTS) {
      try {
        await shot.run(page);
        const file = path.join(OUT, dev.name + "-" + shot.file + ".png");
        await page.screenshot({ path: file, type: "png" });
        const st = fs.statSync(file);
        console.log("    " + path.basename(file) + "  " + (st.size / 1024).toFixed(0) + " KB");
        made++;
      } catch (e) {
        console.log("    FAILED " + shot.file + ": " + e.message.split("\n")[0]);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log("\n" + made + " screenshots in app/store/screenshots/");
})();

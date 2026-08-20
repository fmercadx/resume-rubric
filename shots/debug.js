const puppeteer = require("puppeteer");
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });

  page.on("console", m => console.log("  [page] " + m.text().slice(0, 120)));
  page.on("pageerror", e => console.log("  [error] " + e.message.slice(0, 150)));

  await page.goto("https://resume-rubric-production.up.railway.app/", { waitUntil: "networkidle2" });
  await wait(1500);

  console.log("before:", await page.evaluate(() => ({
    btnExists: !!document.getElementById("sampleBtn"),
    words: document.getElementById("resumeCount").textContent,
    resultsShowing: document.getElementById("res").classList.contains("on")
  })));

  await page.evaluate(() => document.getElementById("sampleBtn").click());
  await wait(2000);

  console.log("after: ", await page.evaluate(() => ({
    words: document.getElementById("resumeCount").textContent,
    resultsShowing: document.getElementById("res").classList.contains("on"),
    score: document.getElementById("scoreNum") && document.getElementById("scoreNum").textContent,
    finishBox: !!document.getElementById("finishBox"),
    verifyBtn: !!document.getElementById("verifyRt"),
    tabs: [...document.querySelectorAll("#res .tab")].map(t => t.dataset.panel)
  })));

  await browser.close();
})();

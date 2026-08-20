/* Loads the built app bundle exactly as it ships inside the binary and fails on
   any error thrown at startup.

   This exists because the app build strips the pricing section, and a script was
   binding a click handler to a link that lived inside it. Unguarded, that threw
   on launch and killed everything set up after it, including the theme. Nothing
   in the browser or on the website showed it, because the website still has the
   section. Run this after every prepare-www.js. */

const puppeteer = require("puppeteer");
const path = require("path");
const { pathToFileURL } = require("url");

const BUNDLE = path.join(__dirname, "..", "app", "www", "index.html");

/* things the app build is supposed to have removed, and things it must keep */
const MUST_NOT_CONTAIN = ["The product is free", 'href="#pricing"', '"price":"0"'];
const MUST_CONTAIN = ["nativeSave", 'id="analyzer"', "Resume Rubric"];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
  const page = await browser.newPage();

  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => {
    /* a file:// load cannot fetch the manifest, and that is an artefact of testing
       this way rather than a fault in the app, which serves it locally */
    const t = m.text();
    if (m.type() === "error" && !/manifest|CORS|ERR_FAILED|ERR_FILE_NOT_FOUND/i.test(t)) errors.push(t);
  });

  await page.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true });
  await page.goto(pathToFileURL(BUNDLE).href, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 900));

  const fs = require("fs");
  const src = fs.readFileSync(BUNDLE, "utf8");
  const leftover = MUST_NOT_CONTAIN.filter(t => src.includes(t));
  const missing = MUST_CONTAIN.filter(t => !src.includes(t));

  const page_ = await page.evaluate(() => ({
    dead: [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute("href"))
      .filter(h => h.length > 1 && !document.querySelector(h)),
    themeWorks: !!document.getElementById("themeBtn"),
    sideways: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));

  let bad = 0;
  const say = (ok, label, detail) => {
    if (!ok) bad++;
    console.log("  " + (ok ? "ok  " : "FAIL") + "  " + label + (detail ? "   " + detail : ""));
  };

  say(!errors.length, "no errors thrown at startup", errors.slice(0, 2).join(" | "));
  say(!leftover.length, "price claims stripped", leftover.join(", "));
  say(!missing.length, "app specific code present", missing.join(", "));
  say(!page_.dead.length, "no links point at removed sections", page_.dead.join(", "));
  say(page_.themeWorks, "theme control still on the page");
  say(!page_.sideways, "no sideways scroll");

  await browser.close();
  console.log(bad ? "\n  " + bad + " problems in the app bundle" : "\n  app bundle is sound");
  process.exit(bad ? 1 : 0);
})();

/* Checks that no page scrolls sideways at the widths real phones use, and names
   whatever is sticking out when one does.

   This catches the class of bug where a single fixed width element in a flex row
   quietly drags the whole document wider than the screen. It is invisible on a
   desktop and obvious on a phone.

   Start the server, then run this. Set SITE to check the deployed site instead.
   Exits non zero if anything overflows, so it can gate a release. */

const puppeteer = require("puppeteer");

const WIDTHS = [320, 360, 390, 430, 560, 768];
const SITE = (process.env.SITE || "http://localhost:8731").replace(/[/]+$/, "");

/* every page the site serves. They share some styles and diverge in others, so
   each one has to be measured on its own. */
const PAGES = [
  "/", "/for-organizations", "/privacy",
  "/nurse-resume-checker", "/electrician-resume-checker", "/teacher-resume-checker",
  "/cdl-driver-resume-checker", "/accountant-resume-checker",
  "/free-resume-checker-no-signup", "/ats-resume-checker", "/veteran-resume-checker"
];

function measure() {
  const vw = document.documentElement.clientWidth;
  const over = [];

  document.querySelectorAll("*").forEach(el => {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const right = r.right + window.scrollX;
    if (right <= vw + 1) return;

    /* a fixed element is out of flow and cannot widen the document, so it is
       noise in this report even when it sits past the edge */
    if (getComputedStyle(el).position === "fixed") return;

    /* report the outermost offender only, not every child it drags with it */
    const p = el.parentElement;
    if (p && p.getBoundingClientRect().right + window.scrollX > vw + 1) return;

    /* anything inside a box that is meant to scroll sideways, such as a wide
       table or the tab strip, is contained and not the problem */
    let anc = el.parentElement, contained = false;
    while (anc && anc !== document.body) {
      const ox = getComputedStyle(anc).overflowX;
      if (ox === "auto" || ox === "scroll") { contained = true; break; }
      anc = anc.parentElement;
    }
    if (contained) return;

    const cls = typeof el.className === "string" && el.className
      ? "." + el.className.trim().split(/\s+/).join(".") : "";
    over.push("<" + el.tagName.toLowerCase() + (el.id ? " #" + el.id : "") + cls +
              ">  " + Math.round(r.width) + "px wide, right edge at " + Math.round(right));
  });

  /* a wide table in a scrolling box does not break the page, but on a phone it
     reads as cut off rather than as scrollable, so it is worth reporting too */
  const tables = [...document.querySelectorAll(".tbl-wrap")]
    .filter(el => el.scrollWidth > el.clientWidth + 1)
    .map(el => {
      const sec = el.closest("section");
      return (sec && sec.id ? "#" + sec.id : "a table") + " cut off by " +
             (el.scrollWidth - el.clientWidth) + "px";
    });

  return { vw, doc: document.documentElement.scrollWidth, over, tables };
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
  let bad = 0;

  for (const path of PAGES) {
    const failures = [];

    for (const w of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({
        width: w, height: 800, deviceScaleFactor: 1,
        isMobile: w < 800, hasTouch: w < 800
      });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.goto(SITE + path, { waitUntil: "networkidle2", timeout: 45000 });

      /* the install button only appears once the browser offers it, and that is
         the state that broke the nav, so force it on where it exists */
      await page.evaluate(() => {
        const b = document.getElementById("installBtn");
        if (b) b.hidden = false;
      });
      await new Promise(r => setTimeout(r, 350));

      const res = await page.evaluate(measure);

      /* 320 is narrow enough that a four column table genuinely cannot fit, so
         tables are only held to account from 360 up, which is where real phones
         mostly sit */
      if (res.tables.length && w >= 360) {
        bad++;
        res.tables.forEach(t => failures.push("      " + String(w).padStart(3) + "px  " + t));
      }

      if (res.doc > res.vw + 1) {
        bad++;
        failures.push("      " + String(w).padStart(3) + "px  document is " + res.doc + " wide");
        res.over.forEach(o => failures.push("            " + o));
      }
      await page.close();
    }

    console.log("  " + (failures.length ? "FAIL" : "ok  ") + "  " + path);
    failures.forEach(l => console.log(l));
  }

  await browser.close();
  console.log(bad
    ? "\n  " + bad + " problems found"
    : "\n  every page fits its screen at every width, and no table is cut off");
  process.exit(bad ? 1 : 0);
})();

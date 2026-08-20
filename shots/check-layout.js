/* Checks the page does not scroll sideways at the widths real phones use, and
   names whatever is sticking out when it does.

   This catches the class of bug where one fixed width element in a flex row
   quietly drags the whole document wider than the screen. Start the server, then
   run this. */
const puppeteer = require("puppeteer");

const WIDTHS = [320, 360, 390, 430, 560, 768];
const SITE = process.env.SITE || "http://localhost:8731/";

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
  let bad = 0;

  for (const w of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(SITE, { waitUntil: "networkidle2" });
    /* the install button only appears once the browser offers it, and that is the
       state that used to break the nav, so force it on */
    await page.evaluate(() => { const b = document.getElementById("installBtn"); if (b) b.hidden = false; });
    await new Promise(r => setTimeout(r, 400));

    const res = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [];
      document.querySelectorAll("*").forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        const right = r.right + window.scrollX;
        if (right <= vw + 1) return;
        const p = el.parentElement;
        if (p && p.getBoundingClientRect().right + window.scrollX > vw + 1) return;  // report the outermost only
        /* anything inside a box that is meant to scroll sideways, such as the
           tables or the tab strip, is contained and not the problem */
        let anc = el.parentElement, contained = false;
        while (anc && anc !== document.body) {
          const ox = getComputedStyle(anc).overflowX;
          if (ox === "auto" || ox === "scroll") { contained = true; break; }
          anc = anc.parentElement;
        }
        if (contained) return;
        over.push("<" + el.tagName.toLowerCase() + (el.id ? " #" + el.id : "") +
          (typeof el.className === "string" && el.className ? " ." + el.className.trim().split(/\s+/).join(".") : "") +
          ">  right edge " + Math.round(right));
      });
      const tables = [...document.querySelectorAll(".tbl-wrap")]
        .filter(el => el.scrollWidth > el.clientWidth + 1)
        .map(el => (el.closest("section") ? "#" + el.closest("section").id : "table") +
          " scrolls by " + (el.scrollWidth - el.clientWidth) + "px");
      return { vw, doc: document.documentElement.scrollWidth, over, tables };
    });

    const scrolls = res.doc > res.vw + 1;
    if (scrolls) bad++;
    console.log("  " + (scrolls ? "FAIL" : "ok  ") + "  " + String(w).padStart(3) + "px" +
      (scrolls ? "   page is " + res.doc + " wide" : "") +
      (res.tables.length ? "   (" + res.tables.join(", ") + ")" : ""));
    res.over.forEach(o => console.log("           " + o));
    await page.close();
  }

  await browser.close();
  console.log(bad ? "\n  " + bad + " width(s) scroll sideways" : "\n  no sideways scroll at any width");
  process.exit(bad ? 1 : 0);
})();

/* Resume Rubric static host.
   No dependencies, matching the app itself. The whole product is one HTML file, so every
   route serves that file and nothing else is reachable: no directory listing, no stray
   files. Resume data never reaches this server, because the engine runs in the browser. */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "index.html");
const ORG_FILE = path.join(__dirname, "organizations.html");

let html, orgHtml;
try {
  html = fs.readFileSync(FILE);
  orgHtml = fs.readFileSync(ORG_FILE);
} catch (e) {
  console.error("Could not read a page file:", e.message);
  process.exit(1);
}

/* Exactly two pages are reachable. Everything else falls through to the app, so there is
   still no directory listing and no stray file is exposed. */
const ORG_PATHS = new Set(["/for-organizations", "/for-organizations/", "/organizations", "/organizations/"]);

/* ----------------------------------------------------------------------
   Field pages.

   One page per kind of work, built at startup from fields.json. They exist
   because nobody searching "electrician resume checker" is served today, and
   the advice on each page is specific enough to be worth reading on its own.
   Each one links into the tool with that field already chosen.
   ---------------------------------------------------------------------- */

let FIELD_DATA = { site: "", fields: [] };
try {
  FIELD_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "fields.json"), "utf8"));
} catch (e) {
  console.error("fields.json missing, field pages disabled:", e.message);
}
const SITE = process.env.SITE_URL || FIELD_DATA.site || "";

function esc(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fieldPage(f) {
  const url = SITE + "/" + f.slug;
  const li = a => a.map(x => "<li>" + esc(x) + "</li>").join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(f.title)}</title>
<meta name="description" content="${esc(f.lede)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(f.title)}">
<meta property="og:description" content="${esc(f.lede)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"Resume Rubric",
"applicationCategory":"BusinessApplication","operatingSystem":"Any",
"url":"${url}","description":"${esc(f.lede)}",
"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
</script>
<style>
:root{--bg:#0B0E14;--surface:#12161F;--surface-2:#1A1F2B;--border:rgba(247,244,238,.10);
--text:#F7F4EE;--muted:#AAB2C0;--faint:#7F8899;--accent:#F0B429;--accent-ink:#0B0E14;
--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Arial,sans-serif;
--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--r:14px}
@media (prefers-color-scheme:light){:root{--bg:#F7F4EE;--surface:#FFF;--surface-2:#F2EEE5;
--border:rgba(11,14,20,.13);--text:#14181F;--muted:#4B5361;--faint:#5A6270;--accent:#9A6206;--accent-ink:#FFF}}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--sans);line-height:1.65}
.wrap{max-width:780px;margin:0 auto;padding:0 1.25rem}
header{border-bottom:1px solid var(--border)}
.nav{display:flex;align-items:center;gap:.6rem;height:58px;font-weight:650;letter-spacing:-.03em;text-decoration:none;color:inherit}
.mark{width:22px;height:22px}
h1{font-size:clamp(1.9rem,5vw,2.9rem);letter-spacing:-.035em;line-height:1.1;margin:2.5rem 0 1rem}
h2{font-size:1.3rem;letter-spacing:-.02em;margin:2.25rem 0 .75rem}
p{margin:0 0 1rem}
.lede{font-size:1.0625rem;color:var(--muted)}
ul{margin:0 0 1rem;padding-left:1.15rem;color:var(--muted)}
li{margin-bottom:.35rem}
.btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--accent);color:var(--accent-ink);
padding:.75rem 1.3rem;border-radius:100px;text-decoration:none;font-weight:650;margin:.5rem 0 1.5rem}
.card{border:1px solid var(--border);background:var(--surface);border-radius:var(--r);padding:1.15rem;margin-bottom:1.25rem}
.card h3{margin:0 0 .5rem;font-size:1rem}
.tags{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 1.25rem;padding:0;list-style:none}
.tags li{font-family:var(--mono);font-size:.75rem;border:1px solid var(--border);
background:var(--surface-2);color:var(--muted);border-radius:100px;padding:.25rem .6rem;margin:0}
.note{font-size:.875rem;color:var(--faint);border-left:2px solid var(--accent);padding-left:.85rem;margin:1.5rem 0}
footer{border-top:1px solid var(--border);margin-top:3rem;padding:1.5rem 0;font-size:.8125rem;color:var(--faint)}
footer a{color:var(--faint)}
</style>
</head>
<body>
<header><div class="wrap"><a href="/" class="nav">
<svg class="mark" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" rx="6" fill="var(--accent)"/>
<path d="M6.5 12.2l3.2 3.3 7.8-7.4" stroke="var(--accent-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
resume rubric<span style="color:var(--accent)">.</span></a></div></header>
<main class="wrap">
<h1>${esc(f.h1)}</h1>
<p class="lede">${esc(f.lede)}</p>
<a class="btn" href="/?field=${esc(f.key)}">Check my resume now</a>
<p style="font-size:.875rem;color:var(--faint)">Free. No signup. Works for ${esc(f.who)}.</p>

<h2>What counts as a number in this work</h2>
<p>The single biggest thing separating a resume that gets a call from one that does not is whether the claims can be checked. In this field, these are the figures that do it:</p>
<ul>${li(f.numbers)}</ul>

<h2>What it looks for</h2>
<div class="card"><h3>Credentials</h3>
<ul class="tags">${li(f.creds)}</ul>
<p style="margin:0;font-size:.875rem;color:var(--muted)">Missing any of these when the posting asks for them costs you points, and often costs you the screen.</p></div>
<div class="card"><h3>Strong verbs for this field</h3>
<ul class="tags">${li(f.verbs)}</ul>
<p style="margin:0;font-size:.875rem;color:var(--muted)">Bullets that open on one of these read as work you did. Bullets that open on "Responsible for" read as a job description.</p></div>

<h2>The mistake almost everyone makes</h2>
<p>${esc(f.trap)}</p>

<div class="note">Your resume is never uploaded. The whole scoring engine is inside the page, so it runs on your own machine. Turn off your wifi and it still works.</div>

<a class="btn" href="/?field=${esc(f.key)}">Score my resume</a>
</main>
<footer class="wrap">
<a href="/">The tool</a> &middot; <a href="/for-organizations">For organizations</a> &middot;
<a href="https://github.com/fmercadx/resume-rubric">Source</a> &middot; AGPL-3.0
</footer>
</body>
</html>`;
}

const FIELD_PAGES = {};
(FIELD_DATA.fields || []).forEach(f => { FIELD_PAGES["/" + f.slug] = Buffer.from(fieldPage(f)); });

const ROBOTS = "User-agent: *\nAllow: /\nDisallow: /stats\nSitemap: " + SITE + "/sitemap.xml\n";

function sitemap() {
  const urls = ["/", "/for-organizations"].concat(Object.keys(FIELD_PAGES));
  const today = new Date().toISOString().slice(0, 10);
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(u => "<url><loc>" + SITE + u + "</loc><lastmod>" + today +
      "</lastmod><changefreq>weekly</changefreq><priority>" + (u === "/" ? "1.0" : "0.8") + "</priority></url>").join("") +
    "</urlset>";
}

/* ----------------------------------------------------------------------
   Visit counting.

   Counted here on the server, from the request the browser already makes to
   fetch the page. The page itself sends nothing back, so running an analysis
   is still zero network calls and the privacy promise holds.

   Stored: a running total and a count per day. That is the entire file.
   Not stored: no IP address, no user agent, no referrer, no cookie, no
   session, nothing tied to a person, and never any resume text.
   ---------------------------------------------------------------------- */

const DATA_DIR = fs.existsSync("/data") ? "/data" : __dirname;
const STATS_FILE = path.join(DATA_DIR, "stats.json");
const KEEP_DAYS = 400;

let stats = { started: null, app: 0, organizations: 0, fields: 0, days: {} };
let dirty = false;

try {
  const parsed = JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  if (parsed && typeof parsed === "object") stats = Object.assign(stats, parsed);
} catch (e) {
  /* first run, or an empty volume. Start fresh. */
}
if (!stats.started) { stats.started = new Date().toISOString().slice(0, 10); dirty = true; }

function record(which) {
  const d = new Date().toISOString().slice(0, 10);
  stats[which] = (stats[which] || 0) + 1;
  if (!stats.days[d]) stats.days[d] = { app: 0, organizations: 0, fields: 0 };
  stats.days[d][which] = (stats.days[d][which] || 0) + 1;
  dirty = true;
}

function flush() {
  if (!dirty) return;
  const keys = Object.keys(stats.days).sort();
  while (keys.length > KEEP_DAYS) delete stats.days[keys.shift()];
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats));
    dirty = false;
  } catch (e) {
    /* read only disk. Keep counting in memory rather than falling over. */
  }
}

/* write at most once every 20 seconds, so a rush of traffic is not a rush of disk writes */
setInterval(flush, 20000).unref();

/* Railway sends SIGTERM on every deploy and restart. Without this, up to twenty
   seconds of counts are thrown away each time the service ships. */
["SIGTERM", "SIGINT"].forEach(sig => {
  process.on(sig, () => { flush(); process.exit(0); });
});
process.on("exit", flush);

function summary() {
  const days = Object.keys(stats.days).sort();
  const last = days.slice(-30);
  const recent = last.reduce((a, d) =>
    a + (stats.days[d].app || 0) + (stats.days[d].organizations || 0) + (stats.days[d].fields || 0), 0);
  return {
    since: stats.started,
    visits: {
      app: stats.app,
      organizations: stats.organizations,
      fieldPages: stats.fields || 0,
      total: stats.app + stats.organizations + (stats.fields || 0)
    },
    last30Days: recent,
    daysRecorded: days.length,
    byDay: last.reduce((o, d) => { o[d] = stats.days[d]; return o; }, {}),
    note: "Counted on the server from page requests. No IP addresses, user agents, cookies or resume data are stored."
  };
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",      // the engine is inlined in the page
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",                   // the grain texture is a data URI
  "connect-src https:",                     // the opt-in job feed reaches public job board APIs
  "form-action 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'"
].join("; ");

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    return res.end("ok");
  }

  /* the numbers are public, the same as the rubric is */
  if (url === "/stats" || url === "/stats.json") {
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    });
    return res.end(JSON.stringify(summary(), null, 2));
  }

  if (url === "/robots.txt") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" });
    return res.end(ROBOTS);
  }
  if (url === "/sitemap.xml") {
    res.writeHead(200, { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" });
    return res.end(sitemap());
  }
  if (FIELD_PAGES[url] || FIELD_PAGES[url.replace(/\/$/, "")]) {
    const page = FIELD_PAGES[url] || FIELD_PAGES[url.replace(/\/$/, "")];
    if (req.method === "GET") record("fields");
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "content-length": page.length,
      "cache-control": "public, max-age=600",
      "content-security-policy": CSP,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    });
    if (req.method === "HEAD") return res.end();
    return res.end(page);
  }

  const isOrg = ORG_PATHS.has(url);
  const body = isOrg ? orgHtml : html;
  if (req.method === "GET") record(isOrg ? "organizations" : "app");

  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "content-length": body.length,
    "cache-control": "public, max-age=300",
    "content-security-policy": CSP,
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "geolocation=(), camera=(), microphone=()"
  });
  if (req.method === "HEAD") return res.end();
  res.end(body);
});

server.listen(PORT, () => {
  console.log("Resume Rubric listening on " + PORT +
    " (app " + (html.length / 1024).toFixed(1) + " KB, organizations " + (orgHtml.length / 1024).toFixed(1) + " KB)" +
    " with " + Object.keys(FIELD_PAGES).length + " field pages, counting to " + STATS_FILE);
});

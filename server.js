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

let stats = { started: null, app: 0, organizations: 0, days: {} };
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
  if (!stats.days[d]) stats.days[d] = { app: 0, organizations: 0 };
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
    a + (stats.days[d].app || 0) + (stats.days[d].organizations || 0), 0);
  return {
    since: stats.started,
    visits: {
      app: stats.app,
      organizations: stats.organizations,
      total: stats.app + stats.organizations
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
    " counting to " + STATS_FILE);
});

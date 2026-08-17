/* Shortlist static host.
   No dependencies, matching the app itself. The whole product is one HTML file, so every
   route serves that file and nothing else is reachable: no directory listing, no stray
   files. Resume data never reaches this server, because the engine runs in the browser. */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "index.html");

let html;
try {
  html = fs.readFileSync(FILE);
} catch (e) {
  console.error("Could not read index.html:", e.message);
  process.exit(1);
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
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    return res.end("ok");
  }
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "content-length": html.length,
    "cache-control": "public, max-age=300",
    "content-security-policy": CSP,
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "geolocation=(), camera=(), microphone=()"
  });
  if (req.method === "HEAD") return res.end();
  res.end(html);
});

server.listen(PORT, () => {
  console.log("Shortlist listening on " + PORT + " (" + (html.length / 1024).toFixed(1) + " KB)");
});

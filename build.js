/* Builds the static site into docs/, which GitHub Pages serves for free.

   There is no server in this version, so the field pages are written out as real
   files instead of being generated per request, and the visit counter is gone.
   Every internal link is made relative, because Pages serves the site from a
   subpath rather than the root of a domain. */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "docs");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "fields.json"), "utf8"));
/* Where these files are served from. */
const MIRROR = "https://fmercadx.github.io/resume-rubric";
/* Where the real site lives. Canonical tags point here, so a search engine treats
   this build as a copy of that site rather than a second site competing with it. */
const SITE = process.env.SITE_URL || "https://resume-rubric-production.up.railway.app";

function esc(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* depth 0 is docs/index.html, depth 1 is docs/something/index.html */
function noindex(html) {
  return html.replace(/<meta name="robots"[^>]*>/,
    '<meta name="robots" content="noindex, follow">');
}

function relink(html, depth) {
  const up = depth === 0 ? "" : "../";
  let s = html;

  // the tool, with or without a query string
  s = s.split('href="/?').join('href="' + (up || "./") + "?");
  s = s.split('href="/"').join('href="' + (up || "./") + '"');

  // the organizations page
  s = s.split('href="/for-organizations"').join('href="' + up + 'for-organizations/"');
  s = s.split('href="/organizations"').join('href="' + up + 'for-organizations/"');

  // every field guide
  DATA.fields.forEach(f => {
    s = s.split('href="/' + f.slug + '"').join('href="' + up + f.slug + '/"');
  });

  return s;
}

/* the counter needs a server, so any promise about it has to come out */
function dropStats(html) {
  return html
    .replace(
      /<p>The server counts how many times each page was opened[\s\S]*?<\/p>/,
      ""
    )
    .replace(
      "<b>What do you retain?</b> A count of page visits per day, and nothing else. No database of people, no accounts.",
      "<b>What do you retain?</b> Nothing. There is no server, no database and no accounts."
    )
    .replace(
      "<b>Any third party processors?</b> None. No analytics service, no trackers, no ad pixels, no outside services. We count page opens ourselves, in one number a day.",
      "<b>Any third party processors?</b> None. No analytics, no trackers, no ad pixels, no outside services."
    );
}

function fieldPage(f) {
  const url = SITE + "/" + f.slug + "/";
  const li = a => a.map(x => "<li>" + esc(x) + "</li>").join("");
  const others = DATA.fields.filter(o => o.slug !== f.slug)
    .map(o => '<li><a href="../' + o.slug + '/" style="color:var(--muted)">' + esc(o.label || o.slug) + "</a></li>").join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(f.title)}</title>
<meta name="description" content="${esc(f.lede)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
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
.tags li a{text-decoration:none}
.note{font-size:.875rem;color:var(--faint);border-left:2px solid var(--accent);padding-left:.85rem;margin:1.5rem 0}
footer{border-top:1px solid var(--border);margin-top:3rem;padding:1.5rem 0;font-size:.8125rem;color:var(--faint)}
footer a{color:var(--faint)}
</style>
</head>
<body>
<header><div class="wrap"><a href="../" class="nav">
<svg class="mark" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5.3" fill="#0B0E14"/>
<circle cx="12" cy="12" r="7.56" fill="none" stroke="#F7F4EE" stroke-width="2.5" opacity=".16"/>
<circle cx="12" cy="12" r="7.56" fill="none" stroke="#F0B429" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="35.6 11.9" transform="rotate(-90 12 12)"/>
<path d="M9 12.12l2.09 2.09 4.22-4.49" fill="none" stroke="#F7F4EE" stroke-width="2.16" stroke-linecap="round" stroke-linejoin="round"/></svg>
resume rubric<span style="color:var(--accent)">.</span></a></div></header>
<main class="wrap">
<h1>${esc(f.h1)}</h1>
<p class="lede">${esc(f.lede)}</p>
<a class="btn" href="../?field=${esc(f.key)}">Check my resume now</a>
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

<a class="btn" href="../?field=${esc(f.key)}">Score my resume</a>

<h2>Guides for other kinds of work</h2>
<ul class="tags">${others}</ul>
</main>
<footer class="wrap">
<a href="../">The tool</a> &middot; <a href="../for-organizations/">For organizations</a> &middot;
<a href="https://github.com/fmercadx/resume-rubric">Source</a> &middot; AGPL-3.0
</footer>
</body>
</html>`;
}

/* ---------------- build ---------------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/* Pages does not need Jekyll, and Jekyll would skip files starting with an underscore */
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

let app = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
app = relink(app, 0).split(SITE.replace(/\/$/, "") + "/").join(SITE + "/");
app = app.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + SITE + '/">');
app = app.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + SITE + '/">');
fs.writeFileSync(path.join(OUT, "index.html"), noindex(app));

let org = fs.readFileSync(path.join(__dirname, "organizations.html"), "utf8");
org = dropStats(relink(org, 1));
org = org.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + SITE + '/for-organizations/">');
org = org.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + SITE + '/for-organizations/">');
fs.mkdirSync(path.join(OUT, "for-organizations"), { recursive: true });
fs.writeFileSync(path.join(OUT, "for-organizations", "index.html"), noindex(org));

let priv = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");
priv = noindex(relink(priv, 1));
fs.mkdirSync(path.join(OUT, "privacy"), { recursive: true });
fs.writeFileSync(path.join(OUT, "privacy", "index.html"), priv);

DATA.fields.forEach(f => {
  fs.mkdirSync(path.join(OUT, f.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, f.slug, "index.html"), noindex(fieldPage(f)));
});



/* the copy stays out of search results, the real site carries the sitemap */
fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");

/* the files that make it installable copy across unchanged */
["manifest.webmanifest","sw.js"].forEach(f=>fs.copyFileSync(path.join(__dirname,f),path.join(OUT,f)));
fs.mkdirSync(path.join(OUT,"icons"),{recursive:true});
["icon-192.png","icon-512.png","apple-touch-icon.png"].forEach(f=>
  fs.copyFileSync(path.join(__dirname,"icons",f),path.join(OUT,"icons",f)));

console.log("built " + (2 + DATA.fields.length) + " pages into docs/");
console.log("  mirror of " + SITE + ", not indexed");

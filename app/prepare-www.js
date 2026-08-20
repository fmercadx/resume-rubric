/* Copies the web app into www/ for the native shell, and swaps the browser download
   for the native one.

   The whole app is bundled into the binary rather than loaded from a website. That
   matters for two reasons: it works with no connection, and Apple rejects apps that
   are only a wrapper around a remote page (their guideline 4.2). */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WWW = path.join(__dirname, "www");

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(path.join(WWW, "icons"), { recursive: true });

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/* 1. Saving a file: a browser uses a download link, which does nothing inside an app.
      Write it to the device and hand it to the share sheet instead. */
const OLD_SAVE = `      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url; a.download=name; document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },1500);
      toast("Built "+name+", "+(blob.size/1024).toFixed(1)+" KB");`;

const NEW_SAVE = `      if(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()){
        nativeSave(blob,name);
      } else {
        var url=URL.createObjectURL(blob);
        var a=document.createElement("a");
        a.href=url; a.download=name; document.body.appendChild(a); a.click();
        setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },1500);
        toast("Built "+name+", "+(blob.size/1024).toFixed(1)+" KB");
      }`;

if (html.split(OLD_SAVE).length - 1 !== 1) {
  console.error("  could not find the download code to replace");
  process.exit(1);
}
html = html.replace(OLD_SAVE, NEW_SAVE);

/* 2. the native save helper, plus the install button is meaningless inside an app */
const HELPER = `
/* ---- running inside the phone app ---- */
function nativeSave(blob,name){
  var reader=new FileReader();
  reader.onloadend=function(){
    var b64=String(reader.result).split(",")[1];
    var FS=window.Capacitor.Plugins.Filesystem, SH=window.Capacitor.Plugins.Share;
    FS.writeFile({path:name,data:b64,directory:"CACHE"})
      .then(function(res){
        toast("Saved "+name);
        return SH.share({title:name,text:"Your resume",url:res.uri});
      })
      .catch(function(){ toast("Could not save the file"); });
  };
  reader.readAsDataURL(blob);
}

(function(){
  if(!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return;
  document.documentElement.classList.add("in-app");
  var b=document.getElementById("installBtn");
  if(b) b.remove();
})();
`;

html = html.replace("counts();\nrenderAll();", HELPER + "\ncounts();\nrenderAll();");

/* 3. no service worker inside the app, the files are already local */
html = html.replace(
  'navigator.serviceWorker.register("/sw.js").catch(function(){});',
  'if(!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) navigator.serviceWorker.register("/sw.js").catch(function(){});'
);

/* 4. links out to the marketing pages would 404 inside the app, so send them to the web */
const SITE = "https://resume-rubric-production.up.railway.app";
html = html.replace(/href="\/for-organizations"/g, 'href="' + SITE + '/for-organizations" target="_blank" rel="noopener"');
[
  "nurse-resume-checker", "electrician-resume-checker", "teacher-resume-checker",
  "cdl-driver-resume-checker", "accountant-resume-checker", "veteran-resume-checker",
  "ats-resume-checker", "free-resume-checker-no-signup"
].forEach(slug => {
  html = html.replace(new RegExp('href="/' + slug + '"', "g"),
    'href="' + SITE + "/" + slug + '" target="_blank" rel="noopener"');
});

/* 5. a bit of breathing room under a phone status bar */
html = html.replace("</style>", `
/* the app draws under the status bar, so the sticky nav needs to clear it */
html.in-app .nav{ padding-top:env(safe-area-inset-top) }
html.in-app body{ padding-bottom:env(safe-area-inset-bottom) }
</style>`);

fs.writeFileSync(path.join(WWW, "index.html"), html);

["icon-192.png", "icon-512.png", "apple-touch-icon.png"].forEach(f =>
  fs.copyFileSync(path.join(ROOT, "icons", f), path.join(WWW, "icons", f)));

console.log("  www/index.html ready, " + (html.length / 1024).toFixed(0) + " KB, fully self contained");

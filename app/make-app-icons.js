/* Writes the icon at every size Android and iOS ask for, reusing the drawing code
   from the web icons so the mark is identical everywhere. */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const gen = require(path.join(ROOT, "icon-lib.js"));

const ANDROID_RES = path.join(__dirname, "android", "app", "src", "main", "res");
const IOS_SET = path.join(__dirname, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset");

/* Android launcher icons, one per density, square and round */
const DENSITIES = [
  ["mdpi", 48], ["hdpi", 72], ["xhdpi", 96], ["xxhdpi", 144], ["xxxhdpi", 192]
];

let n = 0;
DENSITIES.forEach(([d, size]) => {
  const dir = path.join(ANDROID_RES, "mipmap-" + d);
  fs.mkdirSync(dir, { recursive: true });
  const png = gen.icon(size);
  fs.writeFileSync(path.join(dir, "ic_launcher.png"), png);
  fs.writeFileSync(path.join(dir, "ic_launcher_round.png"), gen.icon(size, true));
  fs.writeFileSync(path.join(dir, "ic_launcher_foreground.png"), gen.icon(size, false, true));
  n += 3;
});

/* the Play listing needs a 512 icon, and a 1024 for iOS */
fs.mkdirSync(path.join(__dirname, "store"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "store", "play-icon-512.png"), gen.icon(512));
fs.writeFileSync(path.join(__dirname, "store", "app-store-icon-1024.png"), gen.icon(1024, false, false, true));
n += 2;

/* iOS wants a single 1024 in the asset catalogue for recent Xcode */
fs.mkdirSync(IOS_SET, { recursive: true });
fs.writeFileSync(path.join(IOS_SET, "AppIcon-512@2x.png"), gen.icon(1024, false, false, true));
fs.writeFileSync(path.join(IOS_SET, "Contents.json"), JSON.stringify({
  images: [{ filename: "AppIcon-512@2x.png", idiom: "universal", platform: "ios", size: "1024x1024" }],
  info: { author: "xcode", version: 1 }
}, null, 2));
n += 2;

console.log("  wrote " + n + " icon files");

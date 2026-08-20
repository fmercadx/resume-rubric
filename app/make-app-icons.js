/* Writes the icon at every size Android and iOS ask for, reusing the drawing code
   from the web icons so the mark is identical everywhere. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const gen = require(path.join(ROOT, "icon-lib.js"));

const ANDROID_RES = path.join(__dirname, "android", "app", "src", "main", "res");
const IOS_SET = path.join(__dirname, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset");

/* Legacy launcher icons are sized in the old 48dp grid. The adaptive foreground is
   a different thing: its canvas is 108dp, so it needs its own larger size per
   density or the launcher scales it up and softens the edges. */
const DENSITIES = [
  ["mdpi", 48, 108], ["hdpi", 72, 162], ["xhdpi", 96, 216],
  ["xxhdpi", 144, 324], ["xxxhdpi", 192, 432]
];

let n = 0;
DENSITIES.forEach(([d, legacy, adaptive]) => {
  const dir = path.join(ANDROID_RES, "mipmap-" + d);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "ic_launcher.png"), gen.icon(legacy, {}));
  fs.writeFileSync(path.join(dir, "ic_launcher_round.png"), gen.icon(legacy, { round: true }));
  fs.writeFileSync(path.join(dir, "ic_launcher_foreground.png"), gen.icon(adaptive, { fg: true }));
  n += 3;
});

/* the background layer of the adaptive icon is a flat colour, and it has to be the
   ground the mark was drawn for, or the mark sits on the wrong colour */
const hex = c => "#" + c.map(v => v.toString(16).padStart(2, "0").toUpperCase()).join("");
fs.writeFileSync(path.join(ANDROID_RES, "values", "ic_launcher_background.xml"),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n' +
  '    <color name="ic_launcher_background">' + hex(gen.AMBER) + '</color>\n</resources>\n');
n += 1;

/* the Play listing needs a 512 icon, and a 1024 for iOS */
fs.mkdirSync(path.join(__dirname, "store"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "store", "play-icon-512.png"), gen.icon(512, {}));
fs.writeFileSync(path.join(__dirname, "store", "app-store-icon-1024.png"), gen.icon(1024, { square: true }));
n += 2;

/* iOS wants a single 1024 in the asset catalogue for recent Xcode, with no alpha */
fs.mkdirSync(IOS_SET, { recursive: true });
fs.writeFileSync(path.join(IOS_SET, "AppIcon-512@2x.png"), gen.icon(1024, { square: true }));
fs.writeFileSync(path.join(IOS_SET, "Contents.json"), JSON.stringify({
  images: [{ filename: "AppIcon-512@2x.png", idiom: "universal", platform: "ios", size: "1024x1024" }],
  info: { author: "xcode", version: 1 }
}, null, 2) + "\n");
n += 2;

console.log("  wrote " + n + " icon files");

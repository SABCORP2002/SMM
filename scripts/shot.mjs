// Capture d'écran de dev : node scripts/shot.mjs <url> <largeur> <fichier.png>
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [url = "http://localhost:3000/", width = "1280", out = "shot.png"] =
  process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({
  width: Number(width),
  height: 900,
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("→", out);

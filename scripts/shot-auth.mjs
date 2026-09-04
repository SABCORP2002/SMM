// Connecte le compte démo puis capture des pages de l'espace client.
import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = process.argv[2] || ".";
const width = Number(process.argv[3] || 1280);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });

await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
await page.type('input[name="email"]', "client@example.com");
await page.type('input[name="password"]', "client1234");
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname === "/mon-espace", { timeout: 15000 });
await page.waitForNetworkIdle().catch(() => {});

for (const [path, name] of [
  ["/mon-espace", "dashboard"],
  ["/mon-espace/profil", "profil"],
  ["/mon-espace/parrainage", "parrainage"],
  ["/mon-espace/recharger", "recharger-soon"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`→ ${name}.png`);
}
await browser.close();

import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.E2E_BASE || "http://localhost:3000";
const OUT = process.argv[2] || ".";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 850 });

await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', "client@example.com");
await page.type('input[name="password"]', "client1234");
await page.evaluate(() => { const b = document.querySelector('button[type="submit"]'); b.form.requestSubmit(b); });
await page.waitForFunction(() => location.pathname === "/mon-espace", { timeout: 15000 });

await page.goto(`${BASE}/mon-espace/nouvelle-commande`, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${OUT}/wizard-1-platform.png`, fullPage: true });
console.log("→ wizard-1-platform.png");

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("TikTok"));
  btn.click();
});
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/wizard-2-service.png`, fullPage: true });
console.log("→ wizard-2-service.png");

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Démarrage rapide"));
  btn.click();
});
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/wizard-3-details.png`, fullPage: true });
console.log("→ wizard-3-details.png");

await browser.close();

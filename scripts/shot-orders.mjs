import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = process.argv[2] || ".";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
await page.type('input[name="email"]', "client@example.com");
await page.type('input[name="password"]', "client1234");
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname === "/mon-espace", { timeout: 15000 });

await page.goto(`${BASE}/mon-espace/nouvelle-commande`, { waitUntil: "networkidle0" });
await page.type('input[name="link"]', "https://instagram.com/moncompte");
await page.type('input[name="quantity"]', "2000");
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/nouvelle-commande.png`, fullPage: true });
console.log("→ nouvelle-commande.png");

await page.goto(`${BASE}/mon-espace/commandes`, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${OUT}/commandes.png`, fullPage: true });
console.log("→ commandes.png");

await page.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${OUT}/dashboard2.png`, fullPage: true });
console.log("→ dashboard2.png");

await browser.close();

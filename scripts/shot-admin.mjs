import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.E2E_BASE || "http://localhost:3000";
const OUT = process.argv[2] || ".";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', "admin@jalsmm.com");
await page.type('input[name="password"]', "admin1234");
await page.evaluate(() => {
  const btn = document.querySelector('button[type="submit"]');
  btn.form.requestSubmit(btn);
});
await page.waitForFunction(() => location.pathname === "/admin", { timeout: 15000 });

for (const [path, name] of [
  ["/admin", "admin-dashboard"],
  ["/admin/utilisateurs", "admin-utilisateurs"],
  ["/admin/services", "admin-services"],
  ["/admin/commandes", "admin-commandes"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`→ ${name}.png`);
}
await browser.close();

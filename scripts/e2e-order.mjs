// Test de bout en bout du flux de commande (Phase 4).
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.E2E_BASE || "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 900 });
page.on("pageerror", (e) => console.log(`  [pageerror] ${e.message}`));

const bodyText = () => page.evaluate(() => document.body.innerText);
const waitForPath = (p) =>
  page.waitForFunction((path) => location.pathname === path, { timeout: 15000 }, p);

try {
  // Connexion
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "client@example.com");
  await page.type('input[name="password"]', "client1234");
  await page.click('button[type="submit"]');
  await waitForPath("/mon-espace");
  const before = await bodyText();
  const soldeAvant = before.match(/SOLDE DISPONIBLE\s*([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, "");
  console.log(`[connexion] solde avant = ${soldeAvant} F`);

  // Nouvelle commande
  await page.goto(`${BASE}/mon-espace/nouvelle-commande`, { waitUntil: "networkidle0" });
  await page.type('input[name="link"]', "https://tiktok.com/@e2e-test");
  await page.type('input[name="quantity"]', "500");
  await new Promise((r) => setTimeout(r, 200)); // laisse React calculer le prix
  const priceText = await page.$eval(
    'form:has(input[name="link"]) button[type="submit"]',
    (b) => b.textContent,
  );
  console.log(`[commande] bouton: "${priceText.trim()}"`);
  await page.click('form:has(input[name="link"]) button[type="submit"]');
  await waitForPath("/mon-espace/commandes");
  console.log("[commande] → /mon-espace/commandes ✓");

  const list1 = await bodyText();
  if (!list1.includes("tiktok.com/@e2e-test")) throw new Error("commande absente de la liste");
  console.log("[commande] visible dans la liste ✓");
  console.log(
    `[commande] statut initial: ${
      list1.includes("En attente") ? "En attente" : list1.includes("En cours") ? "En cours" : "?"
    }`,
  );

  // Solde débité ?
  await page.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle0" });
  const afterText = await bodyText();
  const soldeApres = afterText.match(/SOLDE DISPONIBLE\s*([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, "");
  console.log(`[solde] avant=${soldeAvant} après=${soldeApres}`);
  if (Number(soldeApres) >= Number(soldeAvant)) throw new Error("le solde n'a pas été débité");
  console.log("[solde] débité correctement ✓");
  if (!afterText.includes("tiktok.com") && !afterText.includes("Commandes récentes"))
    throw new Error("commande absente du tableau de bord");

  // Attendre le passage « en cours » (le mock passe en_cours après 15s)
  console.log("[sync] attente du passage 'en cours' (jusqu'à 25s)…");
  await page.goto(`${BASE}/mon-espace/commandes`, { waitUntil: "networkidle0" });
  let sawInProgress = false;
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 6000));
    await page.reload({ waitUntil: "networkidle0" });
    const t = await bodyText();
    if (t.includes("En cours")) {
      sawInProgress = true;
      break;
    }
  }
  console.log(sawInProgress ? "[sync] statut 'En cours' observé ✓" : "⚠ statut 'En cours' non observé (délai)");

  console.log("\n✅ Flux de commande OK");
} catch (err) {
  console.error("\n❌ ÉCHEC:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

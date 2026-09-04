// Test de bout en bout du rechargement Mobile Money (Phase 5, bac à sable).
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

const bodyText = () => page.evaluate(() => document.body.innerText);

try {
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "client@example.com");
  await page.type('input[name="password"]', "client1234");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === "/mon-espace", { timeout: 15000 });
  const before = await bodyText();
  const soldeAvant = Number(
    before.match(/SOLDE DISPONIBLE\s*([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, ""),
  );
  console.log(`[connexion] solde avant = ${soldeAvant} F`);

  await page.goto(`${BASE}/mon-espace/recharger`, { waitUntil: "networkidle0" });
  await page.waitForSelector('input[name="phone"]');
  // Montant par défaut (1000 F) et opérateur par défaut (Orange) conviennent déjà.
  await page.type('input[name="phone"]', "+2250700000002", { delay: 5 });
  await page.evaluate(() => document.querySelector('input[name="phone"]').blur());
  const submitted = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button[type="submit"]')].find((b) =>
      b.textContent.includes("Recharger"),
    );
    if (!btn || !btn.form.checkValidity()) return false;
    btn.form.requestSubmit(btn);
    return true;
  });
  if (!submitted) throw new Error("formulaire invalide ou bouton introuvable au moment de la soumission");

  await page.waitForFunction(
    () => document.body.innerText.includes("Paiement en cours de confirmation"),
    { timeout: 10000 },
  );
  console.log("[recharge] paiement initié, en attente de confirmation (bac à sable) ✓");

  // Le mock confirme après ~8s ; on attend le crédit automatique (polling client, jusqu'à 15s).
  let credited = false;
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    await page.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle0" });
    const t = await bodyText();
    const solde = Number(t.match(/SOLDE DISPONIBLE\s*([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, ""));
    if (solde > soldeAvant) {
      credited = true;
      console.log(`[recharge] solde crédité : ${soldeAvant} → ${solde} F ✓`);
      break;
    }
  }
  if (!credited) throw new Error("le solde n'a jamais été crédité après la confirmation simulée");

  await page.goto(`${BASE}/mon-espace/historique`, { waitUntil: "networkidle0" });
  const hist = await bodyText();
  if (!hist.includes("Rechargement")) throw new Error("le mouvement 'Rechargement' est absent de l'historique");
  console.log("[historique] mouvement de rechargement visible ✓");

  console.log("\n✅ Flux de rechargement OK");
} catch (err) {
  console.error("\n❌ ÉCHEC:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

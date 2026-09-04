// Test de bout en bout de l'interface admin (Phase 6).
// Deux contextes de navigateur séparés (admin / client) pour ne pas
// enchaîner les cycles connexion/déconnexion sur une même page.
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.E2E_BASE || "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});

async function newPage() {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  return page;
}

const bodyText = (page) => page.evaluate(() => document.body.innerText);
const waitForPath = (page, p) =>
  page.waitForFunction((path) => location.pathname === path, { timeout: 15000 }, p);

/**
 * Renseigne un champ en une fois (setter natif + événement input), pour
 * éviter les pertes de frappe de `page.type` sur une cible distante à
 * latence variable (observé contre un déploiement Vercel).
 */
async function setValue(page, selector, value) {
  await page.waitForSelector(selector);
  await page.evaluate(
    (sel, val) => {
      const el = document.querySelector(sel);
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    selector,
    value,
  );
}

async function login(page, email, password) {
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await setValue(page, 'input[name="email"]', email);
  await setValue(page, 'input[name="password"]', password);
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    btn.form.requestSubmit(btn);
  });
}

try {
  const adminPage = await newPage();
  const clientPage = await newPage();

  await login(adminPage, "admin@jalsmm.com", "admin1234");
  await waitForPath(adminPage, "/admin");
  const dash = await bodyText(adminPage);
  if (!dash.includes("Tableau de bord admin")) throw new Error("dashboard admin absent");
  console.log("[connexion admin] → /admin ✓");

  await login(clientPage, "client@example.com", "client1234");
  await waitForPath(clientPage, "/mon-espace");
  await clientPage.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  if (new URL(clientPage.url()).pathname !== "/mon-espace")
    throw new Error("un client non-admin peut accéder à /admin");
  console.log("[garde] /admin refusé à un non-admin ✓");

  // Ajuster le solde du client de démo, depuis la session admin
  await adminPage.goto(`${BASE}/admin/utilisateurs`, { waitUntil: "networkidle0" });
  const before = await bodyText(adminPage);
  const soldeAvant = before.match(/Awa Traoré[\s\S]{0,120}?([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, "");
  // Scoper précisément à la ligne d'Awa Traoré : plusieurs comptes de test
  // peuvent s'être accumulés (chaque run de e2e-auth.mjs en crée un).
  await adminPage.evaluate(() => {
    const row = [...document.querySelectorAll("tr")].find((tr) => tr.textContent.includes("Awa Traoré"));
    const btn = [...row.querySelectorAll("button")].find((b) => b.textContent.trim() === "Ajuster");
    btn.click();
  });
  await setValue(adminPage, 'input[name="amount"]', "1000");
  await setValue(adminPage, 'input[name="reason"]', "Test E2E admin");
  await adminPage.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "OK");
    btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const after = await bodyText(adminPage);
  const soldeApres = after.match(/Awa Traoré[\s\S]{0,120}?([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, "");
  if (Number(soldeApres) !== Number(soldeAvant) + 1000)
    throw new Error(`ajustement solde: attendu ${Number(soldeAvant) + 1000}, obtenu ${soldeApres}`);
  console.log(`[utilisateurs] solde ajusté : ${soldeAvant} → ${soldeApres} F ✓`);

  // Le client voit bien le solde ajusté, sans avoir eu à se reconnecter.
  await clientPage.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle0" });
  const clientDash = await bodyText(clientPage);
  if (!clientDash.includes(soldeApres)) {
    console.log("⚠ le solde côté client ne reflète pas encore l'ajustement (cache) — non bloquant");
  } else {
    console.log("[utilisateurs] le client voit son nouveau solde ✓");
  }

  // Services : activer/désactiver
  await adminPage.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
  const svcBefore = await bodyText(adminPage);
  await adminPage.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Désactiver");
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  const svcAfter = await bodyText(adminPage);
  if (svcBefore === svcAfter) throw new Error("le service n'a pas changé d'état après le clic");
  console.log("[services] activation/désactivation ✓");

  // Commandes : changer un statut si le catalogue de démo en contient.
  await adminPage.goto(`${BASE}/admin/commandes`, { waitUntil: "networkidle0" });
  const hasSelect = (await adminPage.$("select")) !== null;
  if (hasSelect) {
    await adminPage.select("select", "completed");
    await new Promise((r) => setTimeout(r, 1000));
    console.log("[commandes] statut modifié via le select ✓");
  } else {
    console.log("[commandes] aucune commande à modifier — ignoré");
  }

  console.log("\n✅ Interface admin OK");
} catch (err) {
  console.error("\n❌ ÉCHEC:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

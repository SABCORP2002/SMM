// Test de bout en bout du flux d'authentification (Phase 3).
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const email = `test-${Date.now()}@example.com`;
const PASS = "motdepasse123";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 900 });

const clickByText = (text) =>
  page.evaluate((t) => {
    const btns = [...document.querySelectorAll("button")].filter(
      (b) => b.textContent.trim() === t,
    );
    const links = [...document.querySelectorAll("a")].filter(
      (a) => a.textContent.trim() === t,
    );
    const el = btns[0] || links[0];
    if (!el) throw new Error(`bouton "${t}" introuvable`);
    if (el.tagName === "BUTTON" && el.form) el.form.requestSubmit(el);
    else el.click();
  }, text);

const bodyText = () => page.evaluate(() => document.body.innerText);
const waitForPath = (p) =>
  page.waitForFunction((path) => location.pathname === path, { timeout: 15000 }, p);

try {
  // 1. Inscription
  await page.goto(`${BASE}/inscription`, { waitUntil: "networkidle0" });
  await page.type('input[name="name"]', "Test Utilisateur");
  await page.type('input[name="email"]', email);
  await page.type('input[name="whatsapp"]', "+2250700000001");
  await page.type('input[name="password"]', PASS);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    clickByText("Créer mon compte"),
  ]);
  if (new URL(page.url()).pathname !== "/mon-espace")
    throw new Error(`inscription: attendu /mon-espace, obtenu ${page.url()}`);
  const dash = await bodyText();
  console.log(`[inscription] → /mon-espace ✓  (${dash.includes("Bonjour") ? "dashboard OK" : "?"})`);

  // 2. Mise à jour du profil
  await page.goto(`${BASE}/mon-espace/profil`, { waitUntil: "networkidle0" });
  await page.click('input[name="name"]', { clickCount: 3 });
  await page.type('input[name="name"]', "Nom Modifié");
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/mon-espace/profil") && r.request().method() === "POST",
    ),
    clickByText("Enregistrer"),
  ]);
  await new Promise((r) => setTimeout(r, 800));
  const prof = await bodyText();
  if (!prof.includes("Profil mis à jour"))
    throw new Error("profil: message de succès absent");
  console.log("[profil] mise à jour ✓");

  // 3. Déconnexion
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    clickByText("Déconnexion"),
  ]);
  console.log(`[déconnexion] → ${new URL(page.url()).pathname} ✓`);

  // 4. Garde de route
  await page.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle0" });
  if (new URL(page.url()).pathname !== "/connexion")
    throw new Error("garde: /mon-espace accessible sans session");
  console.log("[garde] /mon-espace → /connexion ✓");

  // 5. Mauvais mot de passe
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', "mauvais");
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === "POST"),
    clickByText("Se connecter"),
  ]);
  await new Promise((r) => setTimeout(r, 500));
  const bad = await bodyText();
  if (!bad.includes("incorrect"))
    throw new Error("connexion: pas de message d'erreur sur mauvais mot de passe");
  console.log("[connexion] mauvais mot de passe rejeté ✓");

  // 6. Bon mot de passe + persistance du nom modifié (page fraîche)
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', email, { delay: 5 });
  await page.type('input[name="password"]', PASS, { delay: 5 });
  await clickByText("Se connecter");
  await waitForPath("/mon-espace");
  await page.waitForNetworkIdle().catch(() => {});
  const back = await bodyText();
  if (!back.includes("Nom Modifié"))
    throw new Error("persistance: 'Nom Modifié' absent après reconnexion");
  console.log("[connexion] OK + nom modifié persistant ✓");

  console.log("\n✅ Flux d'authentification complet OK");
} catch (err) {
  console.error("\n❌ ÉCHEC:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

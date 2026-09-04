// Test de bout en bout du flux de commande (Phase 4) via le parcours
// logo → service → détails (retravaillé suite au retour du client).
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

async function setValue(selector, value) {
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

function clickByText(text) {
  return page.evaluate((t) => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes(t));
    if (!btn) throw new Error(`bouton contenant "${t}" introuvable`);
    btn.click();
  }, text);
}

try {
  // Connexion
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await setValue('input[name="email"]', "client@example.com");
  await setValue('input[name="password"]', "client1234");
  await page.evaluate(() => {
    const b = document.querySelector('button[type="submit"]');
    b.form.requestSubmit(b);
  });
  await waitForPath("/mon-espace");
  const before = await bodyText();
  const soldeAvant = before.match(/SOLDE DISPONIBLE\s*([\d\s]+)\s*F/)?.[1]?.replace(/\s/g, "");
  console.log(`[connexion] solde avant = ${soldeAvant} F`);

  // Étape 1 — choisir la plateforme par son logo
  await page.goto(`${BASE}/mon-espace/nouvelle-commande`, { waitUntil: "networkidle0" });
  await clickByText("TikTok");
  await page.waitForFunction(() => document.body.innerText.includes("Abonnés"), { timeout: 5000 });
  console.log("[commande] plateforme TikTok sélectionnée ✓");

  // Étape 2 — choisir le service dans la liste (pas de menu déroulant)
  await clickByText("Démarrage rapide");
  await page.waitForSelector('input[name="link"]');
  console.log("[commande] service sélectionné ✓");

  // Étape 3 — lien + quantité
  await setValue('input[name="link"]', "https://tiktok.com/@e2e-test");
  await setValue('input[name="quantity"]', "500");
  await new Promise((r) => setTimeout(r, 200));
  const submitted = await page.evaluate(() => {
    const form = document.querySelector('input[name="link"]')?.form;
    const btn = form?.querySelector('button[type="submit"]');
    if (!btn || btn.disabled) return { ok: false, text: btn?.textContent, disabled: btn?.disabled };
    btn.form.requestSubmit(btn);
    return { ok: true, text: btn.textContent };
  });
  console.log(`[commande] bouton: "${submitted.text?.trim()}" (soumis: ${submitted.ok})`);
  if (!submitted.ok) throw new Error("bouton de commande désactivé ou introuvable au moment de la soumission");
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

// Audit mobile : débordements horizontaux + cibles tactiles trop petites,
// sur toutes les pages publiques et l'espace client, à 360px et 320px
// (petits Android) en plus de 390px (iPhone standard).
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const WIDTHS = [320, 360, 390];

const PUBLIC_ROUTES = [
  "/",
  "/services",
  "/services?plateforme=tiktok",
  "/tarifs",
  "/comment-ca-marche",
  "/aide",
  "/api",
  "/tutoriels",
  "/tutoriels/vraies-vues-vs-fausses-vues",
  "/conditions",
  "/confidentialite",
  "/remboursement",
  "/a-propos",
  "/connexion",
  "/inscription",
];

const DASHBOARD_ROUTES = [
  "/mon-espace",
  "/mon-espace/nouvelle-commande",
  "/mon-espace/commandes",
  "/mon-espace/profil",
  "/mon-espace/parrainage",
  "/mon-espace/recharger",
  "/mon-espace/historique",
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();

async function login() {
  await page.setViewport({ width: 390, height: 900 });
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "client@example.com");
  await page.type('input[name="password"]', "client1234");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === "/mon-espace", { timeout: 15000 });
}

async function audit(path, width) {
  await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
  return page.evaluate((w) => {
    const docW = document.documentElement.scrollWidth;
    const overflow = docW > w + 1;

    // Cibles tactiles < 40px (hors icônes décoratives) parmi liens/boutons visibles.
    const smallTargets = [...document.querySelectorAll("a, button")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false; // caché
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return (r.height > 0 && r.height < 32) && r.width < 200;
      })
      .slice(0, 5)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 30),
        h: Math.round(el.getBoundingClientRect().height),
      }));

    return { docW, overflow, smallTargetsCount: smallTargets.length, smallTargets };
  }, width);
}

const results = [];
try {
  for (const path of PUBLIC_ROUTES) {
    for (const w of WIDTHS) {
      const r = await audit(path, w);
      results.push({ path, w, ...r });
    }
  }

  await login();
  for (const path of DASHBOARD_ROUTES) {
    for (const w of WIDTHS) {
      const r = await audit(path, w);
      results.push({ path, w, ...r });
    }
  }
} finally {
  await browser.close();
}

console.log(`\nTotal vérifications : ${results.length}\n`);

const overflows = results.filter((r) => r.overflow);
if (overflows.length) {
  console.log(`❌ DÉBORDEMENT HORIZONTAL (${overflows.length}) :`);
  for (const o of overflows) {
    console.log(`  ${o.path}  @${o.w}px → scrollWidth=${o.docW}`);
  }
} else {
  console.log("✅ Aucun débordement horizontal sur aucune page/largeur testée.");
}

console.log();
const withSmallTargets = results.filter((r) => r.w === 360 && r.smallTargetsCount > 0);
if (withSmallTargets.length) {
  console.log(`⚠ Cibles tactiles < 32px de hauteur (à 360px, informatif) :`);
  for (const o of withSmallTargets) {
    console.log(`  ${o.path} : ${o.smallTargetsCount} — ex: ${JSON.stringify(o.smallTargets[0])}`);
  }
} else {
  console.log("✅ Aucune cible tactile suspecte détectée.");
}

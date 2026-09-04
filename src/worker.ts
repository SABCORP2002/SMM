/**
 * Worker de synchronisation des commandes actives.
 *   npm run worker
 *
 * En développement, chaque visite de /mon-espace ou /mon-espace/commandes
 * déclenche déjà une synchro pour l'utilisateur courant — ce worker n'est
 * donc pas indispensable en local. En production, le faire tourner en
 * continu (ex: process séparé, service systemd, conteneur) garantit que
 * les commandes progressent même si personne ne consulte le site.
 */
import { syncActiveOrders } from "./lib/orders";

const INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS ?? 20_000);

async function tick() {
  try {
    const { checked, updated } = await syncActiveOrders({ limit: 200 });
    if (checked > 0) {
      console.log(
        `[worker] ${new Date().toISOString()} — ${checked} commande(s) vérifiée(s), ${updated} mise(s) à jour`,
      );
    }
  } catch (err) {
    console.error("[worker] erreur de synchronisation", err);
  }
}

console.log(`[worker] démarré — intervalle ${INTERVAL_MS}ms`);
tick();
setInterval(tick, INTERVAL_MS);

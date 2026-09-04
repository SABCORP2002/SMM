/**
 * Worker de synchronisation des commandes et paiements en attente.
 *   npm run worker
 *
 * En développement, chaque visite de /mon-espace, /mon-espace/commandes ou
 * /mon-espace/historique déclenche déjà une synchro pour l'utilisateur
 * courant — ce worker n'est donc pas indispensable en local. En production,
 * le faire tourner en continu (ex: process séparé, service systemd,
 * conteneur) garantit que commandes et paiements progressent même si
 * personne ne consulte le site.
 */
import { syncActiveOrders } from "./lib/orders";
import { syncPendingPayments } from "./lib/payments";

const INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS ?? 20_000);

async function tick() {
  try {
    const orders = await syncActiveOrders({ limit: 200 });
    if (orders.checked > 0) {
      console.log(
        `[worker] ${new Date().toISOString()} — commandes : ${orders.checked} vérifiée(s), ${orders.updated} mise(s) à jour`,
      );
    }
  } catch (err) {
    console.error("[worker] erreur de synchronisation des commandes", err);
  }

  try {
    const payments = await syncPendingPayments({ limit: 200 });
    if (payments.checked > 0) {
      console.log(
        `[worker] ${new Date().toISOString()} — paiements : ${payments.checked} vérifié(s), ${payments.credited} crédité(s)`,
      );
    }
  } catch (err) {
    console.error("[worker] erreur de synchronisation des paiements", err);
  }
}

console.log(`[worker] démarré — intervalle ${INTERVAL_MS}ms`);
tick();
setInterval(tick, INTERVAL_MS);

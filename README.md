# JAL SMM

Panneau SMM (Social Media Marketing) **pensé pour l'Afrique francophone** :
vocabulaire local, prix en francs CFA, paiement Mobile Money, volet pédagogique.
Inspiré du modèle des panels type *Perfect Panel*, réécrit pour ce public.

## État d'avancement

| Phase | Contenu | Statut |
| ----- | ------- | ------ |
| 1 | Fondations : stack, base de données, design system, site vitrine (accueil) | ✅ en cours |
| 2 | Site public complet : catalogue services, tarifs, tutoriels, pages légales | à venir |
| 3 | Authentification + espace client (tableau de bord, profil) | à venir |
| 4 | Commandes : formulaire, calcul du prix, API fournisseur, synchro des statuts | à venir |
| 5 | Paiements : portefeuille, Mobile Money (FedaPay/CinetPay sandbox), recharge manuelle | à venir |
| 6 | Back-office admin : commandes, utilisateurs, services, fournisseurs | à venir |
| 7 | Extras : parrainage, API revendeur, tickets, 2FA | à venir |

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (config CSS, thème dans `src/app/globals.css`)
- **Drizzle ORM** + **libsql/SQLite** en dev — schéma portable vers PostgreSQL
- **bcryptjs** (hachage mots de passe), **zod** (validation)
- i18n maison : dictionnaire `src/i18n/fr.ts` (français unique pour l'instant)

> Choix de la base : Prisma 8 dans cet environnement est un outil « contract-based »
> incompatible ; SQLite via libsql ne demande aucune installation. Pour la
> production, changer `dialect`/`DATABASE_URL` vers PostgreSQL (Neon, Supabase, VPS).

## Démarrer

```bash
npm install
cp .env.example .env      # ajuster si besoin
npm run db:push           # crée dev.db à partir du schéma Drizzle
npm run db:seed           # données de démonstration
npm run dev               # http://localhost:3000
```

### Comptes de démonstration (après `db:seed`)

| Rôle | Identifiant | Mot de passe |
| ---- | ----------- | ------------ |
| Admin | `admin@jalsmm.com` | `admin1234` |
| Client | `client@example.com` | `client1234` |

## Scripts

| Commande | Effet |
| -------- | ----- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint |
| `npm run db:push` | Applique le schéma Drizzle à la base |
| `npm run db:generate` | Génère les fichiers de migration SQL |
| `npm run db:studio` | Explorateur de base Drizzle Studio |
| `npm run db:seed` | (Ré)injecte les données de démo |
| `node scripts/shot.mjs <url> <largeur> <out.png>` | Capture d'écran (Chrome local) |
| `node scripts/measure-overflow.mjs <url> <largeur>` | Détecte les débordements horizontaux |

## Structure

```
src/
  app/
    layout.tsx            Racine (polices, métadonnées, <html lang="fr">)
    globals.css           Design system Tailwind v4 (couleurs JAL SMM)
    (marketing)/          Groupe de routes du site public
      layout.tsx          En-tête + pied de page + bouton WhatsApp
      page.tsx            Page d'accueil
  components/
    brand/                Logo
    marketing/            En-tête, pied de page, bouton WhatsApp
    ui/                   Composants réutilisables (Button…)
  config/site.ts          Configuration statique (nav, contacts, devise)
  db/
    schema.ts             Schéma Drizzle (14 tables)
    index.ts              Client de base de données
    seed.ts               Données de démonstration
  i18n/fr.ts              Tous les textes affichés
  lib/
    constants.ts          Statuts, plateformes, opérateurs Mobile Money
    utils.ts              cn(), formatMoney(XOF), calcul de prix…
```

## Données réelles

Les identifiants du client (API fournisseur SMM, passerelles Mobile Money :
FedaPay, CinetPay, PayDunya, Paystack…) se branchent via `.env` — voir
`.env.example`. Rien de sensible n'est codé en dur.

## Note honnêteté

Une partie du catalogue s'appuie sur des comptes automatisés et ne respecte pas
toujours les CGU des réseaux sociaux. Le produit l'assume explicitement auprès
des utilisateurs (bandeau sur l'accueil, futurs tutoriels).

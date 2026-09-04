# JAL SMM

Panneau SMM (Social Media Marketing) **pensé pour l'Afrique francophone** :
vocabulaire local, prix en francs CFA, paiement Mobile Money, volet pédagogique.
Inspiré du modèle des panels type *Perfect Panel*, réécrit pour ce public.

## État d'avancement

| Phase | Contenu | Statut |
| ----- | ------- | ------ |
| 1 | Fondations : stack, base de données, design system, site vitrine (accueil) | ✅ |
| 2 | Site public complet : catalogue services, tarifs, tutoriels, pages légales, 404 | ✅ |
| 3 | Authentification (session cookie) + espace client (tableau de bord, profil, parrainage) | ✅ |
| 4 | Commandes : formulaire, calcul du prix, driver fournisseur (bac à sable), synchro des statuts | ✅ |
| 5 | Paiements : portefeuille, Mobile Money (FedaPay/CinetPay sandbox), recharge manuelle | à venir |
| 6 | Back-office admin : commandes, utilisateurs, services, fournisseurs | à venir |
| 7 | Extras : API revendeur, tickets, 2FA, tableaux de marge | à venir |

### Espace client (`/mon-espace`)

Protégé par `requireUser()` (redirige vers `/connexion` sans session). Auth
maison : mot de passe haché (bcrypt), session en base + cookie httpOnly.
Fonctionnels : tableau de bord, nouvelle commande, mes commandes, paramètres
(profil + mot de passe), parrainage. En attente de leur phase : recharger,
historique des paiements.

> Les formulaires client utilisent `useTransition` + `onSubmit` plutôt que
> `useActionState` : ce dernier ne re-déclenche pas l'action à la 2ᵉ soumission
> après une erreur (quirk React 19.2 / Next 16 constaté et contourné).

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (config CSS, thème dans `src/app/globals.css`)
- **PostgreSQL** + **Drizzle ORM** — Docker en local, Neon/Vercel Postgres en prod
- **bcryptjs** (hachage mots de passe), **zod** (validation)
- i18n maison : dictionnaire `src/i18n/fr.ts` (français unique pour l'instant)

> Historique : la v1 tournait sur SQLite (libsql) pour un démarrage local sans
> installation. **Incompatible avec un déploiement Vercel** (système de
> fichiers éphémère — pas de fichier `.db` persistant). D'où le passage à
> Postgres partout, y compris en local (Docker), pour ne plus avoir de
> divergence dev/prod.

## Démarrer en local

```bash
npm install
cp .env.example .env        # ajuster si besoin
docker compose up -d        # Postgres local sur le port 5433
npm run db:push             # crée les tables à partir du schéma Drizzle
npm run db:seed             # données de démonstration
npm run dev                 # http://localhost:3000
```

### Comptes de démonstration (après `db:seed`)

| Rôle | Identifiant | Mot de passe |
| ---- | ----------- | ------------ |
| Admin | `admin@jalsmm.com` | `admin1234` |
| Client | `client@example.com` | `client1234` |

## Déployer sur Vercel

L'application a besoin d'une base **Postgres accessible depuis Internet**
(Docker ne fonctionne que sur ta machine). Le plus simple, gratuit, sans
carte bancaire :

1. Dans le dashboard Vercel du projet → onglet **Storage** → **Create
   Database** → **Neon (Postgres)** → suit l'assistant. Vercel injecte
   automatiquement une variable `DATABASE_URL` (utilise la version
   **pooled**, celle avec `-pooler` dans l'hôte).
   - Alternative sans passer par Vercel : créer une base sur
     [neon.tech](https://neon.tech) (gratuit) et copier son
     `postgresql://…?sslmode=require` dans **Project → Settings →
     Environment Variables** du projet Vercel, clé `DATABASE_URL`.
2. Toujours dans Environment Variables, ajoute au minimum :
   `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (l'URL Vercel du projet),
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SUPPORT_EMAIL`.
3. Redéploie. Le build exécute `generateStaticParams` sur `/[slug]` et a donc
   besoin que `DATABASE_URL` soit déjà configuré **avant** ce déploiement.
4. Une fois en ligne, exécute une seule fois la création des tables et le
   seed **contre la base de prod** (depuis ta machine, en pointant
   temporairement `.env` vers l'URL Neon) :
   ```bash
   DATABASE_URL="<url Neon>" npm run db:push
   DATABASE_URL="<url Neon>" npm run db:seed   # ou ton propre contenu
   ```
   (sous PowerShell : `$env:DATABASE_URL="<url Neon>"; npm run db:push`)

## Scripts

| Commande | Effet |
| -------- | ----- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint |
| `npm run worker` | Synchronise les commandes actives en continu (indépendant des visites) |
| `docker compose up -d` | Démarre Postgres en local (port 5433) |
| `npm run db:push` | Applique le schéma Drizzle à la base |
| `npm run db:generate` | Génère les fichiers de migration SQL |
| `npm run db:studio` | Explorateur de base Drizzle Studio |
| `npm run db:seed` | (Ré)injecte les données de démo |
| `node scripts/shot.mjs <url> <largeur> <out.png>` | Capture d'écran (Chrome local) |
| `node scripts/shot-auth.mjs <dossier> <largeur>` | Captures de l'espace client (connecté) |
| `node scripts/mobile-audit.mjs` | Détecte débordements horizontaux + cibles tactiles trop petites |
| `node scripts/e2e-auth.mjs` | Test de bout en bout : inscription/connexion/profil |
| `node scripts/e2e-order.mjs` | Test de bout en bout : passage et suivi d'une commande |

## Structure

```
src/
  app/
    layout.tsx            Racine (polices, métadonnées, <html lang="fr">)
    globals.css            Design system Tailwind v4 (couleurs JAL SMM)
    not-found.tsx          Page 404 brandée
    (marketing)/           Groupe de routes du site public
      layout.tsx           En-tête + pied de page + bouton WhatsApp
      page.tsx              Page d'accueil
      services/, tarifs/, tutoriels/, aide/, api/, comment-ca-marche/
      connexion/, inscription/
      [slug]/               Pages éditoriales (conditions, à-propos…)
    mon-espace/             Espace client (protégé)
      layout.tsx            Chrome (sidebar + topbar + solde)
      page.tsx, profil/, parrainage/, nouvelle-commande/, commandes/…
  actions/                 Server Actions (auth, profile, orders)
  components/
    brand/                  Logo, icônes de plateforme
    marketing/, dashboard/, auth/, ui/
  config/site.ts            Configuration statique (nav, contacts, devise)
  db/
    schema.ts               Schéma Drizzle (14 tables, Postgres)
    index.ts                 Client de base de données (pg + drizzle)
    queries.ts               Lectures (catalogue, commandes, parrainage…)
    seed.ts                   Données de démonstration
  lib/
    auth.ts                   Sessions, hachage de mot de passe
    orders.ts                 Placement de commande, synchro fournisseur
    provider/                 Driver SMM (bac à sable + client HTTP standard)
    constants.ts, utils.ts, validation.ts, form.ts
  i18n/fr.ts                 Tous les textes affichés
  worker.ts                  Synchro continue des commandes (npm run worker)
```

## Données réelles

Les identifiants du client (API fournisseur SMM, passerelles Mobile Money :
FedaPay, CinetPay, PayDunya, Paystack…) se branchent via `.env` — voir
`.env.example`. Rien de sensible n'est codé en dur.

## Note honnêteté

Une partie du catalogue s'appuie sur des comptes automatisés et ne respecte pas
toujours les CGU des réseaux sociaux. Le produit l'assume explicitement auprès
des utilisateurs (bandeau sur l'accueil, futurs tutoriels).

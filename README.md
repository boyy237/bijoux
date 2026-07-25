# Bijoux Pro — Boutique en ligne (Next.js + PWA)

Application e-commerce complète : bijoux, habits, sacs, montres et accessoires, avec
espace client (réservation/achat) et dashboard admin complet.

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

Pour un test en conditions réelles (production) :

```bash
npm run build
npm run start
```

## Identifiants admin (démo)

```
Email : admin@bijoux.pro
Mot de passe : admin123
```

À changer via les variables d'environnement `ADMIN_EMAIL` et `ADMIN_PASSWORD`
(fichier `.env.local` à créer, non fourni pour rester simple).

## Ce qui est inclus

- **5 catégories** : Bijoux, Habits, Sacs, Montres, Accessoires — chacune avec ses
  sous-catégories (visible/modifiable dans `lib/categories.js`)
- **Espace client** : inscription/connexion, ajout au panier, réservation (paiement en
  boutique) ou achat en ligne (choix du mode de paiement), historique des commandes,
  annulation d'une réservation en attente
- **Dashboard admin** (`/admin`) : statistiques (clients inscrits, commandes, chiffre
  d'affaires, stock), gestion des produits (ajout avec import de photo depuis le
  téléphone ou l'ordinateur, modification, suppression), gestion des clients
  (liste + suppression), gestion des commandes (changement de statut)
- **PWA** : installable sur mobile et desktop (`manifest.json` + `sw.js`), fonctionne
  hors-ligne pour les pages déjà visitées

## Stockage des données

Pas de base de données externe pour l'instant : les données sont stockées dans des
fichiers JSON (`data/products.json`, `data/clients.json`, `data/orders.json`), lus et
écrits via `lib/db.js`. C'est volontaire, pour avoir un site fonctionnel dès
maintenant sans dépendre d'un backend externe.

**Quand tu seras prêt pour le vrai backend** (comme discuté, ex. Medusa.js) : il
suffira de remplacer les fonctions de `lib/db.js` par des appels à l'API du nouveau
backend. Le reste du site (pages, composants) n'aura pas à changer, puisqu'il passe
toujours par les routes `/api/...` de ce projet.

## Paiement

Le choix du mode de paiement (carte, PayPal, virement) est actuellement simulé : la
commande est enregistrée avec le mode choisi mais aucun paiement réel n'est traité.
À brancher sur Stripe (ou autre) quand le backend définitif sera en place.

## Structure du projet

```
app/                  Pages et routes API (Next.js App Router)
  api/                Toutes les routes API (produits, clients, commandes, auth, upload)
  admin/              Espace admin (protégé par session)
  categorie/[slug]/   Pages catégories
  produit/[id]/       Fiche produit
  compte/             Connexion / profil client
  panier/             Panier + tunnel de commande
components/           Composants réutilisables
context/              Contexte du panier (React Context + localStorage)
lib/                  Catégories, base JSON, auth, sessions, formatage
data/                 "Base de données" JSON
public/images/        Images des produits
public/uploads/       Photos importées depuis le dashboard admin
public/manifest.json  Manifeste PWA
public/sw.js          Service worker (mode hors-ligne)
```

## Ajouter une catégorie ou sous-catégorie

Tout se passe dans `lib/categories.js` : ajouter une entrée dans le tableau
`CATEGORIES`, elle apparaît automatiquement dans la navigation, la boutique et le
formulaire d'ajout de produit côté admin.

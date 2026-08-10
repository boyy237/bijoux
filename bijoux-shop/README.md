# Bijoux Pro — Frontend (Next.js + PWA)

Boutique en ligne : bijoux, habits, sacs, montres et accessoires. Ce projet est
maintenant branché sur le vrai backend (`bijoux-backend`, Node/Express +
PostgreSQL) — il n'y a plus de stockage JSON local.

## Démarrage

Il faut lancer les **deux projets en même temps** (dans deux terminaux) :

```bash
# Terminal 1 : le backend
cd bijoux-backend
npm install
npm run migrate && npm run seed   # si pas déjà fait
npm run dev                        # http://localhost:4000

# Terminal 2 : ce frontend
cd bijoux-shop
npm install
cp .env.local.example .env.local
# Éditer .env.local : JWT_SECRET doit être IDENTIQUE à celui du backend
npm run dev                        # http://localhost:3000
```

## Comment ça marche

- Les pages et composants n'ont pas changé dans leur usage : ils continuent
  d'appeler `/api/produits`, `/api/orders`, etc.
- Ces routes `/api/...` sont maintenant de simples **proxys** vers le backend
  Express (voir `lib/backendProxy.js`) : elles relaient la requête et les
  cookies de session, rien de plus.
- Les pages qui affichent des listes (accueil, catégories, fiche produit,
  dashboard admin) appellent directement le backend côté serveur via
  `lib/serverApi.js`, plus efficace qu'un aller-retour par nos propres routes.
- La session (JWT) est émise par le backend et lue directement par le
  frontend grâce à un secret partagé (`JWT_SECRET`) — pas d'appel réseau
  supplémentaire pour savoir qui est connecté.

## Nouveautés liées au backend

- **Devise** : Franc CFA (XAF), plus d'euros
- **Livraison** : au panier, le client choisit retrait en boutique (Yaoundé)
  ou livraison à domicile ; le tarif est calculé automatiquement selon la
  ville et le nombre d'articles (via le backend)
- **Paiement** : à la livraison/en boutique, ou en ligne via CinetPay (Mobile
  Money MTN/Orange, carte) — redirection vers CinetPay puis retour sur
  `/panier/confirmation`

## Déploiement

Ce frontend peut être déployé sur Vercel, Railway, ou tout hébergeur Next.js.
Variable d'environnement à définir en production :
- `BACKEND_URL` : l'URL publique du backend (ex. Railway)
- `JWT_SECRET` : identique à celui du backend

PWA : `manifest.json` et `sw.js` sont déjà configurés, rien à faire de plus.

# Bijoux Pro — Backend (Node.js / Express / PostgreSQL)

API complète pour la boutique Landry Express : produits, catégories, comptes
clients, commandes/réservations, livraison calculée par distance, paiement
CinetPay (Mobile Money + carte).

## Démarrage en local

Prérequis : Node.js 18+, PostgreSQL (installé et démarré).

```bash
npm install
cp .env.example .env   # puis renseigner les valeurs (voir plus bas)
npm run migrate        # crée les tables
npm run seed            # crée les catégories, l'admin, les zones de livraison et 27 produits de démo
npm run dev              # démarre le serveur sur http://localhost:4000
```

Identifiants admin par défaut (modifiables via `ADMIN_EMAIL` / `ADMIN_PASSWORD`
dans `.env` avant le premier `npm run seed`) :
```
admin@bijoux.pro / admin123
```

## Variables d'environnement (`.env`)

Voir `.env.example` pour la liste complète et des commentaires. Résumé de ce
qu'il te faut obtenir :

| Variable | Où l'obtenir |
|---|---|
| `DATABASE_URL` | Fournie automatiquement par Railway une fois le service Postgres ajouté au projet |
| `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY` | Compte CinetPay → Intégration → Clés API |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Compte Cloudinary → Dashboard |
| `JWT_SECRET` | À générer toi-même (une longue chaîne aléatoire) |

Tant que les clés CinetPay/Cloudinary ne sont pas renseignées, tout le reste du
site fonctionne normalement : seuls l'upload de photo et le paiement en ligne
renverront une erreur explicite (le mode "réservation" et le paiement "à la
livraison" fonctionnent sans elles).

## Déploiement sur Railway

1. Crée un nouveau projet Railway, ajoute ce dossier comme service (via GitHub
   ou `railway up`)
2. Ajoute un service **PostgreSQL** dans le même projet Railway — la variable
   `DATABASE_URL` sera injectée automatiquement dans ton service backend
3. Renseigne les autres variables d'environnement dans l'onglet "Variables" du
   service (CinetPay, Cloudinary, JWT_SECRET, FRONTEND_URL avec l'URL de ton
   site Next.js une fois déployé)
4. Une fois déployé, exécute une fois `npm run migrate && npm run seed`
   (Railway propose un terminal dans l'onglet du service, ou `railway run`)
5. Dans ton compte CinetPay, configure la `notify_url` avec l'URL Railway de
   ce backend : `https://ton-backend.up.railway.app/api/payments/cinetpay/notify`

## Logique de livraison

Le tarif est calculé automatiquement : `frais de base + (distance × tarif/km)
+ (nombre d'articles × tarif/article)`. Les distances sont pré-remplies pour
les principales villes du Cameroun (voir `src/db/seed.js`, table
`shipping_zones`), à ajuster ou compléter via :

```
POST /api/shipping/zones          { "city": "...", "distanceKm": ... }   (admin)
PUT  /api/shipping/settings       { "baseFee", "pricePerKm", "pricePerItem" }  (admin)
```

## Paiement CinetPay

- `type: "reservation"` → pas de paiement en ligne, réglé en boutique ou à la
  livraison (Landry Express, votre prestataire)
- `type: "achat"`, `paymentMethod: "cash"` → paiement à la livraison, pas
  d'appel à CinetPay
- `type: "achat"`, `paymentMethod: "cinetpay"` → génère un lien de paiement
  CinetPay (Mobile Money MTN/Orange + carte), renvoyé au frontend pour
  rediriger le client. Le vrai statut du paiement est confirmé via le webhook
  `/api/payments/cinetpay/notify`, jamais fait confiance côté client.

## Endpoints principaux

```
POST   /api/auth/admin/login
POST   /api/auth/client/register
POST   /api/auth/client/login
POST   /api/auth/logout
GET    /api/auth/session

GET    /api/categories

GET    /api/products                (?category=&subcategory=&search=)
GET    /api/products/:id
POST   /api/products                (admin)
PUT    /api/products/:id            (admin)
DELETE /api/products/:id            (admin)

POST   /api/upload                  (admin, multipart "file")

GET    /api/clients                 (admin)
DELETE /api/clients/:id             (admin)

POST   /api/shipping/quote          { city, itemCount }
GET    /api/shipping/zones
POST   /api/shipping/zones          (admin)
GET    /api/shipping/settings       (admin)
PUT    /api/shipping/settings       (admin)

GET    /api/orders                  (client: les siennes, admin: toutes)
POST   /api/orders                  (client)
PUT    /api/orders/:id              (admin: statut ; client: annulation)

POST   /api/payments/cinetpay/notify        (webhook CinetPay)
GET    /api/payments/cinetpay/status/:orderId
```

## Prochaine étape

Le frontend Next.js (livré précédemment) utilise encore ses propres routes
`/api/...` internes avec un stockage JSON. La suite logique est de brancher le
frontend sur cette API (remplacer les appels `fetch("/api/...")` par des
appels vers ce backend, avec le cookie de session partagé entre les deux
domaines). On peut s'en occuper dès que tu es prêt.

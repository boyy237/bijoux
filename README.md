# 💎 Bijoux Pro - Système Complet E-Commerce + Dashboard Admin

## 📋 Vue d'ensemble

Un système professionnel et moderne de vente de bijoux en ligne avec:
- **Site e-commerce**: Boutique, catalogue produits, panier, réservations
- **Dashboard admin**: Gestion des réservations, statistiques, gestion de compte
- **Sécurité**: Connexion admin, sessions, localStorage

---

## 🚀 Fichiers créés

### 📁 Site Web E-Commerce
- **index.html** - Homepage avec présentation et produits vedettes
- **products.html** - Catalogue complet avec filtres et recherche
- **cart.html** - Page panier et réservations
- **login.html** - Connexion administrateur

### 📁 Dashboard Admin
- **bijoux.html** - Tableau de bord avec réservations et statistiques
- **bijoux.css** - Style du dashboard moderne

### 📁 Ressources
- **site-style.css** - Style CSS complet du site
- **site-script.js** - Logique JavaScript (panier, produits, localStorage)
- **bijoux.js** - Logique du dashboard (réservations, sessions)
- **products.json** - Données des 8 produits (colliers, bagues, bracelets, etc.)

---

## 🎯 Fonctionnalités

### Site Web
✅ Homepage attractive avec héros section  
✅ Catalogue de 8 produits haut de gamme  
✅ Filtrage par catégorie et prix  
✅ Recherche en temps réel  
✅ Panier persistant (localStorage)  
✅ Gestion quantités  
✅ Réservations sauvegardées  
✅ Design responsive mobile-friendly  

### Dashboard Admin
✅ Liste des réservations en temps réel  
✅ Statistiques (réservations, produits, revenu)  
✅ Recherche de réservations  
✅ Gestion des comptes clients  
✅ Menu interactif  
✅ Lien retour vers site  
✅ Système de déconnexion  

### Sécurité
✅ Authentification admin (email/password)  
✅ Sessions navigateur  
✅ Protection dashboard (redirection login)  

---

## 👤 Identifiants de Test

```
Email:    admin@bijoux.pro
Password: admin123
```

---

## 🔄 Flux utilisateur

### Client
1. Visite `index.html` (homepage)
2. Parcourt `products.html` (catalogue)
3. Ajoute au panier (stocké en localStorage)
4. Aller à `cart.html` pour finaliser
5. Passe la commande
6. Réservation sauvegardée dans localStorage

### Admin
1. Visite `login.html`
2. Se connecte avec admin@bijoux.pro / admin123
3. Accès automatique à `bijoux.html` (dashboard)
4. Voit toutes les réservations clients
5. Peut consulter les statistiques
6. Peut retourner au site via "Retour au site"

---

## 💾 Données persistantes

### localStorage
- **cart** - Panier client actuel
- **reservations** - Toutes les commandes passées

### sessionStorage
- **adminLogged** - État de connexion admin
- **adminEmail** - Email de l'admin connecté

---

## 🎨 Design

- **Couleur principale**: Gold (#d4af37) - Élégance
- **Couleur sombre**: #1a1a1a - Professionnalisme
- **Couleur accent**: #4b90e2 - Modernité
- **Palettes**: Dégradés, ombres douces, animations fluides
- **Typography**: Segoe UI, moderne et lisible

---

## 📱 Responsive

| Appareil | Optimisé |
|----------|----------|
| Desktop | ✅ |
| Tablet | ✅ |
| Mobile | ✅ |

### Points de rupture
- 1200px - Grille grande taille
- 860px - Grille 2 colonnes
- 560px - Mobile optimisé

---

## 🔗 Navigation

```
index.html (Home)
    ↓
products.html (Boutique)
    ↓
cart.html (Panier)
    ↓
login.html (Connexion)
    ↓
bijoux.html (Dashboard Admin)
```

---

## 🎁 Produits inclus

1. **Collier Éternel** - 2150€ (Or blanc + Diamant)
2. **Bague Lumière** - 1980€ (Or rose + Saphir)
3. **Bracelet Charme** - 860€ (Or jaune + Perles)
4. **Boucles d'oreilles Diamant** - 1680€ (Or blanc)
5. **Collier Saphir Royal** - 3200€ (Or blanc + Saphir)
6. **Bague Fiançailles Or** - 4500€ (Or blanc + Diamant)
7. **Montre Luxe Bijou** - 5800€ (Or jaune) [Rupture]
8. **Pendentif Cœur** - 890€ (Or blanc + Rubis)

---

## 🛠️ Améliorations possibles

- [ ] Backend/API (Node.js, Express)
- [ ] Base de données (MongoDB, PostgreSQL)
- [ ] Paiement réel (Stripe, PayPal)
- [ ] Email notifications
- [ ] Multi-langue
- [ ] Avis clients
- [ ] Wishlist
- [ ] Recommandations IA
- [ ] Système de points fidélité

---

## 📊 Architecture

```
moi/
├── index.html              # Homepage
├── products.html           # Catalogue
├── cart.html              # Panier
├── login.html             # Connexion
├── bijoux.html            # Dashboard
├── site-style.css         # Style site
├── site-script.js         # Logic site
├── bijoux.css             # Style dashboard
├── bijoux.js              # Logic dashboard
└── products.json          # Données produits
```

---

## 📞 Support

Pour toute question sur le système:
- Consultez les commentaires du code
- Vérifiez les console logs (F12)
- Testez avec les identifiants fournis

---

## ✨ Créé avec passions - Système Professionnel 2024

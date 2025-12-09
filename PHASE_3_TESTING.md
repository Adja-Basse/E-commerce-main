# Guide de Test - Phase 3 (Produits & Stock) avec Keycloak

## 1. Prérequis

Assurez-vous que tous les services sont démarrés :
```bash
docker-compose up -d
```

Vérifiez que Keycloak est configuré (Realm `ecommerce`, Client `ecommerce-backend`) selon le fichier `KEYCLOAK_SETUP.md`.

## 2. Authentification (Obtenir un Token)

Avant de tester les produits et les stocks, vous devez obtenir un token d'accès (Admin ou Vendeur).

### Option A: Via Auth Service (Recommandé)
**POST** `http://localhost:3001/api/auth/login`
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
*Note: Si l'utilisateur n'existe pas encore, utilisez `/api/auth/register` d'abord.*

### Option B: Via Keycloak Directement
**POST** `http://localhost:8080/realms/ecommerce/protocol/openid-connect/token`
**Headers**: `Content-Type: application/x-www-form-urlencoded`
**Body**:
- `client_id`: `ecommerce-backend`
- `username`: `admin` (ou votre user keycloak)
- `password`: `admin123`
- `grant_type`: `password`
- `client_secret`: (votre secret si configuré, sinon désactivez l'auth client)

Copiez le `access_token` de la réponse.

---

## 3. Configuration Postman

1. Créez une **Collection** "Ecommerce Phase 3".
2. Dans l'onglet **Authorization** de la collection :
   - Type: `Bearer Token`
   - Token: `{{authToken}}` (Collez votre token ici ou utilisez une variable d'environnement).

---

## 4. Tests Product Catalog Service (Port 3002)

### Créer une catégorie (Admin uniquement)
**POST** `http://localhost:3002/api/categories`
**Authorization**: Bearer Token
**Body (JSON)**:
```json
{
  "name": "High-Tech",
  "description": "Smartphones, ordinateurs et accessoires électroniques",
  "isActive": true,
  "displayOrder": 1
}
```
*Copiez l' `_id` retourné pour l'utiliser lors de la création d'un produit (champ `category`).*

### Créer un produit (Admin/Seller uniquement)
**POST** `http://localhost:3002/api/products`
**Authorization**: Bearer Token
**Body (JSON)**:
```json
{
  "name": "Smartphone XYZ Pro",
  "description": "Dernier modèle avec caméra 108MP",
  "sku": "PHONE-XYZ-PRO",
  "price": 999.99,
  "category": "6578a1b2c3d4e5f6a7b8c9d0", // ID MongoDB valide d'une catégorie existante (créez-en une d'abord si besoin)
  "status": "active"
}
```

*Note: Vous devrez peut-être créer une catégorie d'abord via `POST /api/categories`.*

### Lister les produits
**GET** `http://localhost:3002/api/products`

### Voir un produit
**GET** `http://localhost:3002/api/products/{id}`

---

## 5. Tests Inventory Service (Port 3003)

### Ajouter du stock
**POST** `http://localhost:3003/api/stock/add`
**Authorization**: Bearer Token
**Body (JSON)**:
```json
{
  "productId": "PHONE-XYZ-PRO-ID", // Utilisez l'ID du produit créé ci-dessus
  "quantity": 50,
  "reason": "Réception fournisseur"
}
```

### Consulter le stock
**GET** `http://localhost:3003/api/stock/product/{productId}`

### Réserver du stock (Simulation commande)
**POST** `http://localhost:3003/api/stock/reserve`
**Body (JSON)**:
```json
{
  "productId": "PHONE-XYZ-PRO-ID",
  "quantity": 1,
  "reference": "ORDER-12345"
}
```

---

## 6. Vérification des événements (RabbitMQ)

Accédez à l'interface RabbitMQ : `http://localhost:15672` (guest/guest).
Vérifiez les files :
- `stock.events`
- `product.events`

Vous devriez voir des messages transiter lors des mises à jour de stock ou créations de produits.

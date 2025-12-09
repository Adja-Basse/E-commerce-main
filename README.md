# 🚀 E-commerce Microservices Backend

Bienvenue dans l'architecture backend microservices de la plateforme e-commerce. Ce projet est une implémentation complète comprenant l'authentification, la gestion des produits, du stock, du panier, des commandes, des paiements et des notifications, le tout orchestré par un API Gateway et surveillé via Prometheus/Grafana.

## 🏗 Architecture

Le système est composé des services suivants :

| Service | Port Interne | Description |
|---|---|---|
| **API Gateway** | **8000** | **Point d'entrée unique pour toutes les requêtes clients.** |
| Auth Service | 3001 | Gestion des utilisateurs, rôles et authentification (JWT/Keycloak). |
| Product Catalog | 3002 | Gestion des produits, catégories, fournisseurs et avis. |
| Inventory Service | 3003 | Gestion des niveaux de stock et réservations. |
| Cart Service | 3004 | Gestion des paniers clients. |
| Order Service | 3005 | Gestion du cycle de vie des commandes (Saga pattern). |
| Payment Service | 3006 | Simulation de paiement et transactions. |
| Notification Service | 3007 | Envoi d'emails (via Ethereal pour tests). |

**Infrastructure :**
- **MongoDB** : Base de données par service (logique).
- **RabbitMQ** : Bus d'événements pour la communication asynchrone et les transactions distribuées (Sagas).
- **Keycloak** : Identity Access Management (IAM).
- **Consul** : Service Discovery (utilisé pour la configuration).
- **Prometheus** : Collecte des métriques.
- **Grafana** : Visualisation des métriques (Tableau de bord : Microservices Overview).

---

## 🛠 Prérequis

- Docker Desktop installé et démarré.
- Node.js (v18+) pour les tests locaux (optionnel).
- Postman (pour les tests API).

---

## 🚀 Démarrage Rapide

1.  **Cloner le projet** (si ce n'est pas fait).
2.  **Lancer l'environnement Docker** :
    ```bash
    docker-compose up -d --build
    ```
    *Attendez quelques instants que tous les conteneurs soient "healthy" ou en statut "started".*

---

## 🧪 Guide de Test Global (End-to-End)

Suivez ce scénario pour tester l'ensemble du cycle de vente.

### 1. Configuration de l'Authentification (Auth Service)

Toutes les requêtes protégées nécessitent un token.
*Note: Le système utilise Keycloak, mais pour simplifier les tests API directs, le `auth-service` peut générer des tokens si configuré en mode hybrique ou si vous appelez Keycloak directement.*

**Création d'un utilisateur :**
- **POST** `http://localhost:8000/api/auth/register`
- **Body** :
  ```json
  {
    "email": "user@test.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["customer"]
  }
  ```

**Connexion (Récupération du Token) :**
- **POST** `http://localhost:8000/api/auth/login`
- **Body** :
  ```json
  {
    "email": "user@test.com",
    "password": "Password123!"
  }
  ```
- **Réponse** : Copiez le `accessToken` reçu. Il servira d'Authorization Bearer pour la suite.

---

### 2. Gestion du Catalogue (Product Service)

**Créer un produit (Admin/Seller) :**
- **POST** `http://localhost:8000/api/products`
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Body** :
  ```json
  {
    "name": "Smartphone XYZ",
    "description": "Dernier modèle",
    "price": 999.99,
    "sku": "PHONE-001",
    "category": "Electronics"
  }
  ```
- **Réponse** : Notez le `_id` du produit (ex: `PROD_ID`).

**Vérifier le stock initial (Inventory Service) :**
- **GET** `http://localhost:8000/api/stock/PROD_ID`
- *Le stock devrait être 0 ou une valeur par défaut si initialisé.*

**Ajouter du stock :**
- **POST** `http://localhost:8000/api/stock/add`
- **Body** :
  ```json
  {
    "productId": "PROD_ID",
    "quantity": 10
  }
  ```

---

### 3. Parcours Client (Cart & Order)

**Ajouter au panier :**
- **POST** `http://localhost:8000/api/cart/items`
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Body** :
  ```json
  {
    "productId": "PROD_ID",
    "quantity": 2
  }
  ```

**Créer la commande (Checkout) :**
- **POST** `http://localhost:8000/api/orders`
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Body** : (Le panier est récupéré automatiquement via l'ID utilisateur)
  ```json
  {
    "shippingAddress": { "street": "123 Rue de la Paix", "city": "Paris", "country": "France" },
    "billingAddress": { "street": "123 Rue de la Paix", "city": "Paris", "country": "France" }
  }
  ```
- **Réponse** : La commande est créée en statut `PENDING`.
- **Backend Process** :
    1. `order-service` publie `ORDER_CREATED`.
    2. `inventory-service` réserve le stock et publie `STOCK_RESERVED`.
    3. `order-service` reçoit la confirmation et passe la commande à `CONFIRMED`.
    4. `notification-service` envoie un email de "Order Created".

**Vérifier le statut de la commande :**
- **GET** `http://localhost:8000/api/orders/<ORDER_ID>`
- Le statut devrait être `CONFIRMED`.

---

### 4. Paiement (Payment Service)

**Effectuer le paiement :**
- **POST** `http://localhost:8000/api/payments/process`
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Body** :
  ```json
  {
    "orderId": "<ORDER_ID>",
    "amount": 1999.98,
    "paymentMethod": "credit_card",
    "token": "tok_visa"
  }
  ```
- **Réponse** : Paiement succès.
- **Backend Process** :
    1. Le paiement réussit.
    2. `payment-service` publie `PAYMENT_COMPLETED`.
    3. `order-service` écoute et passe la commande à `PAID`.
    4. `notification-service` envoie un email de confirmation de paiement.

---

### 5. Monitoring & Observabilité

**Prometheus (Métriques brutes) :**
- URL : `http://localhost:9091`
- Vérifiez que les "Targets" sont toutes UP.

**Grafana (Tableaux de bord) :**
- URL : `http://localhost:3000` (Login: `admin` / `admin123`).
- Allez dans **Dashboards** > **Microservices Overview**.
- Vous verrez les graphiques de débit de requêtes (RPS) et de latence pour chaque service.

**RabbitMQ (Files d'attente) :**
- URL : `http://localhost:15672` (Login: `guest` / `guest`).
- Observez les échanges et les queues pour vérifier le flux des messages.

---

## ❓ Dépannage

- **Erreur "Connection refused"** : Vérifiez que tous les conteneurs sont démarrés (`docker-compose ps`).
- **Erreur Auth** : Vérifiez que Keycloak est bien lancé ; parfois il met 1-2 minutes à démarrer complètement.
- **Stock non réservé** : Vérifiez les logs de `inventory-service` pour voir si l'événement `ORDER_CREATED` a bien été reçu.

Bon développement ! 🚀

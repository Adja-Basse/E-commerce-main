# Guide de Test - Phase 6 (API Gateway)

## 1. Mise à jour de l'infrastructure
Assurez-vous d'avoir reconstruit les services pour inclure `gateway` :
```bash
docker-compose up -d --build
```

## 2. Accès Uniformisé (Port 8000)
Toutes les requêtes passent maintenant par `http://localhost:8000`.

### Authentification
**POST** `http://localhost:8000/api/auth/login`

### Produits
**GET** `http://localhost:8000/api/products`

### Panier
**GET** `http://localhost:8000/api/cart`
**Authorization**: Bearer Token

### Commandes
**POST** `http://localhost:8000/api/orders`
**Authorization**: Bearer Token

### Paiements
**POST** `http://localhost:8000/api/payments/process`
**Authorization**: Bearer Token

## 3. Avantages
- **Point d'entrée unique** : Plus besoin de retenir les ports 3001, 3002, 3003, etc.
- **Sécurité** : Le Gateway peut implémenter Rate Limiting, CORS centralisé, etc.
- **Abstraction** : Le client ne connaît pas l'architecture microservices sous-jacente.

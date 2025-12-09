# Guide de Test - Phase 4 (Panier & Commandes)

## 1. Mise à jour de l'infrastructure
Assurez-vous d'avoir reconstruit les services pour inclure `cart-service` et `order-service` :
```bash
docker-compose up -d --build
```

## 2. Authentification
Obtenez un token valide (voir Phase 3).

## 3. Tests Cart Service (Port 3004)

### Ajouter un au panier
**POST** `http://localhost:3004/api/cart/items`
**Authorization**: Bearer Token
**Body**:
```json
{
  "productId": "ID_PRODUIT_EXISTANT",
  "quantity": 2,
  "price": 999
}
```

### Voir le panier
**GET** `http://localhost:3004/api/cart`

## 4. Tests Order Service (Port 3005)

### Créer une commande (Déclenche le Saga)
**POST** `http://localhost:3005/api/orders`
**Authorization**: Bearer Token
**Body**:
```json
{
  "items": [
    {
      "productId": "ID_PRODUIT_AVEC_STOCK",
      "quantity": 1,
      "price": 999
    }
  ],
  "shippingAddress": {
    "name": "Jean Dupont",
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  }
}
```

### Vérifier le statut de la commande
**GET** `http://localhost:3005/api/orders/{ORDER_ID}`

- **Statut initial**: `pending`
- **Après quelques secondes** (si stock suffisant) : `confirmed`
- **Si stock insuffisant** : `cancelled` (Raison dans l'historique ou "comment")

## 5. Vérification RabbitMQ
Allez sur `http://localhost:15672` et observez les files :
- `order.events` (Events émis par Order Service)
- `stock.events` (Réponse de Inventory Service)

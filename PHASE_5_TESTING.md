# Guide de Test - Phase 5 (Paiements & Notifications)

## 1. Mise à jour de l'infrastructure
Assurez-vous d'avoir reconstruit les services pour inclure `payment-service` et `notification-service` :
```bash
docker-compose up -d --build
```

## 2. Authentification
Obtenez un token valide.

## 3. Tests Payment Service (Port 3006)

### Simuler un paiement
**POST** `http://localhost:3006/api/payments/process`
**Authorization**: Bearer Token
**Body**:
```json
{
  "orderId": "ID_COMMANDE_CONFIRMEE",
  "amount": 100.50,
  "paymentMethod": "credit_card",
  "token": "tok_visa" 
}
```
*Note: Utilisez `token: "fail_token"` pour simuler un échec.*

### Voir l'historique des transactions
**GET** `http://localhost:3006/api/payments/history`

## 4. Tests Notification Service (Port 3007)
Ce service fonctionne en arrière-plan. Pour vérifier son fonctionnement :
1.  **Créer un utilisateur** : Vérifiez les logs de `notification-service` pour voir "Sending welcome email".
2.  **Effectuer un paiement** : Vérifiez les logs pour voir la réaction à l'événement de paiement.
3.  **Logs Docker** :
    ```bash
    docker-compose logs -f notification-service
    ```
4.  **Ethereal Email** : Si configuré, les logs afficheront une URL de prévisualisation d'email (ex: `https://ethereal.email/message/...`).

## 5. Vérification RabbitMQ
Allez sur `http://localhost:15672`.
- Nouvel échange/queue pour `payment.events`.
- `notification-service` doit avoir des queues liées à `user.events`, `order.events`, `payment.events`.

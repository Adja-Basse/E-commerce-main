# Guide de Test - Phase 7 (Monitoring)

## 1. Mise à jour de l'infrastructure
Assurez-vous d'avoir reconstruit les services pour inclure les endpoints `/metrics` et la configuration Prometheus mise à jour :
```bash
docker-compose up -d --build
```

## 2. Vérification Prometheus
Allez sur `http://localhost:9091`.
- **Status > Targets** : Vérifiez que tous les services (gateway, auth, product-catalog, inventory, cart, order, payment, notification) sont "UP".
- **Graph** : Tapez `http_request_duration_seconds_count` et cliquez sur "Execute". Vous devriez voir des données si vous avez fait des requêtes.

## 3. Grafana Dashboard
Allez sur `http://localhost:3000`.
- **Login** : admin / admin123
- **Dashboards** : Allez dans "Dashboards" (ou "Browse"). Vous devriez voir "Microservices Overview".
- **Visualisation** :
    - Générez du trafic (utilisez Postman pour faire des requêtes au Gateway).
    - Observez les graphiques "Request Rate" et "Average Request Duration" se mettre à jour.

## 4. Test de Charge (Optionnel)
Pour voir les graphiques bouger, vous pouvez utiliser un outil comme `ab` (Apache Benchmark) ou faire plusieurs requêtes curl :
```bash
for i in {1..20}; do curl http://localhost:8000/api/products; done
```
Regardez ensuite Grafana.

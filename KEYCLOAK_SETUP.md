# Configuration Keycloak

## Démarrage

Keycloak a été ajouté au docker-compose.yml. Pour le démarrer :

```bash
docker-compose up -d keycloak
```

## Accès à Keycloak

- **URL Admin Console**: http://localhost:8080
- **Username**: admin
- **Password**: admin123

## Configuration initiale

### 1. Créer un Realm

1. Connectez-vous à http://localhost:8080
2. Allez dans "Master" (menu en haut à gauche)
3. Cliquez sur "Create Realm"
4. Nom du realm: `ecommerce`
5. Cliquez sur "Create"

### 2. Créer un Client

1. Dans le realm `ecommerce`, allez dans "Clients"
2. Cliquez sur "Create client"
3. **Client ID**: `ecommerce-backend`
4. **Client authentication**: ON (pour utiliser client secret)
5. **Authorization**: OFF
6. Cliquez sur "Next"
7. **Valid redirect URIs**: `*` (pour le développement)
8. **Web origins**: `*` (pour le développement)
9. Cliquez sur "Save"

### 3. Récupérer le Client Secret

1. Dans les paramètres du client `ecommerce-backend`
2. Allez dans l'onglet "Credentials"
3. Copiez le "Client secret"
4. Ajoutez-le dans le `.env` du service auth:
   ```
   KEYCLOAK_CLIENT_SECRET=votre_client_secret_ici
   ```

### 4. Créer les Rôles

1. Dans le realm `ecommerce`, allez dans "Realm roles"
2. Créez les rôles suivants:
   - `admin`
   - `customer`
   - `seller`
   - `moderator`

### 5. Activer le Password Grant Type

1. Dans les paramètres du client `ecommerce-backend`
2. Allez dans l'onglet "Settings"
3. Activez "Direct access grants"
4. Cliquez sur "Save"

## Variables d'environnement

Ajoutez ces variables dans le `.env` du service auth ou dans docker-compose.yml:

```env
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=ecommerce
KEYCLOAK_CLIENT_ID=ecommerce-backend
KEYCLOAK_CLIENT_SECRET=votre_client_secret
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
```

## Mode de fonctionnement

Le service auth fonctionne en mode **hybride** :

1. **Si Keycloak est configuré** :
   - Les utilisateurs sont créés dans Keycloak ET MongoDB
   - Les tokens sont générés par Keycloak
   - Les rôles sont synchronisés entre Keycloak et MongoDB

2. **Si Keycloak n'est pas configuré** :
   - Fallback automatique vers JWT
   - Fonctionnement normal avec MongoDB uniquement

## Test

Une fois Keycloak configuré, testez l'inscription :

```bash
POST http://localhost:3001/api/auth/register
{
  "email": "test@example.com",
  "password": "Password123",
  "firstName": "Test",
  "lastName": "User"
}
```

Le token retourné sera un token Keycloak au lieu d'un JWT.


# Guide Postman - Auth Service

## Configuration de base

### URL de base
```
http://localhost:3001
```

## Endpoints disponibles

### 1. Inscription (Register)
**Méthode:** `POST`  
**URL:** `http://localhost:3001/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "abc123..."
  }
}
```

### 2. Connexion (Login)
**Méthode:** `POST`  
**URL:** `http://localhost:3001/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "abc123..."
  }
}
```

### 3. Profil utilisateur (Me)
**Méthode:** `GET`  
**URL:** `http://localhost:3001/api/auth/me`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 4. Rafraîchir le token (Refresh Token)
**Méthode:** `POST`  
**URL:** `http://localhost:3001/api/auth/refresh`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "refreshToken": "votre_refresh_token_ici"
}
```

### 5. Déconnexion (Logout)
**Méthode:** `POST`  
**URL:** `http://localhost:3001/api/auth/logout`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "refreshToken": "votre_refresh_token_ici"
}
```

## Règles de validation

### Mot de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre

### Email
- Format email valide

## Erreurs communes

1. **"Route not found"**
   - Vérifiez que l'URL est correcte : `/api/auth/register` et non `/api/register`
   - Vérifiez la méthode HTTP (POST, GET, etc.)

2. **"Validation failed"**
   - Vérifiez le format du JSON
   - Vérifiez que tous les champs requis sont présents
   - Vérifiez les règles de validation (mot de passe, email)

3. **"Cannot POST /api/auth/register"**
   - Vérifiez que le service est démarré : `docker-compose ps`
   - Vérifiez les logs : `docker-compose logs auth-service`

## Test rapide avec curl

```bash
# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```


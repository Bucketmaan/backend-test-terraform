# Backend CRUD API - Déploiement AWS Lambda

## 🚀 Préparation pour Lambda

Le backend a été optimisé pour AWS Lambda :

### ✅ Modifications effectuées

1. **Suppression de `type: "module"`** 
   - Utilisation cohérente de CommonJS (require/module.exports)
   - Compatible avec serverless-express

2. **Optimisation du pool PostgreSQL**
   - Pool de connexions limité (max 2 connexions)
   - Timeouts configurés pour Lambda
   - Fermeture automatique des connexions inactives après 60s

3. **Amélioration du handler Lambda**
   - Réutilisation du handler entre invocations
   - Gestion du cleanup du pool après chaque requête
   - `callbackWaitsForEmptyEventLoop = false` pour éviter les timeouts

4. **Configuration robuste**
   - `trust proxy: true` pour fonctionner derrière API Gateway
   - Gestion globale des erreurs
   - Endpoint `/health` avec timestamp

## 📦 Structure du déploiement

L'application est déployée comme une Lambda Function qui se connecte à une base PostgreSQL :

```
API Gateway → Lambda (serverless-express) → PostgreSQL
```

## 🔐 Variables d'environnement requises

Sur AWS Lambda, définir les variables suivantes :

```
PG_HOST         # Endpoint RDS (ex: my-db.c9akciq32.us-east-1.rds.amazonaws.com)
PG_PORT         # Port PostgreSQL (défaut: 5432)
PG_USER         # Utilisateur PostgreSQL
PG_PASSWORD     # Mot de passe PostgreSQL
PG_DATABASE     # Nom de la base de données
PG_SSL          # Utiliser SSL (true/false, recommandé: true pour RDS)
NODE_ENV        # Définir à "production"
```

## 📝 Points d'entrée

- **Pour développement local** : `src/index.js` (démarre un serveur Express sur le port 3000)
- **Pour AWS Lambda** : `src/lambda.js` → exports.handler

## 🏗️ Infrastructure Terraform recommandée

### Lambda Configuration
```hcl
handler      = "src/lambda.js"  # Chemin du handler
runtime      = "nodejs.20.x"    # Node.js 20 ou supérieur
timeout      = 30               # Timeout en secondes
memory_size  = 512              # RAM en MB

environment {
  variables = {
    PG_HOST     = aws_db_instance.postgres.endpoint
    PG_USER     = aws_db_instance.postgres.username
    PG_PASSWORD = aws_db_instance.postgres.password
    PG_DATABASE = "crud_db"
    PG_SSL      = "true"
    NODE_ENV    = "production"
  }
}

vpc_config {
  # Lambda doit être dans le même VPC que RDS
  subnet_ids         = [aws_subnet.private.id]
  security_group_ids = [aws_security_group.lambda.id]
}
```

### API Gateway
```hcl
# Proxy integration avec Lambda
resource "aws_api_gateway_integration" "lambda" {
  type                       = "AWS_PROXY"
  integration_http_method    = "POST"
  uri                        = aws_lambda_function.backend.invoke_arn
  payload_format_version     = "2.0"
}
```

## ✨ Optimisations pour la production

1. ✅ **Minifier et bundler** les dépendances avec esbuild
2. ✅ **Layers** AWS pour node_modules (réduire le package size)
3. ✅ **CloudWatch Logs** pour les erreurs et métriques
4. ✅ **VPC** pour accéder à RDS en privé
5. ✅ **IAM Roles** avec permissions minimales

## 🧪 Test local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur Express
npm start

# Test endpoint
curl http://localhost:3000/health
```

## 🚀 Déploiement

Le fichier `.github/workflows/deploy.yml` peut être utilisé pour CI/CD automatisé.

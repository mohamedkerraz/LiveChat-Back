# Définit le répertoire de travail dans le conteneur
FROM node:20
WORKDIR /app

# Installe pnpm
RUN npm install -g pnpm

# Copie le fichier firebaseAuth.json
COPY firebaseAuth.json .

# Copie le code de l'application dans le répertoire de travail
COPY . .

# Installe les dépendances de l'application
RUN pnpm install

# Définit la commande par défaut à exécuter dans le conteneur
CMD ["pnpm", "start"]

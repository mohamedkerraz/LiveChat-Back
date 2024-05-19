# Définit le répertoire de travail dans le conteneur
FROM node:20
WORKDIR /app

# Installe pnpm
RUN npm install -g pnpm

#! Copie le fichier firebaseAuth.json
COPY firebaseAuth.json .

# Copie le script wait-for-it dans le conteneur
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh

# Donne les permissions d'exécution
RUN chmod 744 /usr/local/bin/wait-for-it.sh

# Copie le code de l'application dans le répertoire de travail
COPY . .

# Installe les dépendances de l'application
RUN pnpm install

# Définit la commande par défaut à exécuter dans le conteneur
ENTRYPOINT ["/usr/local/bin/wait-for-it.sh", "rabbitmq:5672", "--", "/usr/local/bin/wait-for-it.sh", "mongo:27017", "--"]

# Commande pour démarrer votre application livechat-b
CMD ["pnpm", "start"]

FROM node:20-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiem el codi del backend a l'arrel de /app
COPY backend/ .

# Copiem la carpeta public (que ara està al context) a /app/public
COPY public/ ./public/

EXPOSE 4000
CMD ["node", "index.js"]

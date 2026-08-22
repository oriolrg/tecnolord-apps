FROM node:20-alpine

RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema prisma/schema.prisma && npm run start"]

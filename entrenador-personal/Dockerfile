FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi

COPY . .

RUN npx prisma generate && npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]

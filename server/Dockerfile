FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN addgroup -S app && adduser -S appuser -G app
USER appuser

EXPOSE 5000

CMD ["npm", "start"]

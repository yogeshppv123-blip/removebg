# Bridge API Dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy source code and public assets
COPY . .

EXPOSE 5002

CMD ["npm", "start"]

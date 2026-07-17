FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

RUN mkdir -p uploads/videos

EXPOSE 3001

CMD ["node", "src/server.js"]

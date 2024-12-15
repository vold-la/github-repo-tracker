FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY --from=build /app/dist ./dist

RUN npm install --production && \
    npm install typeorm@0.3.17 ts-node@10.9.2 @types/node

# script to run migrations and start server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npm run migration:run' >> /app/start.sh && \
    echo 'node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 4005

CMD ["/app/start.sh"] 
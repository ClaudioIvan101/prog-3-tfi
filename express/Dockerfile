FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node index.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node tests ./tests

USER node

EXPOSE 3000

CMD ["node", "index.js"]
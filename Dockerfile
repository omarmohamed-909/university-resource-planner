FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci --omit=dev -w server && npm cache clean --force
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
WORKDIR /app/server
EXPOSE 5000
CMD ["node", "server.js"]

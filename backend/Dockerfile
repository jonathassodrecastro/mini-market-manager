FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./

FROM base AS development
RUN pnpm install
COPY . .
CMD ["pnpm", "dev"]

FROM base AS builder
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY prisma ./prisma
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]

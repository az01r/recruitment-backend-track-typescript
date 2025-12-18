# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# --- Development Stage ---
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# --- Build Stage ---
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# --- Production Stage ---
FROM base AS production
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
CMD ["npm", "start"]
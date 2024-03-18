#  FROM node:lts-slim AS builder



# WORKDIR /app

# COPY package.json ./
# COPY pnpm-lock.yaml ./

# RUN apt-get update -y && apt-get install -y openssl

# RUN npm install -g pnpm
# RUN pnpm install

# COPY . .

# RUN pnpm build

# FROM node:lts-slim

# WORKDIR /app

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/pnpm-lock.yaml ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 3000

# CMD [ "npm", "run", "prod" ]




# FROM node:20-slim AS builder

# WORKDIR /app

# COPY package.json ./
# COPY pnpm-lock.yaml ./

# RUN apt-get update -y && apt-get install -y openssl


# RUN npm install -g pnpm
# RUN pnpm install

# COPY . .

# RUN pnpm build


# FROM node:lts-slim

# WORKDIR /app


# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/pnpm-lock.yaml ./
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/tsconfig.json ./

# EXPOSE 3005

# CMD [ "npm", "run", "start"]



FROM node:20-slim as build-stage

WORKDIR /app

COPY package.json .


RUN npm install -g pnpm

RUN pnpm install



COPY . .

RUN npm run build

# production stage
FROM node:20-slim as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/pnpm-lock.yaml ./
COPY --from=build-stage /app/tsconfig.json ./

WORKDIR /app

RUN npm install -g pnpm

RUN npm install -production

# RUN apt-get clean

# RUN apt-get update && apt-get install -y redis-tools


RUN chown -R node:node /app

EXPOSE 3000

CMD ["node", "/app/main.js"]


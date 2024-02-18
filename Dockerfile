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
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN apt-get update -y && apt-get install -y openssl

# RUN npm config set registry https://registry.npmmirror.com/

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build


FROM node:lts-slim

WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

EXPOSE 3005

CMD [ "npm", "run", "start"]
# production stage
# FROM node:lts-slim as production-stage

# COPY --from=build-stage /app/dist /app
# COPY --from=build-stage /app/package.json /app/package.json

# WORKDIR /app

# # RUN npm config set registry https://registry.npmmirror.com/

# RUN npm install -g pnpm
# RUN pnpm install --production

# EXPOSE 3005

# # CMD ["node", "/app/main.js"]
# CMD ["npm","run"]

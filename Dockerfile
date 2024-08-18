# Stage 1: Install dependencies
FROM node:20 AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Stage 2: Build the project
FROM node:20 AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Prepare the final lightweight image
FROM node:20-alpine3.19 AS release
WORKDIR /app

RUN apk add --no-cache python3 ffmpeg

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]

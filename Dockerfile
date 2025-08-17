FROM node:20-alpine

RUN apk add --no-cache git bash

RUN npm install -g pnpm
# yoki
RUN npm install -g yarn

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --frozen-lockfile

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]

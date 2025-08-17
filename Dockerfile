FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --frozen-lockfile

RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

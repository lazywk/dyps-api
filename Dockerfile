FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --frozen-lockfile

RUN npx prisma generate

RUN npx prisma migrate deploy

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]

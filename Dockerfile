FROM node:18-alpine as base

WORKDIR /user/src/app

COPY package*.json ./

RUN npm ci --omit=dev
RUN npm i -g typescript

ENV NODE_ENV=production

COPY . .
EXPOSE 4000

RUN tsc
CMD ["node", "dist/index"]
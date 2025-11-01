ARG NODE_VERSION=23.7.0

FROM node:${NODE_VERSION}-alpine


ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "src/index.js"]
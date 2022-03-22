FROM node:16.13.1-alpine3.15

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV NODE_ENV production

RUN npm install pm2 -g

COPY package.json /usr/src/app/

RUN npm install

COPY . /usr/src/app/

EXPOSE 8500

CMD ["npm", "run", "start:pm2"]
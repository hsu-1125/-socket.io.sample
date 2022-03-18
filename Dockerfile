FROM node:12.13.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# COPY . /usr/src/app
COPY package-lock.json /usr/src/app/

RUN npm install
RUN npm install socket.io
RUN npm install -g pm2

COPY . /usr/src/app
#RUN ./node_modules/

# ENV node_env=production

EXPOSE 8500

CMD ["node","server.js"]

# CMD [ "npm", "run", "start:pm2" ]


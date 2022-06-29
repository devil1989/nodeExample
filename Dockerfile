FROM dockerhub..com/node:8.9.1

ADD . /app

WORKDIR /app

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "prod"]


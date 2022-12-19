FROM node:16.15.0

ADD . /gpclub

WORKDIR /gpclub

RUN npm install

EXPOSE 10129

CMD ["npm", "run", "prod"]


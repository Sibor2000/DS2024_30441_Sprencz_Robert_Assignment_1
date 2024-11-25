FROM node:20

WORKDIR /src

COPY ./src/package.json .

RUN npm install

COPY ./src ./

EXPOSE 3002

CMD [ "node", "./server/app.js" ]
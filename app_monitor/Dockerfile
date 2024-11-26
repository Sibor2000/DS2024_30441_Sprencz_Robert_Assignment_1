FROM node:20

WORKDIR /src

COPY ./src/package.json .

RUN npm install

COPY ./src ./

EXPOSE 3003

EXPOSE 4000

CMD [ "node", "./server/app.js" ]
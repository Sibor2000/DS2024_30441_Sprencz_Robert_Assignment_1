FROM node:20

WORKDIR /src

COPY ./src/package.json .

RUN npm install

COPY ./src ./

#Why no env var
EXPOSE 3000

CMD [ "node", "./server/app.js" ]
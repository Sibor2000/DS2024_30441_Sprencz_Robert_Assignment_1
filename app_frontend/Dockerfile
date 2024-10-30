FROM node

WORKDIR /src

COPY package.json .

RUN npm install

COPY . ./

RUN npm i -g serve

EXPOSE 3000

RUN npm run build

CMD [ "serve", "-s", "dist" ]

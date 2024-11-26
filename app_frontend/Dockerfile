FROM node

WORKDIR /src

COPY package.json .

RUN npm install

COPY . ./

RUN npm i -g serve

EXPOSE 3001

RUN npm run build

CMD [ "serve", "-s", "dist" ]

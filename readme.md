All three microservices are containerized with docker.

We need to set our environment variables in a `.env` file based on `.env.example`.

In order to run simply have to run `docker compose up --build` from the terminal, with docker installed.

In order to run locally, make sure to run `npm install` from each microservice directory, then run `npm run dev` for the frontend service and `node server/app.js`
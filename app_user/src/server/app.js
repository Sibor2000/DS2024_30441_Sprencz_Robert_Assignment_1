import express from "express"
import "dotenv/config"

import client from "./client.js"
import userRouter from "./users.js"

import cors from "cors"
import { checkForUser } from "./queue.js"
import setUpDb from "../util/db_table_setup.js"

await setUpDb();
//await client.connect();

const app = express();

const corsOptions = {
    origin: 'http://app.localhost:5000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(express.json());
app.use(cors(corsOptions))
app.use(userRouter);

/*
app.use(cors(corsOptions))
app.options(cors(corsOptions))
app.use(cors(),userRouter);
*/
checkForUser();

const port = process.env.BACKEND_PORT;
app.listen(port, ()=>{
    console.log(`User server is running on: ${process.env.BACKEND_PORT}`);
})
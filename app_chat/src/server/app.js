import express from "express"
import "dotenv/config"

import client from "./client.js"
import chatRouter from "./routes.js"

import cors from "cors"
import { connectWebsocket } from "./websocket.js"
//import { userDeleted } from "./queue.js"
//import setUpDb from "../util/db_table_setup.js"

//setUpDb();
await client.connect();

const app = express();

app.use(express.json());

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions))
app.use(chatRouter);

connectWebsocket();

const port = process.env.CHAT_PORT;
app.listen(port, ()=>{
    console.log(`Chat server running on: ${process.env.CHAT_PORT}`);
})
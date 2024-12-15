import express from "express"
import "dotenv/config"

import monitorRouter from "./monitored.js"
import client from "./client.js"
import cors from "cors"
import { amqpListen } from "./queue.js"
import {connectWebsocket} from "./websocket.js"
import setUpDb from "../util/db_table_setup.js"

setUpDb();
//await client.connect();

const app = express();

app.use(express.json());

app.use(cors(),monitorRouter);

//takeMeasurements();

amqpListen();
connectWebsocket();

const port = process.env.MONITOR_PORT;
app.listen(port, ()=>{
    console.log(`Monitor server running on: ${process.env.MONITOR_PORT}`);
})
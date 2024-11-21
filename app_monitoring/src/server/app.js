import express from "express"
import "dotenv/config"

import monitorRouter from "./monitored.js"
import client from "./client.js"
import cors from "cors"
import { amqpListen } from "./queue.js"
//import setUpDb from "../util/db_table_setup.js"

//setUpDb();
await client.connect();

const app = express();

app.use(express.json());

app.use(cors(),monitorRouter);

//takeMeasurements();

amqpListen();

const port = process.env.BACKEND_PORT;
app.listen(port, ()=>{
    console.log(`Monitoring server running on: ${process.env.BACKEND_PORT}`);
})
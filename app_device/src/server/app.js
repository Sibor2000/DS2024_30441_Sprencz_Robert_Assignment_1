import express from "express"
import "dotenv/config"

import client from "./client.js"
import deviceRouter from "./devices.js"

import cors from "cors"
import { userDeleted } from "./queue.js"
import setUpDb from "../util/db_table_setup.js"

//setUpDb();
await client.connect();

const app = express();

app.use(express.json());

app.use(cors(),deviceRouter);

userDeleted();

const port = process.env.BACKEND_PORT;
app.listen(port, ()=>{
    console.log(`Device server running on: ${process.env.BACKEND_PORT}`);
})
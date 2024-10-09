import express from "express"
import "dotenv/config"

import client from "./client.js"
import deviceRouter from "./devices.js"

await client.connect();

const app = express();

const port = process.env.BACKEND_PORT;

app.use(express.json());

app.use(deviceRouter);

app.listen(port, ()=>{
    console.log(`Device server running on: ${process.env.BACKEND_PORT}`);
})
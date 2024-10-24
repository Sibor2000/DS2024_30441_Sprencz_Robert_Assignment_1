import express from "express"
import "dotenv/config"

import client from "./client.js"
import userRouter from "./users.js"

import cors from "cors"
import { checkForUser } from "./queue.js"

await client.connect();

const app = express();

const port = process.env.BACKEND_PORT;

app.use(express.json());

app.use(cors(),userRouter);

checkForUser();

app.listen(port, ()=>{
    console.log(`User server is running on: ${process.env.BACKEND_PORT}`);
})
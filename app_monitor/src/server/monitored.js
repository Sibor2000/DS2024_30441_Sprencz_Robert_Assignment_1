import express from "express"
import client from "./client.js"

import { permitAdminOrSelf, verifyJWT } from "../util/permission_middleware.js"
import { validateUUID } from "../util/regexes.js"

const router = express.Router()
export default router

//? Get measurements for a device
router.get("/device/:id", /*verifyJWT,*/ async (req, res) => {

    if (!validateUUID(req.params.id)) {
        return res.status(400).send({ message: "Invalid UUID" })
    }

    const query = {
        name: "get_device_measurements",
        text: "select * from \"energy_consumption\" where device_id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);
        if (result.rowCount == 0) {
            res.sendStatus(404);
            return
        }

        const tableLabels = []
        const tableData = []

        const measurements = result.rows;
        measurements.sort((a, b) => a.time - b.time)
        measurements.forEach(element => {
            console.log(element)
            tableLabels.push(new Date(element.time * 1).toLocaleString())
            tableData.push(element.measurement_value)
        })

        res.send({
            tableLabels: tableLabels,
            tableData: tableData
        });
    } catch (error) {
        console.log(error);
    }
})

//? Get measurements for a list of devices
router.get("/devices", async (req, res) => {
    const idList = req.query.ids

    if(!idList){
        return res.sendStatus(400)
    }

    const placeholders = idList.map((_, index) => `$${index + 1}`).join(',');
    const query = {
        text: `SELECT * FROM "energy_consumption" WHERE device_id IN (${placeholders})`,
        values: idList
    };

    const result = await client.query(query)

    res.send(result.rows)
})
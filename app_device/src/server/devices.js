import express from "express"
import client from "./client.js"
import crypto from "crypto"

import { validatePassword, validateUUID } from "../util/regexes.js"
import { permitAdminOrSelf, verifyJWT } from "../util/permission_middleware.js"
import { RoleOptions } from "../util/role_options.js"
import { checkForUser, deviceAddMonitor, deviceDeleteMonitor , deviceEditMonitor } from "./queue.js"

const router = express.Router()
export default router

// TODO: might want to check what permissions does a user have (edit, add)

//? Get all devices
//If not an admin, only see own devices
router.get("/devices", verifyJWT, async (req, res) => {
    const query = req.user.role == "admin" ? "select * from \"device\"" : {
        name: "get_device",
        text: "select * from \"device\" where owner_id=$1",
        values: [req.user.id]
    }

    try {
        const result = await client.query(query);
        const preparedResult = {
            fields: result.fields.map(field => field.name),
            rowCount: result.rowCount,
            rows: result.rows
        }

        res.send(preparedResult);
    } catch (error) {
        console.log(error);
    }
})

//? Get device by ID
//If not an admin, only see own device
router.get("/device/:id", verifyJWT, async (req, res) => {
    const query = req.user.role == "admin" ? {
        name: "get_device",
        text: "select * from \"device\" where id=$1",
        values: [req.params.id]
    } : {
        name: "get_device",
        text: "select * from \"device\" where id=$1 and owner_id=$2",
        values: [req.params.id, req.user.id]
    }

    try {
        const result = await client.query(query);
        if (result.rowCount == 0) {
            res.sendStatus(404);
            return
        }
        res.send(result.rows.at(0));
    } catch (error) {
        console.log(error);
    }
})

//? Add device with user check
router.post("/device", verifyJWT, checkForUser, async (req, res) => {
    try {
        let genUUID = crypto.randomUUID();

        const deviceData = {
            ...req.body,
            id: genUUID
        }

        //TODO: change the query req.body -> deviceData
        const query = {
            name: "add_device",
            text: "insert into \"device\" (id, description, address, max_nrg_con_per_hour, owner_id) values ($1,$2,$3,$4,$5);",
            values: [
                genUUID,
                req.body.description,
                req.body.address,
                req.body.max_nrg_con_per_hour,
                req.body.owner_id
            ],
        }
        const result = await client.query(query);

        deviceAddMonitor(JSON.stringify(deviceData))

        res.send({ "id": genUUID });
        return
    } catch (err) {
        console.log(err);
    }
})

//? Update device
router.put("/device/:id", verifyJWT, async (req, res) => {
    try {
        if (!validateUUID(req.body.owner_id)) {
            res.status(400).send({ "message": "Invalid owner id" })
            return
        }

        const deviceData = {
            ...req.body,
            id: req.params.id
        }

        const query = {
            name: "update_device",
            text: "update \"device\" set description=$1, address=$2, max_nrg_con_per_hour=$3, owner_id=$4 where id=$5",
            values: [
                req.body.description,
                req.body.address,
                req.body.max_nrg_con_per_hour,
                req.body.owner_id,
                req.params.id
            ]
        }
        const result = await client.query(query);

        if (result.rowCount == 0) {
            res.sendStatus(404);
            return;
        }

        deviceEditMonitor(JSON.stringify(deviceData))

        res.send(result);
    } catch (err) {
        console.log(err);
    }
})

//? Delete device
router.delete("/device/:id", verifyJWT, async (req, res) => {
    const query = {
        name: "delete_device",
        text: "delete from \"device\" where id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);
        if (result.rowCount == 0) {
            res.sendStatus(404);
            return
        }
        res.send({ "message": "Deleted successfully" });
    } catch (err) {
        console.log(err);
    }

})

//? Get devices by user id
router.get("/user/:id/devices", verifyJWT, permitAdminOrSelf, async (req, res) => {
    const selectQuery = {
        name: "select_device_by_ownerid",
        text: "select * from \"device\" where owner_id=$1",
        values: [req.params.id]
    }

    try {
        const selectResult = await client.query(selectQuery);

        if(selectResult.rowCount == 0){
            return res.send({"message":"User has no devices"})
        }

        res.send(selectResult.rows)
    } catch (error) {
        console.log(error)
    }
})

//? Delete devices by user id
router.delete("/user/:id/devices", verifyJWT, permitAdminOrSelf, async (req, res) => {
    const selectQuery = {
        name: "select_device_by_ownerid",
        text: "select * from \"device\" where owner_id=$1",
        values: [req.params.id]
    }
    const deleteQuery = {
        name: "delete_device_by_userid",
        text: "delete from \"device\" where owner_id=$1",
        values: [req.params.id]
    }

    try {
        const selectResult = await client.query(selectQuery);

        selectResult.rows.forEach(element => {
            deviceDeleteMonitor(element.id)
        })

        const deleteResult = await client.query(deleteQuery)

        res.send({
            rowCount: deleteResult.rowCount,
        });

    } catch (error) {
        console.log(error)
    }
})

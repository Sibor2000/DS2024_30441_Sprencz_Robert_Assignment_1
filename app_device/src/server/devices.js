import express from "express"
import client from "./client.js"
import crypto from "crypto"

import {validatePassword, validateUUID} from "../util/regexes.js"
import {permitAdminOrSelf} from "../util/permission_middleware.js"
import {RoleOptions} from "../util/role_options.js"

const router = express.Router()
export default router

//? Get all devices
router.get("/devices",/*rolesPermissionFilter(["admin"]),*/ async (req, res) => {
    const query = "select * from \"device\""
    try {
        const result = await client.query(query);
        const preparedResult = {
            fields: result.fields.map(field => field.name),
            rowCound: result.rowCount,
            rows: result.rows
        }
        res.send(preparedResult);
    } catch (error) {
        console.log(error);
    }
})

//? Get device by ID
router.get("/device/:id", /*loggedInFilter,*/ async (req, res) => {
    const query = {
        name: "get_device",
        text: "select * from \"device\" where id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);
        if(result.rowCount==0){
            res.sendStatus(404);
        }
        res.send(result.rows.at(0));
    } catch (error) {
        console.log(error);
    }
})

//? Add device
router.post("/device",/*rolesPermissionFilter(["admin"]),*/ async (req, res) => {
    try {
        if(!validateUUID(req.body.owner_id)){
            res.status(400).send({"message":"Invalid owner id"})
            return
        }
        let genUUID = crypto.randomUUID();

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
        res.send({ "id": genUUID });
    } catch (err) {
        console.log(err);
    }
})

//? Update device
router.put("/device/:id", /*permitAdminOrSelf,*/ async (req, res) => {
    try {
        if(!validateUUID(req.body.owner_id)){
            res.status(400).send({"message":"Invalid owner id"})
            return
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

        if(result.rowCount==0){
            res.sendStatus(404);
            return;
        }
        res.send(result);
    } catch (err) {
        console.log(err);
    }
})

//? Delete device
router.delete("/device/:id", /*permitAdminOrSelf,*/ async (req, res) => {
    const query = {
        name: "delete_device",
        text: "delete from \"device\" where id=$1",
        values: [req.params.id]
    }
    
    try {
        const result = await client.query(query);
        if(result.rowCount==0){
            res.sendStatus(404);
            return
        }
        res.send({"message":"Deleted successfully"});
    } catch (err) {
        console.log(err);
    }

})
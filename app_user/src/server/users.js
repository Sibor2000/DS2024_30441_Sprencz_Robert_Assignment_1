import express from "express"
import client from "../server/client.js"
//import crypto, { createHash } from "crypto"
//const crypto = await import("node:crypto")
import crypto, { createHash } from "crypto"


import { validatePassword } from "../util/regexes.js"
import { rolesPermissionFilter, permitAdminOrSelf, verifyJWT } from "../util/permission_middleware.js"
import { RoleOptions } from "../util/role_options.js"

import { userDeleted } from "./queue.js"
import { SignJWT } from "jose"
import { console } from "inspector"

const router = express.Router()
export default router

//? Get all users
router.get("/users", verifyJWT, /*rolesPermissionFilter(["admin"]),*/ async (req, res) => {
    const query = req.user.role == "admin" ? "select * from \"user\"" : `select * from \"user\" where id='${req.user.id}'`

    try {
        const result = await client.query(query);
        const preparedResult = {
            fields: result.fields.map(field => field.name).filter(field => field !== "password"),
            rowCount: result.rowCount,
            rows: result.rows
        }

        preparedResult.rows.forEach(element => {
            delete element["password"]
        });

        res.send(preparedResult);

    } catch (error) {
        console.log(error);
    }
})

//? Get user by ID
// If user is not an admin, or id doesn't match, reject
router.get("/user/:id", verifyJWT, permitAdminOrSelf, async (req, res) => {

    const query = {
        name: "get_user",
        text: "select * from \"user\" where id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);

        if (result.rowCount == 0) {
            res.sendStatus(404);
        }

        res.send(result.rows.at(0));

    } catch (error) {
        console.log(error);
    }
})

//? Add user
router.post("/user", verifyJWT, rolesPermissionFilter(["admin"]), async (req, res) => {
    try {
        if (!validatePassword(req.body.password)) {
            res.status(400).send({ "message": "Invalid password" })
            return
        }

        if (!(req.body.role in RoleOptions)) {
            res.status(400).send({ "message": "Invalid role" })
            return
        }

        let query = {
            name: "check_user",
            text: "select * from \"user\" where name=$1",
            values: [req.body.name]
        }

        let result = await client.query(query);
        if (result.rowCount > 0) {
            res.status(400).send({ "message": "Name already taken" });
            return
        }

        let genUUID = crypto.randomUUID();

        const hashAlgo = process.env.HASH_ALGO || 'sha256';
        const hasher = crypto.createHash(hashAlgo)
        hasher.update(req.body.password)
        const pass = hasher.digest('hex')

        query = {
            name: "add_user",
            text: "insert into \"user\" (id, name, role, password) values ($1,$2,$3,$4);",
            values: [
                genUUID,
                req.body.name,
                req.body.role,
                pass,
            ],
        }
        result = await client.query(query);

        res.send({ "id": genUUID });
    } catch (error) {
        console.log(error)
        res.send({ "message": "Incorrect register" })
    }
})

//? Update user by id
router.put("/user/:id", verifyJWT, permitAdminOrSelf, async (req, res) => {
    try {
        if (!validatePassword(req.body.password)) {
            res.status(400).send({ "message": "Invalid password" })
            return
        }

        if (!(req.body.role in RoleOptions)) {
            res.status(400).send({ "message": "Invalid role" })
        }

        const query = {
            name: "update_user",
            text: "update \"user\" set name=$1, role=$2, password=$3 where id=$4",
            values: [
                req.body.name,
                req.body.role,
                crypto.createHash(process.env.HASH_ALGO).update(req.body.password).digest('hex'),
                req.params.id
            ]
        }
        const result = await client.query(query);

        if (result.rowCount == 0) {
            res.sendStatus(404);
            return;
        }
        res.send(result);
    } catch (err) {
        console.log(err);
    }
})

//? Delete user by id
router.delete("/user/:id", verifyJWT, permitAdminOrSelf, async (req, res) => {

    const query = {
        name: "delete_user",
        text: "delete from \"user\" where id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);
        if (result.rowCount == 0) {
            res.sendStatus(404);
            return
        }

        userDeleted(req.params.id);

        res.send({ "message": "Deleted successfully" });
    } catch (err) {
        console.log(err);
    }

})

// Account activities

//?Login
router.post("/login", async (req, res) => {
    if (!req.body.name || !req.body.password) {
        res.status(400).send({
            "message": "Name or password missing"
        });
        return;
    }

    let genUUID = crypto.randomUUID();

    const hashAlgo = process.env.HASH_ALGO || 'sha256';
    const hasher = createHash(hashAlgo)
    hasher.update(req.body.password)
    const pass = hasher.digest('hex')
    //const pass = "bf889cd06ba9762409e6aed391953e101f2922f9c4db08d1e94b328c52b87a7c"

    const userLoginQuery = {
        name: "check_name_and_pass",
        text: "select id,role from \"user\" where name=$1 and password=$2",
        values: [
            req.body.name,
            pass
        ]
    };

    try {
        const result = await client.query(userLoginQuery);

        if (result.rowCount != 1) {
            console.log(result)
            res.status(401).send({
                "message": "Incorrect login attempt"
            });
            return;
        }

        const mySecret = Buffer.from(process.env.JWT_SECRET, 'utf-8')
        const token = await new SignJWT({
            id: result.rows.at(0).id,
            role: result.rows.at(0).role
        })
            .setProtectedHeader({ 'alg': process.env.JWT_ENC_ALGO })
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_EXPIRY)
            .sign(mySecret)

        res.send({
            "message": "done",
            "token": token
        })

    } catch (err) {
        console.log(err);
        res.status(500).send({
            "message": "Incorrect login attempt"
        });
    }

})

//? Check if login
router.get("/login", verifyJWT, (req, res) => {
    res.send({
        "id": req.user.id,
        "role": req.user.role,
    })
    return
})

/*
//?Logout
router.post("/logout",(req,res)=>{
    // Blacklist? 

    //Also need to use rabbitmq to send it to the other side
})
*/
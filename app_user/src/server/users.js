import express from "express"
import client from "../server/client.js"
import crypto from "crypto"

import {validatePassword} from "../util/regexes.js"
import {permitAdminOrSelf} from "../util/permission_middleware.js"
import {RoleOptions} from "../util/role_options.js"

const router = express.Router()
export default router

//? Get all users
router.get("/users",/*rolesPermissionFilter(["admin"]),*/ async (req, res) => {
    const query = "select * from \"user\""

    try {
        const result = await client.query(query);
        res.send(result);

    } catch (error) {
        console.log(error);
    }
})

//? Get user by ID
// If user is not an admin, delete password field from response
router.get("/user/:id", /*loggedInFilter,*/ async (req, res) => {

    const query = {
        name: "get_user",
        text: "select * from \"user\" where id=$1",
        values: [req.params.id]
    }

    try {
        const result = await client.query(query);

        /*
        if(req.session.user_data.role!="admin"){
            result.rows.forEach((element) => {
                delete element["password"]
            })
        }
        */

        if(result.rowCount==0){
            res.sendStatus(404);
        }

        res.send(result.rows.at(0));

    } catch (error) {
        console.log(error);
    }
})

//? Add user
router.post("/user",/*rolesPermissionFilter(["admin"]),*/ async (req, res) => {
    try {
        if(!validatePassword(req.body.password)){
            res.status(400).send({"message":"Invalid password"})
            return
        }

        if(!(req.body.role in RoleOptions)){
            res.status(400).send({"message":"Invalid role"})
        }

        let genUUID = crypto.randomUUID();

        const query = {
            name: "add_user",
            text: "insert into \"user\" (id, name, role, password) values ($1,$2,$3,$4);",
            values: [
                genUUID, 
                req.body.name, 
                req.body.role,
                crypto.createHash(process.env.HASH_ALGO).update(req.body.password).digest('hex'), 
            ],
        }
        const result = await client.query(query);

        res.send({ "id": genUUID });
    } catch (err) {
        console.log(err);
    }
})

//? Update user by id
router.put("/user/:id", /*permitAdminOrSelf,*/ async (req, res) => {
    try {
        if(!validatePassword(req.body.password)){
            res.status(400).send({"message":"Invalid password"})
            return
        }

        if(!(req.body.role in RoleOptions)){
            res.status(400).send({"message":"Invalid role"})
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

        if(result.rowCount==0){
            res.sendStatus(404);
            return;
        }
        res.send(result);
    } catch (err) {
        console.log(err);
    }
})

//? Delete user by id
router.delete("/user/:id", /*permitAdminOrSelf,*/ async (req, res) => {

    const query = {
        name: "delete_user",
        text: "delete from \"user\" where id=$1",
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

// Account activities

//?Login
router.post("/login",async (req,res)=>{
    if(req.session.user_data){
        res.status(409).send({
            "message":"Please log out before loggin in"
        });
        return
    }

    if(!req.body.name || !req.body.password){
        res.status(400).send({
            "message":"Name or password missing"
        });
        return;
    }

    const userLoginQuery={
        name:"check_name_and_pass",
        text: "select id,role from \"user\" where name=$1 and password=$2",
        values: [
            req.body.name,
            crypto.createHash(process.env.HASH_ALGO).update(req.body.password).digest('hex')
        ]
    };

    try {
        const result = await client.query(userLoginQuery);

        if(result.rowCount!=1){
            res.status(401).send({
                "message":"Incorrect login attempt"
            });
            return;
        }

        req.session.user_data={
            user_id:result.rows.at(0).id,
            role:result.rows.at(0).role
        }

        res.status(200).send({
            "user_id":req.session.user_data.user_id,
            "role":req.session.user_data.role,
            "message":"login successful"
        })


    } catch (err) {
        console.log(err);
        res.status(500).send({
            "message":"Incorrect login attempt"
        });
    }
})

//? Check if login
router.get("/login",/*loggedInFilter,*/(req,res)=>{
        res.send({
            "id":req.session.user_data.user_id,
            "role":req.session.user_data.role,
        })
        return
})

//?Logout
router.post("/logout",/*loggedInFilter,*/(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }

        res.send({
            "message":"Logout successful"
        });
    })
})
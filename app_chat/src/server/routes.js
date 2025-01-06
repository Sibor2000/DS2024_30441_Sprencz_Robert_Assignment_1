import express from "express"
import client from "./client.js"
import crypto from "crypto"
import { verifyJWT } from "../util/permission_middleware.js"
import { validateUUID } from "../util/regexes.js"
import { text } from "stream/consumers"
import { conversationSeenNotify, newConversationNotify, sendChatMessage, userNotification } from "./websocket.js"
import "dotenv/config"

const router = express.Router()
export default router

//? Get all conversations
router.get("/conversations", verifyJWT, async (req,res)=>{
    const query = req.user.role == "admin" ?
    'select * from "conversation"' :
    `select c.* from "conversation" c join "conversation_membership" cm on c.id = cm.conversation_id where cm.member_id='${req.user.id}'`

    try {
        const result = await client.query(query)

        res.send({
            rows:result.rows,
            rowCount:result.rowCount
        })
    } catch (error) {
        console.log(error)
    }
})

//? Create a conversation
router.post("/conversation", verifyJWT, async (req,res)=>{
    //res.send({user1:req.user.id, user2:req.body.user_id})

    if(!validateUUID(req.user.id) || !validateUUID(req.body.user_id)){
        return res.status(422).send({message:"Incorrect uuids"})
    }
/*
    if(req.user.role != "admin"){
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.token}`
            }
        };
        const userUrl = process.env.USER_SERVICE_URL+`/user/${req.body.user_id}/checkAdmin`

        console.log(userUrl)

        try {
            const admin_check = await fetch(userUrl, options)
            const data = await admin_check.json()

            console.log(data)

            if(data.value == false){
                res.status(403).send({message:"User can only chat with user"})
                return
            }

        } catch (error) {
            console.log(error)
            res.sendStatus(403)
            return
        }
    }
*/
    //create conversation

    let conv_id = crypto.randomUUID()

    const conv_query = {
        name: "add_conv",
        text: "insert into \"conversation\" (id) values ($1);",
        values: [
            conv_id
        ],
    }

    let result

    try {
        result = await client.query(conv_query)

    } catch (error) {
        console.log(error)
        res.status(500).send({message:"conversation creation failed"})
        return
    }

    //add user1 no conflict

    const uq1 = {
        name:"add_user1",
        text:'insert into "member" (id) values ($1) on conflict (id) do nothing',
        values:[
            req.user.id
        ]
    }

    const join_id1=crypto.randomUUID()

    const juq1 = {
        name: "join_add_user1",
        text:'insert into "conversation_membership" (id, member_id, conversation_id) values ($1, $2, $3)',
        values:[
            join_id1,
            req.user.id,
            conv_id
        ]
    }

    try {
        result = await client.query(uq1)
        result = await client.query(juq1)
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"member 1 creation failed"})
        return
    }

    //add user2 no conflict

    const uq2 = {
        name: "add_user2",
        text:'insert into "member" (id) values ($1) on conflict (id) do nothing',
        values:[
            req.body.user_id
        ]
    }

    const join_id2=crypto.randomUUID()

    const juq2 = {
        name: "join_add_user2",
        text:'insert into "conversation_membership" (id, member_id, conversation_id) values ($1, $2, $3)',
        values:[
            join_id2,
            req.body.user_id,
            conv_id
        ]
    }

    try {
        result = await client.query(uq2)
        result = await client.query(juq2)
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"member 2 creation failed"})
        return
    }

    newConversationNotify(req.user.id, conv_id)

    res.send({id:conv_id})

})

//? Get all messages in a conversation
router.get("/conversation/:id/messages", verifyJWT, async (req,res)=>{

    //check if user is member of the conversation
    const check_query = {
        name:'check_user_membership',
        text:'select * from "conversation_membership" where member_id=$1 and conversation_id=$2',
        values:[req.user.id, req.params.id]
    }

    try {
        const result = await client.query(check_query)
        //return res.send(result)
        if(result.rowCount!=1){
            return res.status(403).send({message:"Acess is prohibited"})
        }
    } catch (error) {
        console.log(error)
        return
    }
    //if so, return all messages from that conversation and update all messages that are not sent by that user to be marked as seen

    const message_query = {
        name:'get_messages_conv',
        text:'select * from "message" where conversation_id=$1 order by time',
        values:[req.params.id]
    }

    const read_query = {
        name:'read_messages_conv',
        text:'update "message" set seen=true where sender<>$1 and conversation_id=$2',
        values:[req.user.id,req.params.id]
    }

    try {
        const result_seen = await client.query(read_query)
        const result_messages = await client.query(message_query)
        const preparedResult = {
            rowCount:result_messages.rowCount,
            rows:result_messages.rows
        }

        conversationSeenNotify(req.params.id, req.user.id)
        return res.send(preparedResult)
    } catch (error) {
        console.log(error)
    }
})

//? Mark messages in conversation as seen
router.put("/conversation/:id/messages/read", verifyJWT, async (req,res)=>{
    const read_query = {
        name:"read_conv_route",
        text:'update "message" set seen=true where sender<>$1 and conversation_id=$2 and exists (select 1 from "conversation_membership" where member_id=$1 and conversation_id=$2)',
        values:[req.user.id,req.params.id]
    }

    try {
        const result = await client.query(read_query)

        conversationSeenNotify(req.params.id, req.user.id)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
    }
})

//? Send a message
router.post("/message", verifyJWT, async (req, res)=>{
    if(!req.body.message){
        return res.sendStatus(204)
    }

    //check if user is member of the conversation
    const check_query = {
        name:'check_user_membership_message',
        text:'select * from "conversation_membership" where member_id=$1 and conversation_id=$2',
        values:[req.user.id, req.body.conversation_id]
    }

    try {
        const result = await client.query(check_query)

        if(result.rowCount!=1){
            return res.status(403).send({message:"Acess is prohibited"})
        }
    } catch (error) {
        console.log(error)
        return
    }

    //save into db the message
    const message_id = crypto.randomUUID()
    const message_query = {
        name:"insert_message",
        text:'insert into "message" (id, content, sender, conversation_id,seen, time) values ($1, $2, $3, $4, false, $5)',
        values:[
            message_id,
            req.body.message,
            req.user.id,
            req.body.conversation_id,
            Date.now()
        ]
    }

    try {
        const result = await client.query(message_query)
    } catch (error) {
        console.log(error)
        return res.status(422).send("Invalid message")
    }

    //send message on websocket

    sendChatMessage(message_id, req.user.id, req.body.message, req.body.conversation_id)

    res.sendStatus(200)
})

//? Send an announcement towards connected users
router.post("/user_announcement", verifyJWT, async (req,res) => {
    if(req.user.role != "admin"){
        res.sendStatus(403)
    }
    userNotification(req.user.id, req.body.message)
    res.sendStatus(200);
})
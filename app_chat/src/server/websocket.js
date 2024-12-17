import { WebSocketServer, WebSocket } from "ws"
import dotenv from "dotenv"
import { jwtVerify } from "jose"
import client from "./client.js"

let wss
const userConections = new Map()
const userRoles = new Map()

export async function connectWebsocket() {
    dotenv.config()
    wss = new WebSocketServer({ port: Number(process.env.CHAT_WEBSOCKET_PORT) })

    wss.on('connection', async (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const token = url.searchParams.get('token')
        const mySecret = Buffer.from(process.env.JWT_SECRET, 'utf-8')
        let user_id
        try {
            const { payload } = await jwtVerify(token, mySecret)
            user_id = payload.id

            userConections.set(user_id, ws)
            userRoles.set(user_id, payload.role)
        } catch (error) {
            console.log(error)
        }

        console.log(`Websocket ${user_id} has connected`)
        ws.onmessage = (mes) => {
            const received = JSON.parse(mes.data)

            if (received.type == "typingNoticeF2B") {
                conversationTypingNotify(received.data.conversationId, user_id)
            }
        }

        ws.onclose = () => {
            userConections.delete(user_id)
            userRoles.delete(user_id)
            console.log(`Websocket ${user_id} has disconnected`)
        }
    })
}

export async function sendChatMessage(messageId, sender, content, conversationId) {
    const recipient_query = {
        name: "get_recipients",
        text: 'select member_id from "conversation_membership" where conversation_id=$1;',
        values: [conversationId],
    }

    try {
        const res = await client.query(recipient_query)
        const receivers = res.rows

        receivers.forEach(async (rec) => {
            const wsy = userConections.get(rec.member_id)

            if (wsy) {
                wsy.send(JSON.stringify({
                    type: "chatMessage",
                    data: {
                        id: messageId,
                        sender: sender,
                        content: content,
                        conversationId: conversationId,
                        seen: false
                    }
                }))
            }
        })
    } catch (error) {
        console.log(error)
        return
    }
}

//? Notify members of conversation that it has been seen
export async function conversationSeenNotify(conversationId, readerId) {
    const recipient_query = {
        name: "get_recipients_seen",
        text: 'select member_id from "conversation_membership" where conversation_id=$1 and member_id<>$2;',
        values: [conversationId, readerId],
    }

    try {
        const res = await client.query(recipient_query)
        const receivers = res.rows

        receivers.forEach((rec) => {
            const wsy = userConections.get(rec.member_id)

            if (wsy) {
                wsy.send(JSON.stringify({
                    type: "seenNotification",
                    data: {
                        conversationId: conversationId,
                    }
                }))
            }
        })
    } catch (error) {
        console.log(error)
    }
}

async function conversationTypingNotify(conversationId, typerId) {
    const recipient_query = {
        name: "get_recipients_typing",
        text: 'select member_id from "conversation_membership" where conversation_id=$1 and member_id<>$2;',
        values: [conversationId, typerId],
    }

    try {
        const res = await client.query(recipient_query)
        const receivers = res.rows

        receivers.forEach(async (rec) => {
            const wsy = userConections.get(rec.member_id)

            if (wsy) {
                wsy.send(JSON.stringify({
                    type: "typingNoticeB2F",
                }))
            }
        })
    } catch (error) {
        console.log(error)
        return
    }
}

export async function newConversationNotify(senderId, conversationId) {
    const recipient_query = {
        name: "get_recipients_new_convo",
        text: 'select member_id from "conversation_membership" where conversation_id=$1 and member_id<>$2;',
        values: [conversationId, senderId],
    }

    try {
        const res = await client.query(recipient_query)
        const receivers = res.rows

        receivers.forEach(async (rec) => {
            const wsy = userConections.get(rec.member_id)

            if (wsy) {
                wsy.send(JSON.stringify({
                    type: "newConversation",
                    data: {
                        conversationId: conversationId
                    }
                }))
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export async function userNotification(senderId, message) {

    userConections.forEach((value, key, map) => {
        try {
            if (key == senderId || userRoles.get(key)=="admin") {
                return
            }

            const wsy = value

            wsy.send(JSON.stringify({
                type: "userNotification",
                data: {
                    message: message
                }
            }))
        } catch (error) {
            console.log(error)
        }
    })

    /*
    const recipient_query = {
        name: "get_users",
        text: 'select id from "member" where id<>$1;',
        values: [senderId],
    }

    try {
        const res = await client.query(recipient_query)
        const receivers = res.rows

        receivers.forEach(async (rec) => {
            const wsy = userConections.get(rec.id)

            if (wsy) {
                wsy.send(JSON.stringify({
                    type: "userNotification",
                    data:{
                        message:message
                    }
                }))
            }
        })
    } catch (error) {
        console.log(error)
    }
    */
}
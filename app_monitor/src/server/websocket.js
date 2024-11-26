import {WebSocketServer, WebSocket} from "ws"
import dotenv from "dotenv"

let wss

export async function connectWebsocket() {
    dotenv.config()
    wss = new WebSocketServer({port: Number(process.env.WEBSOCKET_PORT)})

    /*
    wss.on('connection', function connection(ws){
        ws.send(JSON.stringify({message: "SUP??"}))

        ws.on('close', () => {
            console.log('client disconnected')
        })
    })
        */
}

export async function notifyOnWebsocket(msg){
    wss.clients.forEach(element => {
        if(element.readyState === WebSocket.OPEN){
            element.send(JSON.stringify({message: msg}))
        }
    });
}
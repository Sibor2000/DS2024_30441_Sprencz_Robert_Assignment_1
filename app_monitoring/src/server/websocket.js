import {WebSocketServer, WebSocket} from "ws"
import dotenv from "dotenv"

dotenv.config()
console.log(process.env.WEBSOCKET_PORT)

const wss = new WebSocketServer({port: Number(process.env.WEBSOCKET_PORT)})


wss.on('connection', function connection(ws){
    ws.send(JSON.stringify({message: "SUP??"}))

    ws.on('close', () => {
        console.log('client disconnected')
    })
})

let index = 0

setInterval(()=>{
    wss.clients.forEach(element => {
        if(element.readyState === WebSocket.OPEN){
            element.send(JSON.stringify({message: index++}))
        }
    });
}, 5000)

//TODO: start integrating websocket
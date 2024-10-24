import amqp from "amqplib/callback_api.js"
import client from "./client.js"

export async function userDeleted(message){
    amqp.connect("amqp://localhost", function(error0, connection){
        if(error0){
            throw error0
        }
    
        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }
    
            var queue = "user_to_device"
    
            channel.assertQueue(queue, {
                durable: false
            })
    
            channel.sendToQueue(queue, Buffer.from(message))
            //console.log(`Sent ${msg}`)
        })
    })
}

export async function checkForUser(){
    amqp.connect("amqp://localhost", function(error0, connection){
        if(error0){
            throw error0
        }
    
        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }
    
            var queue = "checkUserRpc"
    
            channel.assertQueue(queue, {
                durable: false
            })

            //channel.prefetch(1);
    
            channel.consume(queue, async function(msg){
                //check for user id in message

                console.log("I got user with id: "+msg.content.toString())

                const query = {
                    name: "get_user",
                    text: "select * from \"user\" where id=$1",
                    values: [msg.content.toString()]
                }
            
                try {
                    const result = await client.query(query);
                    if(result.rowCount==0){
                        //if present
                        channel.sendToQueue(msg.properties.replyTo,/* queue,*/ Buffer.from("404"),{
                            correlationId: msg.properties.correlationId
                        })
                        return
                    }
            
                    channel.sendToQueue(msg.properties.replyTo,/* queue,*/ Buffer.from("Found"),{
                        correlationId: msg.properties.correlationId
                    })

                    channel.ack(msg)
                    //channel.sendToQueue(queue, Buffer.from("404"))
                    //res.send(result.rows.at(0));
            
                } catch (error) {
                    console.log(error);
                }
            })
        })
    })
}
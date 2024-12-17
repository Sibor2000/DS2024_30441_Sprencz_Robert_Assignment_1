import amqp from "amqplib/callback_api.js"
import client from "./client.js"
import crypto from "crypto"
import { validateUUID } from "../util/regexes.js"

export async function userDeleted() {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
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

            channel.consume(queue, async function(msg){

                const select_query = {
                    name: "select_device_by_ownerid",
                    text: "select * from \"device\" where owner_id=$1",
                    values: [msg.content.toString()]
                }

                try {
                    const result = await client.query(select_query);

                    result.rows.forEach(element => {
                        deviceDeleteMonitor(element.id)
                    })
                } catch (error) {
                    console.log(error)
                }


                const delete_query = {
                    name: "delete_device_by_userid",
                    text: "delete from \"device\" where owner_id=$1",
                    values: [msg.content.toString()]
                }

                try {
                    const result = await client.query(delete_query);
                } catch (error) {
                    console.log(error);
                }

            }, {
                noAck: true
            })
        })
    })
}

export async function checkForUser(req, res, next) {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
        if(error0){
            throw error0
        }

        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }

            var queue = "checkUserRpc"
            var correlationId = crypto.randomUUID();

            channel.assertQueue('', {
                exclusive: true
            }, function(error2, replyQueue){
                if(error2){
                    throw error2
                }

                if(!validateUUID(req.body.owner_id)){
                    res.status(400).send({"message":"Invalid owner id"})
                    return
                }

                channel.sendToQueue(queue, Buffer.from(req.body.owner_id),{
                    correlationId: correlationId,
                    replyTo: replyQueue.queue
                })

                channel.consume(replyQueue.queue, async function(msg) {
                    if(msg.properties.correlationId == correlationId){

                        const reply = msg.content.toString()

                        if(reply == "Found"){
                            next();
                        }else if (reply == "404"){
                            res.send({"message":"User not found in database"})
                        }else{
                            res.send({"message":"Error"})
                        }
                    }
                },{
                    noAck: false
                })
            })
        })
    })
}

export async function deviceDeleteMonitor(message) {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
        if(error0){
            throw error0
        }

        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }

            var queue = "device_deleted"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.sendToQueue(queue, Buffer.from(message))
            //console.log(`Sent ${msg}`)
        })
    })
}

export async function deviceAddMonitor(message) {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
        if(error0){
            throw error0
        }

        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }

            var queue = "device_added"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.sendToQueue(queue, Buffer.from(message))
            //console.log(`Sent ${msg}`)
        })
    })
}

export async function deviceEditMonitor(message) {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
        if(error0){
            throw error0
        }

        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }

            var queue = "device_edited"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.sendToQueue(queue, Buffer.from(message))
            //console.log(`Sent ${msg}`)
        })
    })
}
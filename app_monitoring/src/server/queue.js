import amqp from "amqplib/callback_api.js"
import client from "./client.js"
import crypto from "crypto"
import { validateUUID } from "../util/regexes.js"

async function deviceDeleted() {
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
    
            channel.consume(queue, async function(msg){
                const query = {
                    name: "delete_measurement_by_deviceid",
                    text: "delete from \"energy_consumption\" where device_id=$1",
                    values: [msg.content.toString()]
                }
            
                try {
                    const result = await client.query(query);
                } catch (error) {
                    console.log(error);
                }

            }, {
                noAck: true
            })
        })
    })
}

async function takeMeasurement(params) {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function(error0, connection){
        if(error0){
            throw error0
        }
    
        connection.createChannel(function(error1, channel) {
            if(error1){
                throw error1
            }
    
            var queue = "producer_to_monitor"
    
            channel.assertQueue(queue, {
                durable: false
            })
    
            channel.consume(queue, async function(msg){

                const content = JSON.parse(msg.content.toString())

                if(!validateUUID(content.device_id)){
                    throw "Invalid device_id"
                }
                
                let genUUID = crypto.randomUUID()

                const query = {
                    name: "take_measurement",
                    text: "insert into \"energy_consumption\" (id, device_id, measurement_value, time) values($1, $2, $3, $4)",
                    values: [genUUID, content.device_id, content.measurement_value, content.timestamp]
                }
            
                try {
                    const result = await client.query(query);
                } catch (error) {
                    console.log(error);
                }
                
            }, {
                noAck: true
            })
        })
    })
}

export async function amqpListen(params) {
    deviceDeleted()
    takeMeasurement()
}
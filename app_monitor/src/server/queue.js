import amqp from "amqplib/callback_api.js"
import client from "./client.js"
import crypto from "crypto"
import { validateUUID } from "../util/regexes.js"
import { notifyOnWebsocket } from "./websocket.js"
import calculateConsumption from "../util/consumption.js"
import { text } from "express"

async function deviceDeleted() {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function (error0, connection) {
        if (error0) {
            throw error0
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1
            }

            var queue = "device_deleted"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.consume(queue, async function (msg) {
                //console.log(msg.content.toString())

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

                const query2 = {
                    name: "delete_device_by_deviceid",
                    text: "delete from \"max_consumption\" where device_id=$1",
                    values: [msg.content.toString()]
                }

                try {
                    const result = await client.query(query2);
                } catch (error) {
                    console.log(error);
                }

            }, {
                noAck: true
            })
        })
    })
}

async function deviceAdded() {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function (error0, connection) {
        if (error0) {
            throw error0
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1
            }

            var queue = "device_added"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.consume(queue, async function (msg) {

                const deviceInfo = JSON.parse(msg.content.toString())

                if (!validateUUID(deviceInfo.id)) {
                    console.log(deviceInfo)
                    console.log("Invalid device id")
                    return
                }

                let genUUID = crypto.randomUUID()

                const query = {
                    name: "add_device_consumption",
                    text: "insert into \"max_consumption\" (id, device_id, max_nrg_con_per_hour) values ($1, $2, $3)",
                    values: [genUUID, deviceInfo.id, deviceInfo.max_nrg_con_per_hour]
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

async function deviceEdited() {
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function (error0, connection) {
        if (error0) {
            throw error0
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1
            }

            var queue = "device_edited"

            channel.assertQueue(queue, {
                durable: false
            })

            channel.consume(queue, async function (msg) {

                const deviceInfo = JSON.parse(msg.content.toString())

                if (!validateUUID(deviceInfo.id)) {
                    console.log(deviceInfo)
                    console.log("Invalid device id")
                    return
                }

                const query = {
                    name: "edit_device_consumption",
                    text: "update \"max_consumption\" set max_nrg_con_per_hour=$1 where device_id=$2",
                    values: [deviceInfo.max_nrg_con_per_hour, deviceInfo.id]
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
    amqp.connect(`amqps://${process.env.AMQP_HOST}:${process.env.AMQP_PASS}@sparrow.rmq.cloudamqp.com/${process.env.AMQP_HOST}`, function (error0, connection) {
        if (error0) {
            throw error0
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1
            }

            var queue = "producer_to_monitor"

            channel.assertQueue(queue, {
                durable: false
            })

            let measurementTable = new Map();

            //take measurements from the producer
            channel.consume(queue, async function (msg) {

                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString())

                    if (validateUUID(content.device_id)) {
                        if (measurementTable.has(content.device_id)) {
                            measurementTable.get(content.device_id).push(content)
                        } else {
                            measurementTable.set(content.device_id, [content])
                        }
                    }
                }
            }, {
                noAck: true
            })

            //periodically process the messages
            setInterval(async () => {
                if (measurementTable.size == 0) {
                    console.log("No entries in last cycle")
                    return
                }

                let overconsumers = []

                let collectionTime = Date.now()

                for (const [key, value] of measurementTable.entries()) {
                    const consumptionLastCycle = calculateConsumption(value)
                    let maxConsumption = 0

                    if (consumptionLastCycle == null) {
                        return
                    }

                    const consumptionCheckQuery = {
                        name: "check_max_consumption",
                        text: "select * from max_consumption where device_id=$1",
                        values: [key]
                    }

                    try {
                        const result = await client.query(consumptionCheckQuery)
                        maxConsumption = result.rows[0].max_nrg_con_per_hour
                    } catch (error) {
                        console.log(error)
                    }

                    console.log(`Consumption last cycle:${consumptionLastCycle} ,based on ${value.length} measurements, for device ${key}`)

                    if (consumptionLastCycle > maxConsumption) {
                        console.log("MAX consumption has been exceeded!")
                        //notifyOnWebsocket(`Max consumption has been exceeded for device ${key}`)
                        overconsumers.push(key)
                    }

                    let genUUID = crypto.randomUUID()
                    //let collection_time = value[0].timestamp


                    const insert_query = {
                        name: "hourly_consumption_measured",
                        text: "insert into \"energy_consumption\" (id, device_id, measurement_value, time) values($1, $2, $3, $4)",
                        values: [genUUID, key, consumptionLastCycle, collectionTime]
                    }

                    try {
                        const result = await client.query(insert_query);
                    } catch (error) {
                        console.log(error);
                    }

                }

                if (overconsumers.length > 0) {
                    let initial = overconsumers.shift()
                    notifyOnWebsocket("Max consumption has been exceeded on: " + overconsumers.reduce((acc, current) => acc + ", " + current, initial))
                    //console.log(overconsumers.reduce((acc, current) => acc + "," + current, initial))
                }

                measurementTable = new Map()
            }, 6000)
        })
    })
}

export async function amqpListen(params) {
    deviceAdded()
    deviceDeleted()
    deviceEdited()
    takeMeasurement()
}
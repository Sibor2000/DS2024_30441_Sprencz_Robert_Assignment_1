import pika
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import csv
import json

load_dotenv()

device_id = "cd1f9790-d199-4c7f-97d8-0bad4bfbc8f9"

host = os.getenv('AMQP_HOST')
password = os.getenv('AMQP_PASS')
amqp_url = "amqps://{}:{}@sparrow.rmq.cloudamqp.com/{}".format(host,password,host)
params = pika.URLParameters(amqp_url)
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue="producer_to_monitor")

date = datetime.now()

index = 0

with open('./dataset/mini_sensor.csv', mode='r') as file:
    csv_reader = csv.reader(file)

    for row in csv_reader:
        measurement = {
            "timestamp": str(int(date.timestamp() * 1000 )),
            "measurement_value": row[0],
            "device_id": "cd1f9790-d199-4c7f-97d8-0bad4bfbc8f9"
        }
        #TODO: change device id programatically
        print(index)
        index=index+1
        date = date + timedelta(minutes=10)
        
        channel.basic_publish(exchange='', routing_key="producer_to_monitor", body=json.dumps(measurement))

connection.close()
import pika
from dotenv import load_dotenv
import os
import datetime
import csv
import json

load_dotenv()

host = os.getenv('AMQP_HOST')
password = os.getenv('AMQP_PASS')
amqp_url = "amqps://{}:{}@sparrow.rmq.cloudamqp.com/{}".format(host,password,host)
params = pika.URLParameters(amqp_url)
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue="producer_to_monitor")

date = datetime.datetime.now()

index = 0

with open('./dataset/mini_sensor.csv', mode='r') as file:
    csv_reader = csv.reader(file)

    for row in csv_reader:
        measurement = {
            "timestamp": str(int(date.timestamp())),
            "measurement_value": row[0]
        }
        print(index)
        index=index+1
        
        channel.basic_publish(exchange='', routing_key="producer_to_monitor", body=json.dumps(measurement))

connection.close()
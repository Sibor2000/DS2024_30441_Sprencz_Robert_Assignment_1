import pika
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import csv
import json
import time
import sys

load_dotenv()

host = os.getenv('AMQP_HOST')
password = os.getenv('AMQP_PASS')
amqp_url = "amqps://{}:{}@sparrow.rmq.cloudamqp.com/{}".format(host,password,host)
params = pika.URLParameters(amqp_url)
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue="producer_to_monitor")

date = datetime.now()

index = 0

test_device_ids = ["b96b8a52-79c0-425a-886c-39c5911b90e7", "c88c3f63-e9f4-4b49-86c3-53f4cb64fbad"]

with open('./dataset/overconsumer.csv', mode='r') as file:
    csv_reader = csv.reader(file)

    for row in csv_reader:
        measurement = {
            "timestamp": str(int(date.timestamp() * 1000 )),
            "measurement_value": row[0],
            "device_id": test_device_ids[int(sys.argv[1])]
        }

        print(index)
        index=index+1
        date = date + timedelta(minutes=10)

        channel.basic_publish(exchange='', routing_key="producer_to_monitor", body=json.dumps(measurement))
        time.sleep(2)

connection.close()
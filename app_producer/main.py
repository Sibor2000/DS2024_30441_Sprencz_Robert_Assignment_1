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

test_device_ids = ["966bbbda-f1f1-411f-b034-ce7bfc73c745", "c24d54cf-7815-4a6a-a7fe-7de0a922418d"]

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
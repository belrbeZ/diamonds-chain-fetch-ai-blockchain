import flask
import json
from os import environ
from trips.trip_agent import add_agent
from trips.transport_agent import add_transport_agent
import asyncio
from threading import Thread
from uuid import UUID
from random import uniform

app = flask.Flask(__name__)

trips = {}


def to_json(data):
    return json.dumps(data)


def add_agent_to_oef(data):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    add_agent(data)


@app.route("/journey", methods=['POST'])
def add_journey_request():
    data = flask.request.json
    data['trip_id'] = UUID()
    data['status'] = 'WAIT'
    Thread(target=add_agent_to_oef, args=data).start()
    trips[data['account_id']] = data
    return 'ok'


@app.route('/journey/<trip_id>', methods=['GET'])
def get_journey_request(trip_id: str):
    if trip_id not in trips:
        flask.abort(404)
    return to_json(trips[trip_id])


def add_transport_agent_to_oef():
    data = {
        'id': UUID(),
        'location': {
            'latitude': uniform(0, 10),
            'longitude': uniform(0, 10),
        },
        'status': 'WAIT'
    }
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    add_transport_agent(data)
    print('Appear transport agent: ' + str(data))


if __name__ == '__main__':
    app.run(port=environ.get('SERVER_PORT', 8001))

    transport_number = environ.get('TRANSPORT_NUMBER', 3)
    for i in range(transport_number):
        Thread(target=add_transport_agent_to_oef).start()

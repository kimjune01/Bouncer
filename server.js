const WebSocket = require('ws');
const Client = require('./client.js');

let clients = [];

function clientFrom(ws) {
  return clients.find(function(client) {
    return client.websocket == ws;
  });
};

const wss = new WebSocket.Server({ port: 8080 });
console.log("Websocket server listening on port 8080");

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

wss.on('connection', function connection(ws) {

  var newClient = new Client(guid(), ws);
  clients.push(newClient);
  console.log("new client added");

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    var client = clientFrom(ws);
    if (client == null) {
      console.log("client not found!");
      // should not happen.
      return;
    }
    console.log("client.id: ", client.id);
    var toSend = JSON.stringify({sender: client.id, payload: JSON.parse(message)});
    console.log('toSend: ', toSend);
    //TODO: synchronous POST this to an HTTPS endpoint
    // then, parse the response and send its payload to its recipient
  });

  ws.send(Date.now());

});


//TODO: timer to ping all the websockets periodically

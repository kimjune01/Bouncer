const WebSocket = require('ws');
const Client = require('./client.js');
var request = require('request');

let clients = [];

function clientFromWebSocket(ws) {
  return clients.find(function(client) {
    return client.websocket === ws;
  });
};

function clientFromID(id) {
  return clients.find(function(client) {
    return client.id == id;
  });
};

function removeSocket(ws) {
  var socket = clientFromWebSocket(ws);
  for(var i = clients.length - 1; i >= 0; i--) {
    if(clients[i] === socket) {
       clients.splice(i, 1);
    }
  }
}

// Heartbeat type functions:
function noop() {}

function heartbeat() {
  this.isAlive = true;
  console.log("Heart beat...");
}

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
  console.log("clients:", clients.length);
  ws.send(Date.now());

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    var client = clientFromWebSocket(ws);
    if (client == null) {
      console.log("client not found!");
      // should not happen.
      return;
    }
    console.log("client.id: ", client.id);
    var toPost = JSON.stringify({sender: client.id, payload: JSON.parse(message)});
    request.post({url:'https://httpbin.org/post',form: toPost}, function (error, response, body) {
      if (error != null) {
        console.log('error:', error); // Print the HTML for the Google homepage.
        return;
      }
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      //TODO: find destination from body
      //var recipientID = body["recipientID"]
      //var recipient = clientFromID(recipientID)
      //TODO: get payload from body
      //var payload = body["payload"]
      //recipient.websocket.send(payload)
      ws.send(body)
    });
    // then, parse the response and send its payload to its recipient
  });

  ws.on('close', function() {
    removeSocket(ws)
    console.log("Websocket connect closed");
  });

  ws.on('error', function() {
    console.log('ERROR');
  });

});


//TODO: timer to ping all the websockets periodically

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      var clientToRemove = clientFromWebSocket(ws);
      clients = clients.filter(c => c.id != clientToRemove.id);

      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

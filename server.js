const WebSocketServer = require('ws').Server;
const Client = require('./client.js');
var request = require('request');
var port = process.env.PORT || 8080
var http = require("http")
var express = require("express")

var app = express()
app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

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

function sender(form) {
  return form
}
function extract(responseData) {
  //TODO: fail with sensible error message
  var parsedOnce = JSON.parse(responseData);
  return parsedOnce
}
// Heartbeat type functions:
function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocketServer({server: server})
console.log("Websocket server listening on port: ", port);

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
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', function incoming(message) {
    var client = clientFromWebSocket(ws);
    if (client == null) {
      console.log("client not found!");      // should not happen.
      return;
    }
    let payload
    try {
      payload = JSON.parse(message)
    } catch(error) {
      console.log("error: ", error)
      ws.send(error.toString());
      return
    }
    let endpoint = payload['endpoint'];
    var toPost = JSON.stringify({sender: client.id, payload: payload})
    request.post({url:endpoint,form: toPost}, function (error, response, responseData) {
      if (error != null) {
        ws.send(JSON.stringify(error));
        return;
      }
      var extracted = extract(responseData);
      var client = clientFromID(extracted.receiver);
      if (client == null) {
        console.log("Endpoint did not provide receiver client!!");
      }
      if (client) {
        var responsePayload = JSON.stringify(extracted.payload);
        client.websocket.send(responsePayload);
      }
    });
  });

  ws.on('close', function() {
    removeSocket(ws)
    console.log("client removed");
    console.log("clients.length:", clients.length);
  });

  ws.on('error', function(e) {
    if (e.code === "ECONNRESET") {
      return;
    }
    console.log('Websocket ERROR:', e);
  });

});


//TODO: timer to ping all the websockets periodically

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      removeSocket(ws)
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

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

const VOICEOS_URL = "https://7egeo7rfc5.execute-api.us-east-1.amazonaws.com/dev/ping";

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
function extract(body) {
  var formKeys = Object.keys(JSON.parse(body).form)
  if (formKeys.length > 0) {
    return JSON.parse(formKeys[0])
  } else {
    return {}
  }
}
// Heartbeat type functions:
function noop() {}

function heartbeat() {
  this.isAlive = true;
  console.log("Heart beat...");
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
  console.log("client added");
  console.log("clients.length:", clients.length);
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
    var toPost = JSON.stringify({sender: client.id, payload: message});
    request.post({url:VOICEOS_URL,form: toPost}, function (error, response, body) {
      if (error != null) {
        console.log('error:', error); // Print the HTML for the Google homepage.
        return;
      }
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      var extracted = extract(body);
      console.log('extracted body:', extracted);
      var client = clientFromID(extracted.sender);
      console.log('clientID: ', client.id);
      if (client) {
        client.websocket.send(JSON.stringify(extracted.payload));
      }
    });
    // then, parse the response and send its payload to its recipient
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
    console.log('ERROR:', e);
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

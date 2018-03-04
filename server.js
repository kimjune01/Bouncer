const WebSocket = require('ws');
const Client = require('./client.js');
var request = require('request');

let clients = [];

function clientFromWebSocket(ws) {
  return clients.find(function(client) {
    return client.websocket == ws;
  });
};

function clientFromID(id) {
  return clients.find(function(client) {
    return client.id == id;
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

  ws.send(Date.now());

});


//TODO: timer to ping all the websockets periodically

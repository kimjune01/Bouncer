## Bouncer

Bouncer is a semi-persistent `websocket` connection manager that forwards a JSON to an `http` endpoint. To use it, a websocket client must first establish a connection to Bouncer through a websocket.

### Test / Deploy

get a WebSocket client: [extension](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo/related?hl=en)

Local endpoint `yarn && yarn start`:
```
ws://localhost:8080/websocket/
```

Heroku endpoint:
```
ws://secure-lowlands-10237.herokuapp.com/websocket/
```

- Connect, and expect an epoch response

- Send
```
{"speech":"Can you show me some cats", "endpoint":"https://7egeo7rfc5.execute-api.us-east-1.amazonaws.com/dev/ping"}
```

- Expect the same response back

### Serverside expect

```
{ sender: '651a94ee-fb57-2ff3-03c3-42b03b3402d4',
  payload:
   { RAWR: '125',
     endpoint: 'https://7egeo7rfc5.execute-api.us-east-1.amazonaws.com/dev/ping' } }
```

`//TODO: ` swap the endpoint to face VoiceOS

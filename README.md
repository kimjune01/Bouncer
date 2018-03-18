## Bouncer

Bouncer is a semi-persistent `websocket` connection manager that forwards a JSON to an `http` endpoint. To use it, a websocket client must first establish a connection to Bouncer through an endpoint.

### Test / Deploy

get a WebSocket client: [extension](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo/related?hl=en)

Local endpoint `npm start`:
```
ws://localhost:8080/websocket/
```

Heroku endpoint:
```
ws://secure-lowlands-10237.herokuapp.com/websocket/
```

- Connect, and expect an epoch response

- Send `{"RAWR":"123"}`

- Expect the same response back

`//TODO: ` swap the endpoint to face VoiceOS

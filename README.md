### Test / Deploy

get a WebSocket client: [extension](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo/related?hl=en)

Local endpoint:
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

module.exports = class Client {
  constructor(id, websocket) {
    this.id = id;
    this.websocket = websocket;
  }
}

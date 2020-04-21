const express = require('express');

class App {
  constructor() {
    this.app = express();
    this.database();
    this.middlewares();
    this.routes();
  }

  database() {
    return require('../database');
  }

  middlewares() {
    this.app.use(express.json());
  }

  routes() {
    this.app.use(require('../routes'));
  }
}

module.exports = new App().app;

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

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
    this.app.use(cors());
    this.app.use(logger('dev'));
    this.app.use(helmet());
    // this.app.use(bodyParser.urlencoded());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  routes() {
    this.app.use(require('../routes'));
  }
}

module.exports = new App().app;

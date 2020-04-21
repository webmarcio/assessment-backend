const app = require('express')();
const products = require('./products');
const categories = require('./categories');

app.use([products, categories]);

module.exports = app;

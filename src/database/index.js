const Sequelize = require('sequelize');

const dbConfig = require('../config/database');
const Product = require('../app/models/Product');
const Log = require('../app/models/Log');
const Category = require('../app/models/Category');

const connection = new Sequelize(dbConfig);

Product.init(connection);
Log.init(connection);
Category.init(connection);

module.exports = connection;

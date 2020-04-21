const routes = require('express').Router();
const productController = require('../app/controllers/productController');

routes.get('/products', productController.index);
routes.get('/product/:id', productController.get);
routes.post('/product', productController.store);
routes.put('/product/:id', productController.update);
routes.delete('/product/:id', productController.delete);

module.exports = routes;

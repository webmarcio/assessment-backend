const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('../config/multer');

const productController = require('../app/controllers/productController');

routes.get('/products', productController.index);
routes.get('/product/:id', productController.get);
routes.post(
  '/product',
  multer(multerConfig).single('file'),
  productController.store,
);
routes.put('/product/:id', productController.update);
routes.delete('/product/:id', productController.delete);
routes.post(
  '/upload-file-store',
  multer(multerConfig).single('file'),
  productController.uploadFileAndStore,
);

module.exports = routes;

const routes = require('express').Router();
const categoryController = require('../app/controllers/categoryController');

routes.get('/categories', categoryController.index);
routes.get('/category/:id', categoryController.get);
routes.post('/category', categoryController.store);
routes.put('/category/:id', categoryController.update);
routes.delete('/category/:id', categoryController.delete);
routes.delete(
  '/remove-category-product',
  categoryController.removeCategoryProduct,
);
routes.post('/add-category-product', categoryController.addCategoryProduct);

module.exports = routes;

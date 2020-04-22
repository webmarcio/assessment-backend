const { Op } = require('sequelize');

const Log = require('../models/Log');
const Category = require('../models/Category');
const Product = require('../models/Product');

const makeCode = async (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const categories = {
  async index(req, res, next) {
    try {
      const { startDate, endDate, page, limit } = req.query;

      let categories;
      let start = startDate ? startDate.concat(' 00:00:00.000Z') : null;
      let end = endDate ? endDate.concat(' 23:59:59.000Z') : null;
      let query = {
        order: [['created_at', 'DESC']],
        where: { active: true },
        include: { association: 'products' },
      };

      if (startDate && endDate) {
        query.where = {
          ...query.where,
          created_at: {
            [Op.gte]: new Date(start),
            [Op.lte]: new Date(end),
          },
        };
      }

      if (page && limit) {
        const offset = parseInt(limit) * (parseInt(page) - 1);

        query = {
          ...query,
          offset,
          limit: parseInt(limit),
        };
      }

      try {
        categories = await Category.findAndCountAll(query);
      } catch (error) {
        console.log(error);
      }

      await Log.create({
        log: `${new Date()} - Foram encontrados ${
          categories.count
        } registros de categorias no banco de dados.`,
      });

      return res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
  async get(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id, {
        include: { association: 'products' },
      });

      await Log.create({
        log: `${new Date()} - O produto ${category.name} com id ${
          category.id
        } foi buscado na plataforma.`,
      });

      return res.status(200).json(category);
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
  async store(req, res, next) {
    try {
      const { name, code, productId } = req.body;
      // const code = await makeCode(10);
      let category;
      let product;

      try {
        [category] = await Category.findOrCreate({
          where: { name, code, active: true },
        });

        if (productId) {
          product = await Product.findByPk(productId);

          if (!product) return res.status(400).json('Product not found.');
          await product.addCategory(category);
        }

        await Log.create({
          log: `${new Date()} - A Categoria ${category.name} com id ${
            category.id
          } foi criado com sucesso.`,
        });
      } catch (error) {
        console.log(error);
        await Log.create({
          log: `${new Date()} - Houve um erro ao tentar inserir uma categoria no banco de dados. Detalhes: ${error}`,
        });
      }

      return res.status(201).json(category);
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      let fields = {};
      let category;

      let query = {
        where: {
          id,
        },
      };

      if (name) {
        fields = {
          ...fields,
          name,
        };
      }

      try {
        category = await Category.update(fields, query);
      } catch (error) {
        console.log(error);
      }

      if (category[0]) {
        let item = await Category.findByPk(id);

        let arr = [];
        for (key in fields) {
          arr.push(key);
        }

        await Log.create({
          log: `${new Date()} - Os seguintes campos do registro da categoria ${
            item.name
          } foram alterados: ${JSON.stringify(arr)}`,
        });

        return res
          .status(200)
          .json({ message: 'Categoria editada com sucesso.' });
      }

      await Log.create({
        log: `${new Date()} - Houve um erro ao editar a categoria`,
      });

      return res.status(400).json({ message: 'Falha ao editar a categoria.' });
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      let deleted;
      let category;

      try {
        category = await Category.findByPk(id);
        deleted = await Category.destroy({ where: { id } });
      } catch (error) {
        console.log(error);
      }

      if (deleted) {
        await Log.create({
          log: `${new Date()} - A categoria ${category.name} foi removida.`,
        });

        return res
          .status(200)
          .json({ message: 'Categoria removida com sucesso!' });
      }

      return res.status(400).json({ message: 'Falha ao remover categoria.' });
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
  async removeCategoryProduct(req, res, next) {
    try {
      const { idCategory, productId } = req.body;

      product = await Product.findByPk(productId);

      if (!product) return res.status(400).json('Product not found.');

      category = await Category.findOne({
        where: { id: idCategory },
      });

      await product.removeCategory(category);
      await Log.create({
        log: `${new Date()} - Categoria ${category.name} removida do produto ${
          product.name
        }.`,
      });

      return res.status(200).json('Categoria removida do produto');
    } catch (error) {
      console.log(error);
      return res.status(500).json('Internal Server Error');
    }
  },
  async addCategoryProduct(req, res, next) {
    try {
      const { idCategory, productId } = req.body;

      product = await Product.findByPk(productId);

      if (!product) return res.status(400).json('Product not found.');

      category = await Category.findOne({
        where: { id: idCategory },
      });

      await product.addCategory(category);

      await Log.create({
        log: `${new Date()} - Categoria ${
          category.name
        } adicionada ao produto ${product.name}.`,
      });

      return res.status(200).json('Categoria adicionada ao produto');
    } catch (error) {
      console.log(error);
      return res.status(500).json('Internal Server Error');
    }
  },
};

module.exports = categories;

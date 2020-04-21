const { Op } = require('sequelize');
const Product = require('../models/Product');
const Log = require('../models/Log');

const product = {
  async index(req, res, next) {
    try {
      const { startDate, endDate, page, limit } = req.query;

      let products;
      let start = startDate ? startDate.concat(' 00:00:00.000Z') : null;
      let end = endDate ? endDate.concat(' 23:59:59.000Z') : null;
      let query = {
        order: [['created_at', 'DESC']],
        where: { active: true },
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
        products = await Product.findAndCountAll(query);
      } catch (error) {
        console.log(error);
      }

      await Log.create({
        log: `${new Date()} - Foram encontrados ${
          products.count
        } registros de produtos no banco de dados.`,
      });

      return res.status(200).json(products);
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
      const product = await Product.findByPk(id);

      await Log.create({
        log: `${new Date()} - O produto ${product.name} com id ${
          product.id
        } foi buscado na plataforma.`,
      });

      return res.status(200).json(product);
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
      const { name, sku, description, amount } = req.body;
      let price;
      let product;

      if (typeof req.body.price == 'string') {
        price = parseFloat(req.body.price.replace(',', '.'));
      } else {
        price = req.body.price;
      }

      try {
        product = await Product.create({
          name,
          sku,
          price,
          description,
          amount,
          active: true,
        });

        await Log.create({
          log: `${new Date()} - O produto ${product.name} com id ${
            product.id
          } foi criado com sucesso.`,
        });
      } catch (error) {
        console.log(error);

        await Log.create({
          log: `${new Date()} - Houve um erro ao tentar inserir um produto no banco de dados. Detalhes: ${error}`,
        });
      }
      return res.status(201).json(product);
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
      const { name, sku, description, amount } = req.body;

      let fields = {};
      let product;

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

      if (sku) {
        fields = {
          ...fields,
          sku,
        };
      }

      if (description) {
        fields = {
          ...fields,
          description,
        };
      }

      if (amount) {
        fields = {
          ...fields,
          amount,
        };
      }

      if (req.body.price) {
        let price;

        if (typeof req.body.price == 'string') {
          price = parseFloat(req.body.price.replace(',', '.'));
        } else {
          price = req.body.price;
        }

        fields = {
          ...fields,
          price,
        };
      }

      try {
        product = await Product.update(fields, query);
      } catch (error) {
        console.log(error);
      }

      if (product[0]) {
        let item = await Product.findByPk(id);

        let arr = [];
        for (key in fields) {
          arr.push(key);
        }

        await Log.create({
          log: `${new Date()} - Os seguintes campos do produto ${
            item.name
          } foram alterados: ${JSON.stringify(arr)}`,
        });

        return res
          .status(200)
          .json({ message: 'Produto editado com sucesso.' });
      }

      await Log.create({
        log: `${new Date()} - Houve um erro ao editar o produto`,
      });

      return res.status(400).json({ message: 'Falha ao editar o produto.' });
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
      let product;

      try {
        product = await Product.findByPk(id);
        deleted = await Product.destroy({ where: { id } });
      } catch (error) {
        console.log(error);
      }

      if (deleted) {
        await Log.create({
          log: `${new Date()} - O item ${product.name} foi removido.`,
        });

        return res
          .status(200)
          .json({ message: 'Produto removido com sucesso!' });
      }

      return res.status(400).json({ message: 'Falha ao remover o produto' });
    } catch (error) {
      console.log(error);
      await Log.create({
        log: `${new Date()} - Falha interna. Detalhes: ${error}`,
      });
      return res.status(500).json('Internal Server Error');
    }
  },
};

module.exports = product;

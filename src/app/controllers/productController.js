const { Op } = require('sequelize');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Log = require('../models/Log');
const XLSX = require('xlsx');

const makeCode = async (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

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
        include: { association: 'categories' },
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
      const product = await Product.findByPk(id, {
        include: { association: 'categories' },
      });

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
      const { name, sku, description, amount, categories } = req.body;

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
          image: req.file.filename,
        });

        product = await Product.findByPk(product.id, {
          include: { association: 'categories' },
        });

        await product.addCategory(categories);

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
  async uploadFileAndStore(req, res, next) {
    try {
      await fs.access(req.file.path, fs.constants.F_OK, async (err) => {
        if (!err) {
          file = fs.readFileSync(req.file.path);
          await fs.unlink(req.file.path, (err) => {
            if (err) throw err;
            console.log('Arquivo de base deletado com sucesso!');
          });

          const data = new Uint8Array(file);
          let arr = new Array();
          for (let i = 0; i != data.length; ++i) {
            arr[i] = String.fromCharCode(data[i]);
          }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, {
            type: 'binary',
          });
          const first_sheet_name = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[first_sheet_name];
          const json = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
          });
          for (register of json) {
            let obj = {};
            for (key in register) {
              if (key === 'nome') obj.name = register[key];
              if (key === 'sku') obj.sku = register[key];
              if (key === 'descricao') obj.description = register[key];
              if (key === 'quantidade') obj.amount = register[key];
              if (key === 'preco') obj.price = register[key];
            }
            obj.active = true;
            let product = await Product.create(obj);
            let categories = register.categoria
              ? register.categoria.split('|')
              : [];
            for (cat of categories) {
              let code = await makeCode(10);
              let [res] = await Category.findOrCreate({
                where: { name: cat, code, active: true },
              });
              await product.addCategory(res);
            }
          }
        }
      });
      return res.send();
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

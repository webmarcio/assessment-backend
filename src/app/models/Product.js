const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        sku: DataTypes.STRING,
        price: DataTypes.FLOAT,
        description: DataTypes.STRING,
        amount: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
      },
      { sequelize },
    );
  }
}

module.exports = Product;

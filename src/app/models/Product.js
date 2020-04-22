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
        image: DataTypes.STRING,
      },
      { sequelize },
    );
  }

  static associate(models) {
    this.belongsToMany(models.Category, {
      foreignKey: 'product_id',
      through: 'product_categories',
      as: 'categories',
    });
  }
}

module.exports = Product;

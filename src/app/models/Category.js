const { Model, DataTypes } = require('sequelize');

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        code: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
      },
      { sequelize },
    );
  }

  static associate(models) {
    this.belongsToMany(models.Product, {
      foreignKey: 'category_id',
      through: 'product_categories',
      as: 'products',
    });
  }
}

module.exports = Category;

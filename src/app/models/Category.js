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
}

module.exports = Category;

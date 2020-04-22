'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('products', 'image', {
      type: Sequelize.STRING,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('products', 'image');
  },
};

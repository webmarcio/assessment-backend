'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('products', 'active', {
      type: Sequelize.BOOLEAN,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('products', 'active');
  },
};

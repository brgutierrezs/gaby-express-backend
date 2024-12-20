const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'categories',
    timestamps: false,
  });

  Category.associate = function(models) {
    Category.belongsToMany(models.Product, { through: 'product_categories', foreignKey: 'category_id' });
  };

  module.exports = Category
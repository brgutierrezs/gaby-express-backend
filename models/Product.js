const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: false,
});

Product.associate = function (models) {
  Product.belongsToMany(models.Category, { through: 'product_categories', foreignKey: 'product_id' });
  Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
  Product.hasMany(models.Review, { foreignKey: 'product_id' });
  Product.hasMany(models.ProductImage, {foreignKey: 'product_id'});
};

module.exports = Product
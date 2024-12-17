const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: false,
  });

  Review.associate = function(models) {
    Review.belongsTo(models.User, { foreignKey: 'user_id' });
    Review.belongsTo(models.Product, { foreignKey: 'product_id' });
  };

  module.exports  = Review;
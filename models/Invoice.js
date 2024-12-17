const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('issued', 'paid', 'cancelled'),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'invoices',
    timestamps: false,
  });

  Invoice.associate = function(models) {
    Invoice.belongsTo(models.Order, { foreignKey: 'order_id' });
    Invoice.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  module.exports = Invoice
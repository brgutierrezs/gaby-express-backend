const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comuna: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'addresses',
    timestamps: false,
  });

  Address.associate = function(models) {
    Address.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  module.exports = Address;
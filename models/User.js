const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  rut: {
    type: DataTypes.STRING(12),
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

User.associate = function(models) {
  User.hasMany(models.Address, { foreignKey: 'user_id' });
  User.hasMany(models.Order, { foreignKey: 'user_id' });
  User.hasMany(models.Invoice, { foreignKey: 'user_id' });
  User.hasMany(models.Review, { foreignKey: 'user_id' });
};


module.exports = User;

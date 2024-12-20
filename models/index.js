const fs = require('fs');
const path = require('path');
const { sequelize, Sequelize } = require('../config/database');


const models = {};

// Cargar todos los modelos
fs.readdirSync(path.join(__dirname))
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file));  // Ya no necesitamos pasar sequelize ni DataTypes
    models[model.name] = model;
  });

// Establecer asociaciones
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Exportar los modelos y sequelize
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;




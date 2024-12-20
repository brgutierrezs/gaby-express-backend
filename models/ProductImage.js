const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'product_images',    
    timestamps: false
});

ProductImage.associate = function(models) {
    ProductImage.belongsTo(models.Product, { foreignKey: 'product_id'});
};

module.exports = ProductImage;
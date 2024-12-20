const { Product, Category, ProductImage } = require("../models/index");
const { Op } = require('sequelize');


//endpoint para obtener todos los productos
const getProducts = async (req, res) => {

   

    try {
        //desestructuramos los parametros que vengan en la query
        const {
            page = 1,
            limit = 10,
            order = 'id',
            sort = 'DESC',
            search = ''

        } = req.query;

        //configuracion de paginacion del offset que hace el calculo de cuantas paginas debe saltarse para mostrar la pagina actual
        const offset = (page - 1) * limit;

        // Configuración de filtros y búsqueda
        const whereCondition = search ? {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        // Búsqueda con múltiples opciones
        const { count, rows: products } = await Product.findAndCountAll({
            where: whereCondition,
            order: [[order, sort]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: {
                exclude: ['createdBy', 'updatedBy', 'passwordHash'] // Excluir campos sensibles
            },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name'],
                    through: {
                        attributes: [] // Esto evita incluir los campos de la tabla de unión
                    }
                },
                {
                    model: ProductImage,
                    attributes: ['id', 'image_url'],
                   
                }
            ]
        });

        // Respuesta estructurada
        res.status(200).json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products
        });

    } catch (error) {
        // Logging más estructurado
        console.error('Error al obtener productos:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Respuesta de error más específica
        res.status(500).json({
            message: 'Error interno del servidor',
            errorCode: 'PRODUCT_FETCH_ERROR'
        });
    }


}



module.exports = {
    getProducts
}
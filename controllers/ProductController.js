const { Product, Category, ProductImage } = require("../models/index");
const { Op } = require('sequelize');
const { validateProduct } = require('../helpers/validations/productSchema');
const { sequelize } = require('../config/database');

//endpoint para obtener todos los productos
const getProducts = async (req, res) => {



    try {
        //desestructuramos los parametros que vengan en la query
        const {
            page = 1,
            limit = 10,
            order = 'id',
            sort = 'DESC',
            search = '',
            id = ''

        } = req.query;

        //configuracion de paginacion del offset que hace el calculo de cuantas paginas debe saltarse para mostrar la pagina actual
        const offset = (page - 1) * limit;

        // Configuración de filtros y búsqueda
        // const whereCondition = search ? {
        //     [Op.or]: [
        //         { name: { [Op.like]: `%${search}%` } },
        //         { description: { [Op.like]: `%${search}%` } },

        //     ]
        // } : {};

        const whereCondition = {
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ]
            }),
            ...(id && { id: id })
        };

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

const setProduct = async (req, res) => {

    // Las transacciones permiten ejecutar múltiples operaciones de base de datos como una única unidad atómica - o todas las operaciones se completan exitosamente, o ninguna se aplica.
    const transaction = await sequelize.transaction();

    try {

        //traemos los parametros desde el body
        const { isValid, data, errors } = await validateProduct(req.body);

        // console.log('es valido?',isValid)
        // console.log("la data del body",data)
        // console.log("errores",errors)

        //validar que vengan los datos con la biblioteca yup
        if (!isValid) {
            return res.status(400).json({
                success: "error",
                errors
            });
        }

        // verificar que la categoria existe
        const category = await Category.findByPk(data.categoryId);
        if (!category) {
            return res.status(404).json({
                succes: "error",
                message: "La categoria especificada no existe",

            })
        }

        //creamos el producto en la base de datos

        const newProduct = await Product.create({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            //despues se debe cambiar ya que el unico que puede crear productos es el admin
            created_by: 1
        },{transaction}); //aseguramos que transaction funcione en el metodo create en caso que de error haga el rollback correspondiente

        // Asociar la categoría con el setCategories que se genera automaticamente por sequelize cuando defino una relacion de muchos a muchos 
        await newProduct.setCategories([data.categoryId], { transaction });

        //crear las imagenes
        const productImages = data.images.map(img => ({
            product_id: newProduct.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            created_at: new Date(),
            updated_at: new Date()
        }));

        //usamos builk para insertar multiples objetos en este caso las imagenes guardadas en productImages
        await ProductImage.bulkCreate(productImages, { transaction });

        // Confirmar la transacción
        await transaction.commit();

        // Obtener el producto con sus relaciones
        const createdProduct = await Product.findByPk(newProduct.id, {
            include: [
                { model: Category },
                { model: ProductImage }
            ]
        });

        return res.status(201).json({
            success: "success",
            message: "Producto creado exitosamente",
            data: createdProduct
        });

    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();

        console.error('Error al crear producto:', error);
        return res.status(500).json({
            success: "error",
            message: "Error interno del servidor"
        });
    }
    // res.status(200).json({
    //     message: "metodo para crear un producto"
    // })


}



module.exports = {
    getProducts,
    setProduct
}
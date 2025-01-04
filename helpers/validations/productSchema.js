const yup = require('yup');


const productSchema = yup.object().shape({
    name: yup.string()
        .required('El nombre del producto es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(255, 'El nombre no puede exceder 255 caracteres'),
    description: yup.string()
        .required('La descripción es requerida'),
    price: yup.number()
        .required('El precio es requerido')
        .positive('El precio debe ser positivo')
        .test('decimal-places',
            'El precio debe tener máximo 2 decimales',
            value => {
                if (!value) return true; // Skip if empty (required() will handle this)
                return /^\d+(\.\d{1,2})?$/.test(value.toString())
            }
        ),
    stock: yup.number()
        .required('El stock es requerido')
        .integer('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo'),
    categoryId: yup.number()
        .required('La categoría es requerida')
        .positive('ID de categoría inválido'),
    images: yup.array().of(
        yup.object().shape({
            image_url: yup.string()
                .required('La URL de la imagen es requerida')
                .url('Debe ser una URL válida'),
            is_primary: yup.boolean()
                .default(false)
        })
    ).min(1, 'Se requiere al menos una imagen')
});


const validateProduct = async (productData) => {
    try {
        const validatedData = await productSchema.validate(productData, {

            //Si es true (default): se detiene en el primer error encontrado Si es false: recolecta TODOS los errores de validación antes de terminar
            abortEarly: false,

        });

        //Si la validación es exitosa, retorna un objeto con: isValid: true indicando que pasó todas las validaciones data: validatedData contiene los datos ya validados y transformados por Yup
        return { isValid: true, data: validatedData };

    } catch (error) {

        return {
            isValid: false,
            errors: error.inner.map(err => ({
                field: err.path,
                message: err.message
            }))
        };
    }
};

module.exports = { validateProduct };
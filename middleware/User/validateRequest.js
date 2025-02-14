
const validateRequest = (schema) => async (req, res, next) => {

    try {
        await schema.validate(req.body, { aborEarly: false });

        return next();
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: "Error inesperado " + error.errors
        });
    }
};

module.exports =  validateRequest
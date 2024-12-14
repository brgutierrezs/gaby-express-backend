const User = require('../models/User');
const { sendResponse } = require('../helpers/response');


//Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {

    try {

        console.log('intentando obtener los usuarios...')

        const users = await User.findAll();

        console.log('usuarios encontrados', users);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            message: 'Error al obtener los usuarios',
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
    }
};

const login = async (req, res) => {

    try {

        //recoger los parametros
        const { email, password } = req.body;

        console.log(email, password);

        //verificar que el usuario no ingreso datos vacios 
        if (!password || !email) {
            return sendResponse(res, 400, false, "Email y contraseña son obligatorios", null, {

                email: !email ? "faltantate" : null,
                password: !password ? "faltante" : null
            });
        }

        //buscar usuario por email
        const user = await User.findOne({ where: { email } });

        console.log(user)

        // Verificar la contraseña usando bcrypt
        if (user.password_hash !== password) {
            return sendResponse(res, 401, false, "Contraseña incorrecta");
        }

        //si todo esta bien, responder con exito

        return sendResponse(res, 200, true, "Login exitoso", {
            userId: user.id,
            email: user.email,
            name: user.name
        })

    } catch (error) {

        return sendResponse(res, 500, false, "Error inesperado", null, {
            error: error.message
        });
    }
}

module.exports = {
    getUsers,
    login
}
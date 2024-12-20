//const User = require('../models/User');
const { User } = require("../models/index");
const { sendResponse } = require('../helpers/response');
const bcrypt = require('bcrypt')
const { generateToken } = require('../services/token/jwt');

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
        const remember = req.query.remember;



        //verificar que el usuario no ingreso datos vacios 
        if (!password || !email) {
            return sendResponse(res, 400, false, "Email y contraseña son obligatorios", null, {

                email: !email ? "faltantate" : null,
                password: !password ? "faltante" : null
            });
        }


        //buscar usuario por email
        const userLogin = await User.findOne({ where: { email } });



        // Verificar la contraseña usando bcrypt
        const validPassword = bcrypt.compareSync(password, userLogin.password_hash);
        if (!validPassword) {
            return sendResponse(res, 401, false, "Contraseña incorrecta");
        }

        //Generar tokens usando la funcion generateToken
        const { token, refreshToken } = generateToken(userLogin);


        // Configurar las cookies
        // Si el usuario eligió "remember me", guardamos el refresh token por 30 días
        if (remember === 'true') {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, // Solo accesible en el servidor
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
            })
        }

        // También configuramos el token de acceso (JWT) con una duración de 1 hora
        res.cookie('token', token, {
            httpOnly: true,
            secure: false , // En producción solo se envía en https
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        //si todo esta bien, responder con exito

        return sendResponse(res, 200, true, "Login exitoso", {
            userId: userLogin.id,
            email: userLogin.email,
            name: userLogin.name
        });



    } catch (error) {

        return sendResponse(res, 500, false, "Error inesperado", null, {
            error: error.message
        });
    }
}


const updatePassword = async (req, res) => {
    const { userId } = req.params; // Usamos el ID del usuario desde los parámetros
    const { currentPassword, newPassword } = req.body; // Obtenemos la contraseña actual y la nueva

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        // Verificar si la contraseña actual es correcta
        const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: "Contraseña actual incorrecta"
            });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        user.password_hash = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Contraseña actualizada con éxito"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar la contraseña",
            error: error.message
        });
    }
};




module.exports = {
    getUsers,
    login,
    updatePassword
}
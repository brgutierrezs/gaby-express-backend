//const User = require('../models/User');
const { User, Order, Review, Address } = require("../models/index");
const { sendResponse } = require('../helpers/response');
const bcrypt = require('bcrypt')
const { generateToken } = require('../services/token/jwt');
const { options } = require("../routes/users");

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
            status: 'error',
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
        console.log(email, password)


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

        // //preguntar si el usuario encontrado esta activo
        if (!userLogin.is_active) {
            return sendResponse(res, 401, false, "Su cuenta se encuentra desactivada")
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
            secure: false, // En producción solo se envía en https
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        //si todo esta bien, responder con exito

        return sendResponse(res, 200, true, "Login exitoso", {
            userId: userLogin.id,
            email: userLogin.email,
            name: userLogin.name,
            
        });



    } catch (error) {

        return sendResponse(res, 500, false, "Error inesperado", null, {
            error: error.message
        });
    }
}

//metodo para obtener el perfil del usuario
const getprofile = async (req, res) => {

    try {

        //obtenemos el id del usuario
        const userId = req.user.id;

        //hacemos la consulta a la base de datos con la informacion necesaria
        const userProfile = await User.findByPk(userId, {
            attributes: {
                exclude: ['password_hash'] // Excluir la contraseña
            },
            include: [
                //agregamos las ultimas 5 ordenes del usuario
                {
                    model: Order,
                    attributes: ['total_amount', 'status', 'created_at'], // Seleccionar solo los campos necesarios
                    limitL: 5, // Limitar a 5 pedidos,
                    order: [['created_at', 'DESC']] // Ordenar por fecha de creación
                },
                //agregamos las ultimas 3 reviews del usuario
                {
                    model: Review,
                    attributes: ['rating', 'comment', 'product_id'],
                    limit: 3,
                    order: [['created_at', 'DESC']],
                },
                //agregamos los datos de envio del usuario
                {
                    model: Address,
                    attributes: ['id', 'user_id', 'region', 'comuna', 'address_line', 'phone', 'is_primary'],
                    limit: 3,

                }


            ]
        });


        //validamos que el perfil exista
        if (!userProfile) {
            return sendResponse(res, 404, "error", "Perfil no encontrado");
        };

        //si se encontro preguntamos si es un perfil activo
        if(!userProfile.is_active) {
            return sendResponse(res, 400, "error", "Su perfil no esta activo");
        }

        // return sendResponse(res, 200, "success", "Perfil obtenido", userProfile);
        return res.status(200).json({
            status: "success",
            message: "Perfil obtenido",
            user: userProfile
        })


    } catch (error) {
        return res.status(500).send({
            status: "error",
            error: error.message
        });
    }

    // //probar el endpoint
    // return res.status(200).json({
    //     status: "success",
    //     message: "Perfil obtenido",
    //     //user: userProfile
    // })



}

//metodo para obtener cookie
const getCookie = (req, res) => {

    try {
        const cookieName = 'token';
        const cookie = req.cookies[cookieName];


        if (!cookie) {
            return res.status(404).send({
                status: "error",
                message: "la cookie no existe",

            })
        }

        return res.status(200).json({
            status: "success",
            message: "cookie obtenida",
            cookie,
            //user: req.user || "usuario no existe"
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            error: error.message
        });
    }
}

//metodo para limpiar la cookie
const cleanCookie = (req, res) => {

    try {

        //obtener el nombre de la cookie a limpiar 
        let nameCookie = req.query.cookie;
        //usamos un operador ternario, si cookie tiene un valor entonces sera igual a nameCookie, si no sera igual a token
        nameCookie = nameCookie ? nameCookie : 'token';
        res.clearCookie(nameCookie, { httpOnly: true, secure: false });
        res.clearCookie('refreshToken', { httpOnly: true, secure: false });

        return res.status(200).json({
            status: "success",
            message: "cookie eliminada"
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            error: error.message || 'error desconocido',
            error: error.stack
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
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Verificar si la contraseña actual es correcta
        const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                status: "error",
                message: "Contraseña actual incorrecta"
            });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        user.password_hash = hashedPassword;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Contraseña actualizada con éxito"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar la contraseña",
            error: error.message
        });
    }
};




module.exports = {
    getUsers,
    login,
    updatePassword,
    getCookie,
    cleanCookie,
    getprofile
}
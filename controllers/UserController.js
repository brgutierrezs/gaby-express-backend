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
        // Recoger los parámetros
        const { password, email, username } = req.body;
        const remember = req.query.remember;
        console.log(email, password)
        
        // Verificar que el usuario proporcionó al menos un identificador (email o username) y contraseña
        if (!password || (!email && !username)) {
            return sendResponse(res, 400, false, "Credenciales incompletas", null, {
                identifier: (!email && !username) ? "faltante" : null,
                password: !password ? "faltante" : null
            });
        }

        // Construir la consulta para buscar por email o username
        const whereClause = {};
        if (email) {
            whereClause.email = email;
        } else if (username) {
            whereClause.username = username;
        }

        // Buscar usuario
        const userLogin = await User.findOne({ where: whereClause });

        // En caso que el usuario no se encuentre
        if (!userLogin) {
            return sendResponse(res, 404, false, "Usuario no encontrado");
        }

        // Verificar la contraseña usando bcrypt
        const validPassword = bcrypt.compareSync(password, userLogin.password_hash);
        if (!validPassword) {
            return sendResponse(res, 401, false, "Contraseña incorrecta");
        }

        // Verificar si el usuario está activo
        if (!userLogin.is_active) {
            return sendResponse(res, 401, false, "Su cuenta se encuentra desactivada");
        }

        // Generar tokens
        const { token, refreshToken } = generateToken(userLogin);


        // Configurar las cookies
        if (remember === 'true') {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
            });
        }

        // También configuramos el token de acceso (JWT) con una duración de 1 hora
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        // Responder con éxito
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
};

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
        if (!userProfile.is_active) {
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

const register = async (req, res) => {


    try {

        //traer datos del formulario
        const { username, email, password } = req.body;

        //Los datos se validan en el midleware

        //verificar que el username y el email no esten registrados

        //primero buscamos el usuario 
        const [userByEmail, userByUsername] = await Promise.all([
            User.findOne({ where: { email } }),
            User.findOne({ where: { username } })
        ]);

        // Verificar si el email ya está registrado
        if (userByEmail) {
            return res.status(400).json({
                status: 'error',
                message: "El email ya está registrado"
            });
        }

        // Verificar si el username ya está registrado
        if (userByUsername) {
            return res.status(400).json({
                status: 'error',
                message: "El nombre de usuario ya está registrado"
            });
        }

         // Hashear la contraseña
         const hashedPassword = await bcrypt.hash(password,10);

         //crear al usuario 

         const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role:"customer",
            //cambiar el activo al momento de agregar confirmacion por correo
            is_active: true,
            create_at: new Date()
         });

          // Respuesta exitosa
        return res.status(201).json({
            status: "success",
            message: "Usuario registrado exitosamente",
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                
            }
        });

        // return res.status(200).json({
        //     status: "success",
        //     message: "Probando metodo register"
        // })

    } catch (error) {
        console.error('Error en registro:', error)
        return res.status(500).json({
            status: "error",
            message: "Error en el servidor al procesar el registro",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}




module.exports = {
    getUsers,
    login,
    updatePassword,
    getCookie,
    cleanCookie,
    getprofile,
    register
}
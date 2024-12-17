const jwt = require("jsonwebtoken");
const User = require("../../models/User");
require('dotenv').config();


//funcion para generar el token
const generateToken = (user) => {
    //datos que queremos incluir en el payload del token
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    // Firma del token usando la clave secreta 
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: '30d'
    });

    return { token, refreshToken };
};

module.exports = {
    generateToken
}

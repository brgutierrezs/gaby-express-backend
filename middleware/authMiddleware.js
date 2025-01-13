const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    // Verificar si cookie-parser está funcionando correctamente
    const token = req.cookies?.token;

    if (!token) {
        return res.status(403).json({
            status: 'error',
            message: 'No token found in cookies',
        });
    }

    try {
        // Verificar el token
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Propagar datos del usuario
        req.user = payload;

        // Continuar al siguiente middleware
        next();
    } catch (error) {
        // Determinar el tipo de error para un mejor mensaje
        const errorMessage =
            error.name === 'TokenExpiredError'
                ? 'Token has expired'
                : 'Token is invalid';

        return res.status(401).json({
            status: "error",
            message: errorMessage,
        });
    }
};
const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
 
    console.log("token ",req.cookies.token);   // Verifica qué cookies están presentes en la solicitud
    // Acceder directamente a la cookie 'token' gracias a cookie-parser
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({
            status: 'error',
            message: 'No token found in cookies'
        });
    }

    try {
        // Verificamos el token
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Token expired or invalid",
            error
        });
    }
};

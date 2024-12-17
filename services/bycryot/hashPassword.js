const bcrypt = require('bcrypt');
const saltRounds = 10; // Número de rondas de salt

// Metodo para encriptar contrasenas

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

module.exports = { hashPassword };
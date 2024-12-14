//coneccion nativa de mysql con node
// const mysql = require('mysql2');
// require('dotenv').config();
//const { Sequelize } = require('sequelize');


// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,       // Dirección del servidor donde está alojada la base de datos
//     user: process.env.DB_USER,       // Nombre de usuario para acceder a MySQL
//     password: process.env.DB_PASSWORD, // Contraseña para autenticar el usuario
//     database: process.env.DB_NAME,   // Nombre de la base de datos a la que quieres conectar
// });

// connection.connect((err) => {
//     if(err) {
//         console.error('Error connecting to the database: ', err.message);
//         process.exit(1);
//     }else{
//         console.log('Connected to MySQL database');
//     }
// });

// module.exports = connection;





//coneccion usando sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DB_PORT:', process.env.DB_PORT);

// Configurar Sequelize con variables de entorno

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Puede cambiarse a otros dialectos como 'postgres', 'sqlite', etc.
    port: process.env.DB_PORT, // Agrega el puerto aquí
    logging: false // Habilitar logs de Sequelize, // Desactiva logs de consultas SQL (opcional)

});

// Función async/await para manejar la conexión
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a MySQL establecida exitosamente.');
        
        // Sincronización segura de modelos
        await sequelize.sync({ 
            // alter: true // Opcional: modifica tablas existentes
        });
        
        console.log('Base de datos sincronizada correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        // Opcional: Implementar un reintento de conexión o manejo de error
        process.exit(1); // Salir si no hay conexión
    }
};

// Llamar a la función de conexión
connectDatabase();


module.exports = {sequelize, connectDatabase};
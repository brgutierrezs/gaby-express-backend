const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Recomiendo agregar helmet para seguridad
const morgan = require('morgan'); // Opcional: para logging de solicitudes
const cookieParser = require('cookie-parser'); // I

// Importar rutas
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/product');

// Crear la instancia de la app
const app = express();

// Middleware de seguridad
app.use(helmet()); // Añade headers de seguridad

// Configuración de CORS más específica (opcional)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Puedes especificar orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  credentials: true, // Permite enviar cookies
}));

// Middleware de parseo y logging
app.use(express.json()); // Parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios
app.use(morgan('dev')); // Logging de solicitudes (opcional)

// Middleware de manejo de errores global (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Algo salió mal',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Middleware de cookies 
app.use(cookieParser()); // Esto permite leer las cookies en req.cookies y  debe estar antes de las rutas

// Rutas o endpoints
app.use('/api/users', userRoutes);
app.use('/api/product', productRoutes);



// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Ruta no encontrada'
  });
});

// Exportar la app para usarla en server.js
module.exports = app;
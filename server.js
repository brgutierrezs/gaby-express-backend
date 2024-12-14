//coneccion nativa con mysql y node

// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors'); // Importamos el paquete cors

// const connection = require('./config/database');
// const userRoutes = require('./routes/users');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(cors()); // Usamos CORS para permitir solicitudes de cualquier origen
// app.use(express.json());

// // Routes
// app.use('/api/users', userRoutes);

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

//coneccion con sequelize


const app = require('./app'); // Importar la app configurada
const sequelize = require('./config/database');// Importar la app configurada

//probar la coneccion con sequelize y sincronizar modelos
// Iniciar el servidor después de la conexión a la base de datos
sequelize.connectDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  });
   
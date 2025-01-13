const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { auth } = require('../middleware/authMiddleware');

// Ejemplo de controlador
router.get('/', (req, res) => {
  res.json({ message: 'List of users' });
});

// Ruta de prueba para obtener usuarios
router.get('/all-user', userController.getUsers );

//rutas relacionadas con usuarios
router.post('/login', userController.login);
router.put('/update-password/:userId', auth, userController.updatePassword);
router.get('/get-cookie', auth, userController.getCookie );
router.get('/clean-cookie', userController.cleanCookie );
router.get('/get-profile', auth,userController.getprofile );


module.exports = router;
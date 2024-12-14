// // const express = require('express');
// // const router = express.Router();
// // const connection = require('../config/database');

// // // Get all users
// // router.get('/', (req, res) => {
// //   connection.query('SELECT * FROM users', (err, results) => {
// //     if (err) {
// //       return res.status(500).json({ error: err.message });
// //     }
// //     res.json(results);
// //   });
// // });

// // // Get user by ID
// // router.get('/:id', (req, res) => {
// //   const { id } = req.params;
// //   connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
// //     if (err) {
// //       return res.status(500).json({ error: err.message });
// //     }
// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'User not found' });
// //     }
// //     res.json(results[0]);
// //   });
// // });

// // // Create a new user
// // router.post('/', (req, res) => {
// //   const { name, email } = req.body;
// //   connection.query(
// //     'INSERT INTO users (name, email) VALUES (?, ?)',
// //     [name, email],
// //     (err, results) => {
// //       if (err) {
// //         return res.status(500).json({ error: err.message });
// //       }
// //       res.status(201).json({ id: results.insertId, name, email });
// //     }
// //   );
// // });

// // // Update a user
// // router.put('/:id', (req, res) => {
// //   const { id } = req.params;
// //   const { name, email } = req.body;
// //   connection.query(
// //     'UPDATE users SET name = ?, email = ? WHERE id = ?',
// //     [name, email, id],
// //     (err, results) => {
// //       if (err) {
// //         return res.status(500).json({ error: err.message });
// //       }
// //       if (results.affectedRows === 0) {
// //         return res.status(404).json({ message: 'User not found' });
// //       }
// //       res.json({ message: 'User updated successfully' });
// //     }
// //   );
// // });

// // // Delete a user
// // router.delete('/:id', (req, res) => {
// //   const { id } = req.params;
// //   connection.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
// //     if (err) {
// //       return res.status(500).json({ error: err.message });
// //     }
// //     if (results.affectedRows === 0) {
// //       return res.status(404).json({ message: 'User not found' });
// //     }
// //     res.json({ message: 'User deleted successfully' });
// //   });
// // });

// // module.exports = router;



const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Ejemplo de controlador
router.get('/', (req, res) => {
  res.json({ message: 'List of users' });
});

// Ruta de prueba para obtener usuarios
router.get('/all-user', userController.getUsers );

//rutas relacionadas con usuarios
router.get('/login', userController.login);

module.exports = router;
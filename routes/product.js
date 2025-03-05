const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const ProductController = require('../controllers/ProductController');

//ruta de prueba 
router.get('/all-product', ProductController.getProducts);
router.get('/all-category', ProductController.getCategory);
router.post('/create-product', ProductController.setProduct);


module.exports = router;
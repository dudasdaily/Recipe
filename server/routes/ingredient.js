const express = require('express');
const router = express.Router();
const multer = require('multer');
const ingredientController = require('../controllers/ingredientController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/list', ingredientController.getIngredientList)
// router.post('/upload', upload.single('image'), ingredientController.handleImageUpload);

module.exports = router;

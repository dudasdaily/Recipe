const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

// 재료 목록 조회 및 생성
router.get('/', ingredientController.getIngredients);
router.post('/', ingredientController.createIngredient);

// 특정 재료 조회, 수정, 삭제
router.get('/:id', ingredientController.getIngredient);
router.put('/:id', ingredientController.updateIngredient);
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router; 
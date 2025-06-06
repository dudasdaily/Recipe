const { Ingredient } = require('../models');

// 응답 데이터 가공을 위한 유틸리티 함수
const formatIngredient = (ingredient) => {
  const { 
    id, 
    name, 
    category, 
    storage_type, 
    default_expiry_days,
    created_at,
    updated_at
  } = ingredient.toJSON();

  return {
    id,
    name,
    category,
    storage_type,
    default_expiry_days,
    created_at,
    updated_at
  };
};

exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: ingredients.map(formatIngredient)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '재료 목록을 불러오는데 실패했습니다.'
    });
  }
};

exports.createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({
      success: true,
      data: formatIngredient(ingredient)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '재료 생성에 실패했습니다.'
    });
  }
};

exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: '재료를 찾을 수 없습니다.'
      });
    }
    res.status(200).json({
      success: true,
      data: formatIngredient(ingredient)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '재료를 불러오는데 실패했습니다.'
    });
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const [updated] = await Ingredient.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '재료를 찾을 수 없습니다.'
      });
    }
    const ingredient = await Ingredient.findByPk(req.params.id);
    res.status(200).json({
      success: true,
      data: formatIngredient(ingredient)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '재료 수정에 실패했습니다.'
    });
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const deleted = await Ingredient.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '재료를 찾을 수 없습니다.'
      });
    }
    res.status(200).json({
      success: true,
      message: '재료가 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '재료 삭제에 실패했습니다.'
    });
  }
};

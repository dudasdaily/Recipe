const { Ingredient } = require('../models');

// 응답 데이터 가공을 위한 유틸리티 함수
const formatIngredient = (ingredient) => {
  const {
    id,
    name,
    category,
    storage_type,
    quantity,
    expiry_date,
    default_expiry_days,
    user_id,
    created_at,
    updated_at
  } = ingredient.toJSON();

  return {
    id,
    name,
    category,
    storage_type,
    quantity,
    expiry_date,
    default_expiry_days,
    user_id,
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
    // 유통기한 처리
    let data = { ...req.body };
    if (
      !data.expiry_date ||
      typeof data.expiry_date !== 'string' ||
      data.expiry_date.trim() === '' ||
      data.expiry_date === 'Invalid date' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.expiry_date) ||
      isNaN(Date.parse(data.expiry_date))
    ) {
      data.expiry_date = null;
    }
    const ingredient = await Ingredient.create(data);
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
    console.log('Update ingredient request:', {
      id: req.params.id,
      body: req.body
    });

    const [updated] = await Ingredient.update(req.body, {
      where: { id: req.params.id }
    });

    console.log('Update result:', updated);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '재료를 찾을 수 없습니다.'
      });
    }

    const ingredient = await Ingredient.findByPk(req.params.id);
    console.log('Updated ingredient:', ingredient);

    res.status(200).json({
      success: true,
      data: formatIngredient(ingredient)
    });
  } catch (error) {
    console.error('재료 수정 중 오류:', error);
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

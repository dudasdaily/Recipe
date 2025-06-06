const Ingredient = require('../models/Ingredient');

/**
 * 새로운 재료 추가
 */
exports.createIngredient = async (req, res) => {
  try {
    const { name, expiryDate, quantity, memo } = req.body;
    
    // 필수 필드 검증
    if (!name || !expiryDate || !quantity) {
      return res.status(400).json({
        success: false,
        message: '이름, 유통기한, 수량은 필수 입력 항목입니다.'
      });
    }

    const ingredient = await Ingredient.create({
      name,
      expiryDate,
      quantity,
      memo
    });

    res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 재료 목록 조회 (정렬/필터링 지원)
 */
exports.getIngredients = async (req, res) => {
  try {
    const { 
      sort = 'expiry_date',  // 기본 정렬: 유통기한
      order = 'asc',         // 기본 정렬 방향: 오름차순
      search               // 검색어 (선택)
    } = req.query;

    // 검색 조건 설정
    const where = {};
    if (search) {
      where.name = {
        [Ingredient.sequelize.Op.like]: `%${search}%`
      };
    }

    const ingredients = await Ingredient.findAll({
      where,
      order: [[sort, order.toUpperCase()]],
    });

    res.json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 특정 재료 상세 조회
 */
exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: '해당 재료를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 재료 정보 수정
 */
exports.updateIngredient = async (req, res) => {
  try {
    const { name, expiryDate, quantity, memo } = req.body;
    
    // 재료 존재 여부 확인
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: '해당 재료를 찾을 수 없습니다.'
      });
    }

    // 데이터 업데이트
    await ingredient.update({
      name: name || ingredient.name,
      expiryDate: expiryDate || ingredient.expiryDate,
      quantity: quantity || ingredient.quantity,
      memo: memo !== undefined ? memo : ingredient.memo
    });

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 재료 삭제
 */
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: '해당 재료를 찾을 수 없습니다.'
      });
    }

    await ingredient.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 
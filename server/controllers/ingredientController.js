const { Ingredient } = require('../models');

exports.getIngredientList = async (req, res) => {
  try {
    // 사용자 인증을 이미 거쳤고, 사용자 ID가 req.user.id에 있다고 가정
    const userId = req.user.id;

    const ingredients = await Ingredient.findAll({
      where: { user_id: userId },
      order: [['expiration_date', 'ASC']]
    });

    res.status(200).json({
      status: 200,
      msg: '재료 목록 불러오기 성공',
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      msg: '서버 오류',
      error: error.message
    });
  }
};

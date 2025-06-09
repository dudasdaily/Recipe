const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보를 요청 객체에 추가
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.'
    });
  }
};

module.exports = authMiddleware; 
const { FCMToken } = require('./src/models');

async function checkTokens() {
  try {
    console.log('📱 등록된 FCM 토큰들 확인 중...\n');
    
    const tokens = await FCMToken.findAll();
    
    if (tokens.length === 0) {
      console.log('❌ 등록된 FCM 토큰이 없습니다.');
      console.log('클라이언트 앱에서 FCM 토큰을 먼저 등록해야 합니다.\n');
    } else {
      console.log(`✅ 총 ${tokens.length}개의 FCM 토큰이 등록되어 있습니다:\n`);
      
      tokens.forEach((token, index) => {
        console.log(`${index + 1}. 사용자 ID: ${token.user_id}`);
        console.log(`   토큰: ${token.token.substring(0, 20)}...`);
        console.log(`   활성화: ${token.is_active ? '✅' : '❌'}`);
        console.log(`   등록일: ${token.created_at}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkTokens(); 
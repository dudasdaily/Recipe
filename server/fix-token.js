const { FCMToken } = require('./src/models');

async function fixTokens() {
  try {
    console.log('🔧 FCM 토큰 수정 중...\n');
    
    // user_id가 null인 토큰들을 찾아서 1로 업데이트
    const result = await FCMToken.update(
      { 
        user_id: 1,
        is_active: true // 활성화도 확실히 설정
      },
      { 
        where: { 
          user_id: null 
        }
      }
    );
    
    console.log(`✅ ${result[0]}개의 FCM 토큰이 수정되었습니다.`);
    
    // 수정 결과 확인
    const tokens = await FCMToken.findAll();
    console.log('\n📱 수정 후 FCM 토큰 목록:');
    
    tokens.forEach((token, index) => {
      console.log(`${index + 1}. 사용자 ID: ${token.user_id}`);
      console.log(`   토큰: ${token.token.substring(0, 20)}...`);
      console.log(`   활성화: ${token.is_active ? '✅' : '❌'}`);
      console.log(`   등록일: ${token.created_at}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

fixTokens(); 
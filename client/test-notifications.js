const axios = require('axios');

// 테스트 설정
const API_BASE_URL = 'http://localhost:3000/api/v1';
const TEST_TOKEN = 'test-fcm-token-' + Date.now();

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 테스트 함수들
async function testFCMTokenRegistration() {
  console.log('🧪 FCM 토큰 등록 테스트...');
  
  try {
    const response = await apiClient.post('/notifications/token', {
      token: TEST_TOKEN,
      deviceInfo: {
        platform: 'test',
        version: '1.0.0',
        model: 'test-device',
      },
    });
    
    console.log('✅ FCM 토큰 등록 성공:', response.data);
    return true;
  } catch (error) {
    console.error('❌ FCM 토큰 등록 실패:', error.response?.data || error.message);
    return false;
  }
}

async function testNotificationSettings() {
  console.log('🧪 알림 설정 테스트...');
  
  try {
    // 설정 저장
    const saveResponse = await apiClient.post('/notifications/settings', {
      notifyTime: '09:00',
      notifyDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      isEnabled: true,
    });
    
    console.log('✅ 알림 설정 저장 성공:', saveResponse.data);
    
    // 설정 조회
    const getResponse = await apiClient.get('/notifications/settings');
    console.log('✅ 알림 설정 조회 성공:', getResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ 알림 설정 테스트 실패:', error.response?.data || error.message);
    return false;
  }
}

async function testNotificationHistory() {
  console.log('🧪 알림 히스토리 테스트...');
  
  try {
    const response = await apiClient.get('/notifications/history');
    console.log('✅ 알림 히스토리 조회 성공:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 알림 히스토리 테스트 실패:', error.response?.data || error.message);
    return false;
  }
}

async function testNotificationSending() {
  console.log('🧪 테스트 알림 전송...');
  
  try {
    const response = await apiClient.post('/notifications/test', {
      token: TEST_TOKEN,
      title: '테스트 알림',
      body: '알림 서비스가 정상적으로 작동합니다!',
    });
    
    console.log('✅ 테스트 알림 전송 성공:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 테스트 알림 전송 실패:', error.response?.data || error.message);
    return false;
  }
}

// 메인 테스트 함수
async function runAllTests() {
  console.log('🚀 알림 서비스 테스트 시작...\n');
  
  const results = {
    tokenRegistration: false,
    settings: false,
    history: false,
    sending: false,
  };
  
  // 1. FCM 토큰 등록 테스트
  results.tokenRegistration = await testFCMTokenRegistration();
  console.log('');
  
  // 2. 알림 설정 테스트
  results.settings = await testNotificationSettings();
  console.log('');
  
  // 3. 알림 히스토리 테스트
  results.history = await testNotificationHistory();
  console.log('');
  
  // 4. 테스트 알림 전송
  results.sending = await testNotificationSending();
  console.log('');
  
  // 결과 요약
  console.log('📊 테스트 결과 요약:');
  console.log(`FCM 토큰 등록: ${results.tokenRegistration ? '✅ 성공' : '❌ 실패'}`);
  console.log(`알림 설정: ${results.settings ? '✅ 성공' : '❌ 실패'}`);
  console.log(`알림 히스토리: ${results.history ? '✅ 성공' : '❌ 실패'}`);
  console.log(`테스트 알림 전송: ${results.sending ? '✅ 성공' : '❌ 실패'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 전체 성공률: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 모든 테스트가 성공했습니다!');
  } else {
    console.log('⚠️ 일부 테스트가 실패했습니다. 서버 상태를 확인해주세요.');
  }
}

// 서버 연결 테스트
async function testServerConnection() {
  console.log('🔍 서버 연결 테스트...');
  
  try {
    const response = await apiClient.get('/');
    console.log('✅ 서버 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 서버 연결 실패:', error.message);
    console.log('💡 서버가 실행 중인지 확인해주세요: npm start (server 폴더에서)');
    return false;
  }
}

// 실행
async function main() {
  const serverConnected = await testServerConnection();
  
  if (serverConnected) {
    await runAllTests();
  } else {
    console.log('❌ 서버 연결 실패로 테스트를 중단합니다.');
  }
}

main().catch(console.error); 
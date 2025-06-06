const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const initializeFirebase = () => {
  try {
    const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    console.log('Firebase Admin SDK 초기화 성공');
  } catch (error) {
    console.error('Firebase Admin SDK 초기화 실패:', error);
    throw error;
  }
};

// FCM 메시지 전송 함수
const sendNotification = async (token, notification, data = {}) => {
  try {
    const message = {
      notification,
      data,
      token
    };

    const response = await admin.messaging().send(message);
    console.log('알림 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('알림 전송 실패:', error);
    throw error;
  }
};

// 여러 기기에 알림 전송
const sendMulticastNotification = async (tokens, notification, data = {}) => {
  try {
    const message = {
      notification,
      data,
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('다중 알림 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('다중 알림 전송 실패:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendNotification,
  sendMulticastNotification
}; 
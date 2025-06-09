const admin = require('firebase-admin');
const NotificationSetting = require('../models/NotificationSetting');
const NotificationHistory = require('../models/NotificationHistory');
const { FCMToken } = require('../models');
const { Op } = require('sequelize');
const path = require('path');

class NotificationService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(require('../../firebase-service-account.json'))
      });
    }
  }

  async sendNotification(userId, notification) {
    try {
      const fcmToken = await FCMToken.findOne({
        where: { user_id: userId, is_active: true }
      });

      if (!fcmToken) {
        throw new Error('No active FCM token found for user');
      }

      // 테스트를 위해 실제 FCM 전송은 건너뛰고 로그만 출력
      console.log('Sending notification:', {
        token: fcmToken.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      });
      
      // 알림 히스토리 저장
      await NotificationHistory.create({
        user_id: userId,
        notification_type: notification.data.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sent_at: new Date()
      });

      return { messageId: 'test-message-id' };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendExpiryNotifications() {
    try {
      const settings = await NotificationSetting.findAll({
        where: { is_enabled: true },
        include: [{
          model: FCMToken,
          where: { is_active: true },
          required: true
        }]
      });

      for (const setting of settings) {
        const expiringItems = await this.getExpiringItems(setting.user_id);
        
        if (expiringItems.length > 0) {
          const notification = {
            title: '유통기한 임박 알림',
            body: `${expiringItems.length}개의 재료가 곧 유통기한이 만료됩니다`,
            data: {
              type: 'EXPIRY_ALERT',
              ingredients: expiringItems
            }
          };

          await this.sendNotification(setting.user_id, notification);
        }
      }
    } catch (error) {
      console.error('Error sending expiry notifications:', error);
      throw error;
    }
  }

  async getExpiringItems(userId) {
    // 유통기한이 3일 이내로 남은 재료 조회 로직
    // 실제 구현은 데이터베이스 쿼리로 대체
    return [];
  }

  async updateNotificationSettings(userId, settings) {
    try {
      console.log('Updating notification settings for user:', userId);
      console.log('Settings:', settings);

      // 필드명을 데이터베이스 컬럼명과 일치하도록 변환
      const settingsWithUserId = {
        user_id: userId,
        notify_time: settings.notifyTime,
        notify_days: settings.notifyDays,
        is_enabled: settings.isEnabled
      };

      const [notificationSetting, created] = await NotificationSetting.findOrCreate({
        where: { user_id: userId },
        defaults: settingsWithUserId
      });

      if (!created) {
        await notificationSetting.update(settingsWithUserId);
      }

      console.log('Settings updated successfully:', notificationSetting.toJSON());
      return notificationSetting;
    } catch (error) {
      console.error('Error in updateNotificationSettings:', error);
      throw error;
    }
  }

  async getNotificationSettings(userId) {
    try {
      const settings = await NotificationSetting.findOne({
        where: { user_id: userId }
      });
      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  // 유통기한 임박 재료 조회
  async getExpiringIngredients() {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    return await ReceiptItem.findAll({
      where: {
        expiryDate: {
          [Op.lte]: threeDaysLater,
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: Ingredient,
          attributes: ['name']
        }
      ]
    });
  }

  // 알림 설정이 있는 사용자 조회
  async getUsersWithNotificationSettings() {
    return await User.findAll({
      include: [
        {
          model: NotificationSetting,
          where: { is_enabled: true }
        }
      ]
    });
  }

  // 테스트 알림 전송
  async sendTestNotification(userId) {
    try {
      const fcmToken = await FCMToken.findOne({
        where: { 
          user_id: userId,
          is_active: true
        }
      });

      if (!fcmToken) {
        throw new Error('활성화된 FCM 토큰이 없습니다.');
      }

      const notification = {
        title: '테스트 알림',
        body: '알림 설정이 정상적으로 작동합니다.'
      };

      await this.sendNotification(userId, notification);

      return true;
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      throw error;
    }
  }

  // FCM 토큰 등록
  async registerFCMToken(userId, token, deviceInfo) {
    try {
      const [fcmToken, created] = await FCMToken.findOrCreate({
        where: { token },
        defaults: {
          user_id: userId,
          token,
          device_info: deviceInfo,
          is_active: true,
          last_used_at: new Date()
        }
      });

      if (!created) {
        await fcmToken.update({
          user_id: userId,
          device_info: deviceInfo,
          is_active: true,
          last_used_at: new Date()
        });
      }

      return fcmToken;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 
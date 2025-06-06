const { sendNotification, sendMulticastNotification } = require('../config/firebase');
const NotificationSetting = require('../models/NotificationSetting');
const NotificationHistory = require('../models/NotificationHistory');
const FCMToken = require('../models/FCMToken');
const { Op } = require('sequelize');

class NotificationService {
  // 알림 설정 저장
  async saveNotificationSettings(userId, settings) {
    const [notificationSetting, created] = await NotificationSetting.findOrCreate({
      where: { userId },
      defaults: {
        ...settings,
        userId
      }
    });

    if (!created) {
      await notificationSetting.update(settings);
    }

    return notificationSetting;
  }

  // 알림 설정 조회
  async getNotificationSettings(userId) {
    return await NotificationSetting.findOne({
      where: { userId }
    });
  }

  // 유통기한 임박 알림 전송
  async sendExpiryNotifications() {
    try {
      // 유통기한이 3일 이하로 남은 재료 조회
      const expiringIngredients = await this.getExpiringIngredients();
      
      // 사용자별로 알림 설정 조회
      const users = await this.getUsersWithNotificationSettings();
      
      for (const user of users) {
        const fcmTokens = await FCMToken.findAll({
          where: { 
            userId: user.id,
            isActive: true
          }
        });

        if (fcmTokens.length === 0) continue;

        const userIngredients = expiringIngredients.filter(
          ingredient => ingredient.userId === user.id
        );

        if (userIngredients.length === 0) continue;

        const notification = {
          title: '유통기한 임박 알림',
          body: `${userIngredients.length}개의 재료가 곧 유통기한이 만료됩니다`
        };

        const data = {
          type: 'EXPIRY_ALERT',
          ingredients: userIngredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            expiryDate: ingredient.expiryDate,
            storageLocation: ingredient.storageLocation
          }))
        };

        // 알림 전송
        const tokens = fcmTokens.map(token => token.token);
        await sendMulticastNotification(tokens, notification, data);

        // 알림 히스토리 저장
        await NotificationHistory.create({
          userId: user.id,
          notificationType: 'EXPIRY_ALERT',
          title: notification.title,
          body: notification.body,
          data
        });
      }
    } catch (error) {
      console.error('유통기한 알림 전송 실패:', error);
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
          where: { isEnabled: true }
        }
      ]
    });
  }

  // 테스트 알림 전송
  async sendTestNotification(userId) {
    try {
      const fcmToken = await FCMToken.findOne({
        where: { 
          userId,
          isActive: true
        }
      });

      if (!fcmToken) {
        throw new Error('활성화된 FCM 토큰이 없습니다.');
      }

      const notification = {
        title: '테스트 알림',
        body: '알림 설정이 정상적으로 작동합니다.'
      };

      await sendNotification(fcmToken.token, notification);

      await NotificationHistory.create({
        userId,
        notificationType: 'TEST',
        title: notification.title,
        body: notification.body
      });

      return true;
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 
const schedule = require('node-schedule');
const NotificationService = require('./NotificationService');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
  }

  // 스케줄러 시작
  start() {
    console.log('알림 스케줄러가 시작되었습니다.');
    this.scheduleAllNotifications();
  }

  // 모든 사용자의 알림 스케줄링
  async scheduleAllNotifications() {
    try {
      const users = await NotificationService.getUsersWithNotificationSettings();
      for (const user of users) {
        this.scheduleUserNotification(user);
      }
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
    }
  }

  // 특정 사용자의 알림 스케줄링
  scheduleUserNotification(user) {
    const { id, notifyTime, notifyDays } = user.NotificationSetting;
    const [hours, minutes] = notifyTime.split(':').map(Number);

    // 기존 스케줄 취소
    if (this.jobs.has(id)) {
      this.jobs.get(id).cancel();
    }

    // 새로운 스케줄 생성
    const job = schedule.scheduleJob(
      { hour: hours, minute: minutes, daysOfWeek: notifyDays },
      async () => {
        try {
          await NotificationService.sendExpiryNotifications(user.id);
        } catch (error) {
          console.error(`사용자 ${user.id}의 알림 전송 실패:`, error);
        }
      }
    );

    this.jobs.set(id, job);
    console.log(`사용자 ${user.id}의 알림이 스케줄링되었습니다. (${notifyTime})`);
  }

  // 스케줄러 중지
  stop() {
    for (const [userId, job] of this.jobs) {
      job.cancel();
      console.log(`사용자 ${userId}의 알림 스케줄이 중지되었습니다.`);
    }
    this.jobs.clear();
  }
}

module.exports = new NotificationScheduler(); 
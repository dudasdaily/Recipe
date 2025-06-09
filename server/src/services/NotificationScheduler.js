const cron = require('node-cron');
const NotificationService = require('./NotificationService');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
  }

  // 스케줄러 시작
  start() {
    // 매일 자정에 실행되는 작업
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.checkAndScheduleNotifications();
      } catch (error) {
        console.error('Error in daily notification check:', error);
      }
    });
  }

  async checkAndScheduleNotifications() {
    try {
      const settings = await NotificationService.getNotificationSettings();
      
      for (const setting of settings) {
        if (!setting.isEnabled) continue;

        const [hours, minutes] = setting.notifyTime.split(':');
        const cronExpression = `${minutes} ${hours} * * ${this.getCronDays(setting.notifyDays)}`;
        
        // 기존 작업이 있다면 제거
        if (this.jobs.has(setting.userId)) {
          this.jobs.get(setting.userId).stop();
        }

        // 새로운 작업 스케줄링
        const job = cron.schedule(cronExpression, async () => {
          try {
            await NotificationService.sendExpiryNotifications(setting.userId);
          } catch (error) {
            console.error(`Error sending notifications for user ${setting.userId}:`, error);
          }
        });

        this.jobs.set(setting.userId, job);
      }
    } catch (error) {
      console.error('Error checking notification schedules:', error);
      throw error;
    }
  }

  getCronDays(days) {
    const dayMap = {
      'MON': 1,
      'TUE': 2,
      'WED': 3,
      'THU': 4,
      'FRI': 5,
      'SAT': 6,
      'SUN': 0
    };
    return days.map(day => dayMap[day]).join(',');
  }

  // 스케줄러 중지
  stop() {
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
  }
}

module.exports = new NotificationScheduler(); 
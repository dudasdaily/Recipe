import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '@/stores/notification';
import { useLocalExpiryNotification } from '@/hooks/useLocalExpiryNotification';
import { useIngredientsCache } from '@/hooks/useIngredientsCache';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const DAYS_OF_WEEK = [
  { key: 0, label: '일', short: 'SUN' },
  { key: 1, label: '월', short: 'MON' },
  { key: 2, label: '화', short: 'TUE' },
  { key: 3, label: '수', short: 'WED' },
  { key: 4, label: '목', short: 'THU' },
  { key: 5, label: '금', short: 'FRI' },
  { key: 6, label: '토', short: 'SAT' },
];

// 개발 모드 알림 안내 컴포넌트 추가 (기존 코드 상단에)
const LocalNotificationNotice = () => {
  return (
    <View style={styles.developmentNotice}>
      <Text style={styles.developmentTitle}>📱 로컬 알림</Text>
      <Text style={styles.developmentText}>
        • 서버 연결 없이 로컬에서만 알림이 작동합니다{'\n'}
        • 설정한 시간과 요일에 정확히 알림이 발송됩니다{'\n'}
        • 오프라인에서도 정상 작동합니다 🔗{'\n'}
        • 앱이 백그라운드/포그라운드 모두에서 알림 표시{'\n'}
        • 복잡한 푸시 알림 설정이 필요 없습니다
      </Text>
    </View>
  );
};

export default function SettingsScreen() {
  const {
    enabled,
    notificationTime,
    notificationDays,
    enableNotifications,
    disableNotifications,
    setNotificationTime,
    setNotificationDays,
  } = useNotificationStore();


  const { sendTestExpiryNotification, scheduleExpiryNotifications, clearScheduledNotifications, checkScheduledNotifications } = useLocalExpiryNotification();
  const { getCachedIngredients, clearCache } = useIngredientsCache();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { logError } = useErrorHandler();
  const insets = useSafeAreaInsets();

  // 로컬 저장소에서 자동으로 설정을 불러옵니다 (Zustand persist)

  // 알림 설정 변경 (로컬 저장소에 자동 저장)
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      enableNotifications();
    } else {
      disableNotifications();
    }
  };

  // 알림 시간 변경
  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      console.log('알림 시간 변경:', {
        selectedTime: selectedTime.toISOString(),
        timeString,
        currentNotificationTime: notificationTime,
      });
      
      setNotificationTime(timeString);
      
      console.log('알림 시간 저장 완료:', timeString);
    }
  };

  // 요일 선택/해제
  const toggleDay = async (dayKey: number) => {
    const newDays = notificationDays.includes(dayKey)
      ? notificationDays.filter(day => day !== dayKey)
      : [...notificationDays, dayKey].sort();
    
    setNotificationDays(newDays);
  };

  // 현재 시간을 Date 객체로 변환
  const getCurrentTimeDate = () => {
    const [hours, minutes] = notificationTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const testError = () => {
    try {
      // 의도적으로 에러 발생
      throw new Error('테스트용 에러입니다. 이는 정상적인 테스트입니다.');
    } catch (error) {
      logError(error as Error, 'test');
      Alert.alert('테스트 완료', '에러 로그가 서버에 전송되었습니다.');
    }
  };

  const testAsyncError = async () => {
    try {
      // 비동기 에러 발생
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('비동기 테스트 에러입니다.'));
        }, 1000);
      });
    } catch (error) {
      logError(error as Error, 'async-test');
      Alert.alert('비동기 테스트 완료', '에러 로그가 서버에 전송되었습니다.');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
    >
      <LocalNotificationNotice />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>유통기한 알림 설정</Text>
        
        {/* 알림 활성화/비활성화 */}
        <View style={styles.row}>
          <Text style={styles.label}>유통기한 알림</Text>
          <Switch
            value={enabled}
            onValueChange={handleNotificationToggle}
            disabled={false}
          />
        </View>

        {/* 알림 시간 설정 */}
        <View style={styles.row}>
          <Text style={styles.label}>알림 시간</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            disabled={!enabled}
          >
            <Text style={[styles.timeText, !enabled && styles.disabledText]}>
              {notificationTime}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 요일 선택 */}
        <View style={styles.daysContainer}>
          <Text style={styles.label}>알림 요일</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  notificationDays.includes(day.key) && styles.dayButtonSelected,
                  !enabled && styles.disabledButton,
                ]}
                onPress={() => toggleDay(day.key)}
                disabled={!enabled}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    notificationDays.includes(day.key) && styles.dayButtonTextSelected,
                    !enabled && styles.disabledText,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 알림 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>알림 정보</Text>
          <Text style={styles.infoText}>
            • 설정한 시간에 유통기한이 3일 이하로 남은 식재료가 있는지 확인합니다
          </Text>
          <Text style={styles.infoText}>
            • 유통기한이 임박한 식재료가 있을 때만 알림을 발송합니다
          </Text>
          <Text style={styles.infoText}>
            • 같은 날에는 한 번만 알림을 발송합니다
          </Text>
          <Text style={styles.infoText}>
            • 알림이 활성화되어 있어야 자동으로 발송됩니다
          </Text>
        </View>

        {/* 현재 시간으로 테스트 */}
        <View style={styles.testContainer}>
          <Text style={styles.testTitle}>테스트</Text>
          <TouchableOpacity
            style={[styles.testButton, !enabled && styles.disabledButton]}
            onPress={async () => {
              const now = new Date();
              // 1분 후 시간으로 설정
              const oneMinuteLater = new Date(now.getTime() + 60000);
              const timeString = oneMinuteLater.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              
              console.log('현재 시간으로 테스트 (1분 후):', {
                currentTime: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
                testTime: timeString,
                oneMinuteLater: oneMinuteLater.toISOString(),
                currentDay: now.getDay(),
              });
              
              setNotificationTime(timeString);
              
              // 현재 요일이 포함되어 있지 않으면 추가
              const currentDay = now.getDay();
              if (!notificationDays.includes(currentDay)) {
                const newDays = [...notificationDays, currentDay].sort();
                setNotificationDays(newDays);
                console.log('현재 요일 추가됨:', { currentDay, newDays });
              }
              
              Alert.alert(
                '테스트 설정 완료', 
                `알림 시간을 ${timeString}로 설정했습니다.\n1분 후에 유통기한 알림이 발송됩니다.`
              );
            }}
            disabled={!enabled}
          >
            <Text style={[styles.testButtonText, !enabled && styles.disabledText]}>
              현재 시간으로 테스트 (1분 후)
            </Text>
          </TouchableOpacity>



          <TouchableOpacity
            style={[styles.testButton, styles.localTestButton]}
            onPress={async () => {
              try {
                console.log('🧪 즉시 로컬 알림 테스트 버튼 클릭됨');
                
                const success = await sendTestExpiryNotification();
                
                if (success) {
                  console.log('✅ 즉시 로컬 알림 테스트 성공');
                  Alert.alert('성공', '로컬 유통기한 알림을 발송했습니다!\n(서버 연결 없이도 작동)');
                } else {
                  Alert.alert('실패', '로컬 알림 발송에 실패했습니다.');
                }
              } catch (error: any) {
                console.error('❌ 즉시 로컬 알림 테스트 실패:', error);
                Alert.alert('오류', '로컬 알림 발송에 실패했습니다: ' + error.message);
              }
            }}
          >
            <Text style={styles.testButtonText}>
              즉시 알림 테스트 📱
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.scheduleTestButton, !enabled && styles.disabledButton]}
            onPress={async () => {
              try {
                console.log('🔄 로컬 알림 스케줄링 테스트 시작');
                
                await scheduleExpiryNotifications();
                
                Alert.alert(
                  '스케줄링 완료', 
                  `로컬 알림이 스케줄되었습니다!\n\n• 알림 시간: ${notificationTime}\n• 알림 요일: ${notificationDays.length}일\n• 오프라인에서도 작동합니다`
                );
              } catch (error: any) {
                console.error('❌ 로컬 알림 스케줄링 실패:', error);
                Alert.alert('오류', '로컬 알림 스케줄링에 실패했습니다: ' + error.message);
              }
            }}
            disabled={!enabled}
          >
            <Text style={[styles.testButtonText, !enabled && styles.disabledText]}>
              알림 스케줄링 ⏰
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개발자 도구</Text>
          
          <TouchableOpacity style={styles.button} onPress={testError}>
            <Text style={styles.buttonText}>동기 에러 테스트</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testAsyncError}>
            <Text style={styles.buttonText}>비동기 에러 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={async () => {
              try {
                const cachedIngredients = await getCachedIngredients();
                if (cachedIngredients) {
                  Alert.alert(
                    '캐시 확인', 
                    `캐시된 재료: ${cachedIngredients.length}개\n\n캐시를 사용하여 오프라인에서도 알림이 작동합니다.`
                  );
                } else {
                  Alert.alert('캐시 없음', '캐시된 재료 데이터가 없습니다.');
                }
              } catch (error: any) {
                Alert.alert('오류', '캐시 확인 실패: ' + error.message);
              }
            }}
          >
            <Text style={styles.buttonText}>재료 캐시 확인 📦</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={async () => {
              try {
                const notifications = await checkScheduledNotifications();
                const message = notifications.length > 0 
                  ? `현재 ${notifications.length}개의 알림이 스케줄되어 있습니다.\n\n로그를 확인하여 자세한 정보를 보세요.`
                  : '현재 스케줄된 알림이 없습니다.';
                Alert.alert('스케줄된 알림 확인', message);
              } catch (error: any) {
                Alert.alert('오류', '알림 확인 실패: ' + error.message);
              }
            }}
          >
            <Text style={styles.buttonText}>스케줄된 알림 확인 📋</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={async () => {
              try {
                const { apiClient } = await import('../../services/api/client');
                const response = await apiClient.get('/notification-log');
                
                if (response.logs && response.logs.length > 0) {
                  const recentLogs = response.logs.slice(0, 5);
                  const logSummary = recentLogs.map((log: any, index: number) => 
                    `${index + 1}. ${log.type} - ${log.title}\n   도착시간: ${new Date(log.actualTime).toLocaleString('ko-KR')}\n   시간차이: ${log.timeDifference?.formatted || 'N/A'}`
                  ).join('\n\n');
                  
                  Alert.alert(
                    '최근 알림 로그', 
                    `서버에서 확인된 최근 ${recentLogs.length}개 알림:\n\n${logSummary}\n\n총 ${response.total}개의 로그가 있습니다.`
                  );
                } else {
                  Alert.alert('알림 로그', '서버에 저장된 알림 로그가 없습니다.');
                }
              } catch (error: any) {
                console.error('❌ 알림 로그 조회 실패:', error);
                Alert.alert('오류', '알림 로그 조회에 실패했습니다: ' + error.message);
              }
            }}
          >
            <Text style={styles.buttonText}>서버 알림 로그 조회 📝</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={async () => {
              try {
                await clearScheduledNotifications();
                Alert.alert('완료', '모든 로컬 알림 스케줄이 정리되었습니다.');
              } catch (error: any) {
                Alert.alert('오류', '알림 정리 실패: ' + error.message);
              }
            }}
          >
            <Text style={styles.buttonText}>알림 정리 🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 시간 선택기 */}
      {showTimePicker && (
        <DateTimePicker
          value={getCurrentTimeDate()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  daysContainer: {
    marginTop: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  disabledText: {
    color: '#999',
  },
  disabledButton: {
    opacity: 0.5,
  },
  testContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  immediateTestButton: {
    backgroundColor: '#FF3B30',
    marginTop: 12,
  },
  localTestButton: {
    backgroundColor: '#34C759',
    marginTop: 12,
  },
  scheduleTestButton: {
    backgroundColor: '#FF9500',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  developmentNotice: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  developmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  developmentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 
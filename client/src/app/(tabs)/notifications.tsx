import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Platform,
  Alert 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalNotificationStore } from '@/stores/localNotification';
import { useLocalNotificationService } from '@/hooks/useLocalNotificationService';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const {
    enabled,
    time,
    daysThreshold,
    setEnabled,
    setTime,
    setDaysThreshold,
  } = useLocalNotificationStore();

  const {
    sendTestNotification,
    requestPermissions,
  } = useLocalNotificationService();

  // 알림 활성화/비활성화
  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          '알림 권한 필요',
          '알림 기능을 사용하려면 알림 권한이 필요합니다. 설정에서 권한을 허용해 주세요.',
          [{ text: '확인' }]
        );
        return;
      }
    }
    setEnabled(value);
  };

  // 시간 변경
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5); // HH:mm 형식
      setTime(timeString);
    }
  };

  // 유통기한 임박 기준 변경
  const handleDaysThresholdChange = (days: number) => {
    if (days >= 1 && days <= 30) {
      setDaysThreshold(days);
    }
  };

  // 테스트 알림 발송
  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert('알림 테스트', '테스트 알림이 발송되었습니다!');
  };



  // 현재 시간을 Date 객체로 변환
  const getCurrentTimeDate = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 24시간 형식을 12시간 형식(AM/PM)으로 변환
  const formatTimeToAmPm = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours < 12 ? '오전' : '오후';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${period} ${displayHour}:${displayMinutes}`;
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>로컬 알림 설정</Text>
        
        {/* 알림 활성화/비활성화 */}
        <View style={styles.row}>
          <Text style={styles.label}>유통기한 알림</Text>
          <Switch
            value={enabled}
            onValueChange={handleToggleEnabled}
          />
        </View>

        {/* 알림 시간 설정 */}
        <View style={styles.timeSettingContainer}>
          <Text style={styles.label}>알림 시간</Text>
          <TouchableOpacity
            style={[styles.timeButton, !enabled && styles.disabledButton]}
            onPress={() => setShowTimePicker(true)}
            disabled={!enabled}
          >
            <Text style={[styles.timeButtonText, !enabled && styles.disabledText]}>
              {formatTimeToAmPm(time)}
            </Text>
            <Text style={[styles.timeButtonSubtext, !enabled && styles.disabledText]}>
              탭하여 변경
            </Text>
          </TouchableOpacity>
        </View>

        {/* 유통기한 임박 기준 설정 */}
        <View style={styles.thresholdContainer}>
          <Text style={styles.label}>유통기한 임박 기준</Text>
          <Text style={styles.sublabel}>유통기한이 며칠 남았을 때 알림을 받을지 설정하세요</Text>
          
          <View style={styles.thresholdControls}>
            <TouchableOpacity
              style={[styles.thresholdButton, !enabled && styles.disabledButton]}
              onPress={() => handleDaysThresholdChange(daysThreshold - 1)}
              disabled={!enabled || daysThreshold <= 1}
            >
              <Ionicons name="remove" size={20} color={!enabled || daysThreshold <= 1 ? '#999' : '#666'} />
            </TouchableOpacity>
            
            <View style={styles.thresholdDisplay}>
              <Text style={[styles.thresholdText, !enabled && styles.disabledText]}>
                {daysThreshold}일
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.thresholdButton, !enabled && styles.disabledButton]}
              onPress={() => handleDaysThresholdChange(daysThreshold + 1)}
              disabled={!enabled || daysThreshold >= 30}
            >
              <Ionicons name="add" size={20} color={!enabled || daysThreshold >= 30 ? '#999' : '#666'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 테스트 버튼 */}
        <TouchableOpacity
          style={[styles.testButton, !enabled && styles.disabledButton]}
          onPress={handleTestNotification}
          disabled={!enabled}
        >
          <Ionicons name="notifications-outline" size={20} color={!enabled ? '#999' : '#007AFF'} />
          <Text style={[styles.testButtonText, !enabled && styles.disabledText]}>
            테스트 알림 보내기
          </Text>
        </TouchableOpacity>

        {/* 알림 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>알림 정보</Text>
          <Text style={styles.infoText}>
            • 설정한 시간에 매일 유통기한을 확인합니다
          </Text>
          <Text style={styles.infoText}>
            • 유통기한이 임박하거나 지난 재료가 있을 때만 알림을 발송합니다
          </Text>
          <Text style={styles.infoText}>
            • 유통기한이 설정되지 않은 재료는 알림에서 제외됩니다
          </Text>
          <Text style={styles.infoText}>
            • 오프라인에서도 작동하는 로컬 알림입니다
          </Text>
        </View>
      </View>

      {/* 시간 선택기 Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>알림 시간 설정</Text>
            </View>
            
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={getCurrentTimeDate()}
                mode="time"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
                themeVariant="light"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  timeSettingContainer: {
    marginBottom: 24,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    marginTop: 8,
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  thresholdContainer: {
    marginBottom: 24,
  },
  thresholdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  thresholdButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thresholdDisplay: {
    minWidth: 80,
    alignItems: 'center',
  },
  thresholdText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
    marginBottom: 24,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  disabledText: {
    color: '#999',
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 120,
    backgroundColor: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 
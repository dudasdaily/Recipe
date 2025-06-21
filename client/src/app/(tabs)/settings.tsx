import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '@/stores/notification';

const DAYS_OF_WEEK = [
  { key: 0, label: '일', short: 'SUN' },
  { key: 1, label: '월', short: 'MON' },
  { key: 2, label: '화', short: 'TUE' },
  { key: 3, label: '수', short: 'WED' },
  { key: 4, label: '목', short: 'THU' },
  { key: 5, label: '금', short: 'FRI' },
  { key: 6, label: '토', short: 'SAT' },
];

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

  const [showTimePicker, setShowTimePicker] = useState(false);
  const insets = useSafeAreaInsets();

  // 알림 설정 변경
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      enableNotifications();
    } else {
      disableNotifications();
    }
  };

  // 알림 시간 변경
  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      setNotificationTime(timeString);
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

  // 24시간 형식을 12시간 형식(AM/PM)으로 변환
  const formatTimeToAmPm = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // 한국어 오전/오후 표시
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
        <View style={styles.timeSettingContainer}>
          <Text style={styles.label}>알림 시간</Text>
          <TouchableOpacity
            style={[styles.timeButton, !enabled && styles.disabledButton]}
            onPress={() => setShowTimePicker(true)}
            disabled={!enabled}
          >
            <Text style={[styles.timeButtonText, !enabled && styles.disabledText]}>
              {formatTimeToAmPm(notificationTime)}
            </Text>
            <Text style={[styles.timeButtonSubtext, !enabled && styles.disabledText]}>
              탭하여 변경
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
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={getCurrentTimeDate()}
                  mode="time"
                  display="compact"
                  onChange={handleTimeChange}
                  style={styles.timePicker}
                  themeVariant="light"
                />
              ) : (
                <DateTimePicker
                  value={getCurrentTimeDate()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                  style={styles.timePicker}
                />
              )}
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
  timeSettingContainer: {
    marginTop: 16,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeButtonSubtext: {
    fontSize: 12,
    color: '#666',
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
    borderRadius: 10,
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
    fontSize: 20,
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
    borderRadius: 8,
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
    paddingHorizontal: 20,
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
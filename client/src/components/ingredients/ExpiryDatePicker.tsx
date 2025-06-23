import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isValidDateString(str: string) {
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

type Props = {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  style?: any;
};

export function ExpiryDatePicker({ value, onChange, placeholder = '유통기한 선택', style }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);
  
  // 모달용 임시 상태
  const [tempDate, setTempDate] = useState(new Date());
  const [tempHasExpiry, setTempHasExpiry] = useState(true);

  // 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDateValue = (dateString: string) => {
    if (!dateString) return '';
    try {
      // ISO 문자열이면 날짜 부분만 추출
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // value가 바뀔 때만 input을 동기화
  useEffect(() => {
    const formattedValue = formatDateValue(value || '');
    setInput(formattedValue);
  }, [value]);

  const handleInputChange = (text: string) => {
    let formatted = text;
    // 8자리 숫자면 YYYY-MM-DD로 변환
    if (/^\d{8}$/.test(text)) {
      formatted = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
    }
    setInput(formatted);
    setTouched(true);
    if (isValidDateString(formatted)) {
      onChange(formatted);
    }
  };

  const openDatePicker = () => {
    console.log('📅 DatePicker 열기');
    
    // 현재 값으로 임시 상태 초기화
    const hasExpiry = !!(value && isValidDateString(formatDateValue(value || '')));
    setTempHasExpiry(hasExpiry);
    
    if (hasExpiry && value) {
      setTempDate(new Date(formatDateValue(value)));
    } else {
      // 내일 날짜로 기본 설정
      setTempDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
    
    setShowDatePicker(true);
  };

  const handleConfirm = () => {
    console.log('📅 DatePicker 확인', { tempHasExpiry, tempDate: tempDate.toISOString() });
    
    if (tempHasExpiry) {
      const dateString = formatDate(tempDate);
      setInput(dateString);
      setTouched(false);
      onChange(dateString);
    } else {
      // 유통기한 없음 선택
      setInput('');
      setTouched(false);
      onChange('');
    }
    
    setShowDatePicker(false);
  };

  const handleCancel = () => {
    console.log('📅 DatePicker 취소');
    setShowDatePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 DatePicker 날짜 변경:', { 
      eventType: event?.type, 
      selectedDate: selectedDate?.toISOString(),
      platform: Platform.OS 
    });
    
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const showError = touched && input && !isValidDateString(input);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, showError && styles.inputError]}
          value={input}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      {showError && (
        <Text style={styles.errorText}>올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)</Text>
      )}

      {/* 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>유통기한 설정</Text>
              <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
            
            {/* 유통기한 없음 옵션 */}
            <View style={styles.noExpirySection}>
              <TouchableOpacity 
                style={styles.noExpiryOption}
                onPress={() => setTempHasExpiry(!tempHasExpiry)}
                activeOpacity={0.7}
              >
                <View style={styles.noExpiryContent}>
                  <Text style={styles.noExpiryText}>유통기한 없음</Text>
                  <View style={[styles.checkbox, tempHasExpiry ? styles.checkboxUnchecked : styles.checkboxChecked]}>
                    {!tempHasExpiry && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* 날짜 선택기 */}
            <View style={[styles.datePickerSection, !tempHasExpiry && styles.datePickerDisabled]}>
              <Text style={[styles.sectionTitle, !tempHasExpiry && styles.sectionTitleDisabled]}>
                날짜 선택
              </Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={[styles.datePicker, !tempHasExpiry && styles.datePickerInactive]}
                textColor={tempHasExpiry ? "#000" : "#999"}
                disabled={!tempHasExpiry}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  iconButton: {
    padding: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
    maxHeight: '70%',
    minHeight: 400, // 최소 높이 확보
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 56, // 고정 높이로 일관성 유지
  },
  headerButton: {
    minWidth: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1, // 중앙 정렬을 위해 flex 추가
  },
  
  // 유통기한 없음 섹션
  noExpirySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noExpiryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  noExpiryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44, // 터치 영역 확보
  },
  noExpiryText: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  
  // 날짜 선택기 섹션
  datePickerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center', // 중앙 정렬
  },
  datePickerDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center', // 제목도 중앙 정렬
    width: '100%',
  },
  sectionTitleDisabled: {
    color: '#999',
  },
  datePicker: {
    height: Platform.OS === 'ios' ? 200 : 120,
    width: '100%', // 전체 너비 사용
    alignSelf: 'center', // 자체 중앙 정렬
  },
  datePickerInactive: {
    opacity: 0.3,
  },
}); 
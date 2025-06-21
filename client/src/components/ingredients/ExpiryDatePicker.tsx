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
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    
    // 유효한 날짜라면 selectedDate도 업데이트
    if (isValidDateString(formattedValue)) {
      setSelectedDate(new Date(formattedValue));
    } else if (!formattedValue) {
      // 값이 없으면 내일 날짜로 기본 설정
      setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
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

  const handleDatePickerChange = (event: any, date?: Date) => {
    // iOS와 Android 모두에서 모달 닫기
    setShowDatePicker(false);
    
    if (date) {
      const dateString = formatDate(date);
      setSelectedDate(date);
      setInput(dateString);
      setTouched(false);
      onChange(dateString);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const showError = touched && input && !isValidDateString(input);

  // iOS 스타일 모달 컴포넌트
  const IOSDatePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDatePicker}
      onRequestClose={closeDatePicker}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
            style={styles.iosDatePicker}
            minimumDate={new Date()}
            textColor="#000"
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.row, style]}>
      <TextInput
        style={[styles.input, showError && styles.inputError]}
        placeholder={placeholder}
        value={input}
        onChangeText={handleInputChange}
        onBlur={() => setTouched(true)}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={openDatePicker}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
      
      {Platform.OS === 'ios' ? (
        <IOSDatePickerModal />
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
            minimumDate={new Date()}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  // iOS 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area 고려
  },
  iosDatePicker: {
    height: 200,
    marginTop: 10,
  },
}); 
import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);

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
    setInput(formatDateValue(value || ''));
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

  const handleConfirm = (date: Date) => {
    setVisible(false);
    const str = formatDate(date);
    setInput(str);
    setTouched(false);
    onChange(str);
  };

  const showError = touched && input && !isValidDateString(input);

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
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={visible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
        display="default"
      />
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
}); 
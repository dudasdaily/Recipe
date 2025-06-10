import { useRef, useState } from 'react';
import type { IngredientCardProps } from './types';
import { Title, InfoText } from './styles';
import { View, TouchableOpacity, PanResponder, GestureResponderEvent, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const IngredientCard = ({
  ingredient,
  compact,
  selectionMode,
  selected,
  onSelect,
  onLongPress,
  onEdit,
}: Pick<IngredientCardProps, 'ingredient' | 'compact' | 'selectionMode' | 'selected' | 'onSelect' | 'onLongPress' | 'onEdit'>) => {
  const storageTypeLabel = {
    ROOM_TEMP: '실온',
    REFRIGERATED: '냉장',
    FROZEN: '냉동',
  }[ingredient.storage_type];

  // 시각적 피드백(pressIn/pressOut + scale + 배경색)
  const [pressed, setPressed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const isSelected = !!selected;

  // Container 스타일 직접 적용
  const containerStyle = {
    backgroundColor: isSelected && selectionMode ? '#e6f0ff' : '#fff',
    borderRadius: 8,
    padding: compact ? 8 : 16,
    margin: compact ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row-reverse' as const,
    alignItems: 'center' as const,
  };

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale }] }]}> 
      {selectionMode && (
        <View style={{
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          backgroundColor: isSelected ? '#007AFF' : '#fff',
          borderWidth: isSelected ? 0 : 1.5,
          borderColor: isSelected ? 'transparent' : '#bbb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.10,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <TouchableOpacity
            onPress={() => onSelect && onSelect(ingredient.id)}
            hitSlop={8}
            activeOpacity={0.7}
            style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={20}
                color={'#fff'}
              />
            )}
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.95}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={selectionMode ? (() => onSelect && onSelect(ingredient.id)) : undefined}
          onLongPress={onLongPress}
        >
          <Title compact={compact}>{ingredient.name}</Title>
          <InfoText compact={compact}>수량: {ingredient.quantity}</InfoText>
          <InfoText compact={compact}>보관 방법: {storageTypeLabel}</InfoText>
          <InfoText compact={compact}>유통기한: {new Date(ingredient.expiry_date).toLocaleDateString()}</InfoText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

IngredientCard.displayName = 'IngredientCard'; 
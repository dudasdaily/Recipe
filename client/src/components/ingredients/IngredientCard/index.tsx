import { memo, useRef, useState } from 'react';
import type { IngredientCardProps } from './types';
import { Title, InfoText } from './styles';
import { View, TouchableOpacity, PanResponder, GestureResponderEvent, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const IngredientCard = memo(({
  ingredient,
  compact,
  selected,
  onSelect,
  onEdit,
  selectionMode,
  onLongPress,
  onPress,
  onDragSelect
}: IngredientCardProps) => {
  const storageTypeLabel = {
    ROOM_TEMP: '실온',
    REFRIGERATED: '냉장',
    FROZEN: '냉동',
  }[ingredient.storage_type];

  // PanResponder로 드래그 다중 선택 구현
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!selectionMode,
      onPanResponderGrant: () => {
        if (selectionMode && onDragSelect) onDragSelect(ingredient.id);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState) => {
        if (selectionMode && onDragSelect) onDragSelect(ingredient.id);
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

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

  // Container 스타일 직접 적용
  const containerStyle = {
    backgroundColor: pressed ? '#e6f0ff' : '#fff',
    borderRadius: 8,
    padding: compact ? 8 : 16,
    margin: compact ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => {
        if (selectionMode) {
          onPress && onPress();
        } else {
          onEdit && onEdit(ingredient);
        }
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress && onLongPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...(selectionMode ? panResponder.panHandlers : {})}
    >
      <Animated.View style={[containerStyle, { transform: [{ scale }] }]}> 
        {/* 선택 모드일 때만 체크박스 */}
        {selectionMode && (
          <View style={{ marginRight: 12 }}>
            <Ionicons
              name={selected ? 'checkbox' : 'ellipse-outline'}
              size={22}
              color={selected ? '#007AFF' : '#bbb'}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Title compact={compact}>{ingredient.name}</Title>
          <InfoText compact={compact}>수량: {ingredient.quantity}</InfoText>
          <InfoText compact={compact}>보관 방법: {storageTypeLabel}</InfoText>
          <InfoText compact={compact}>유통기한: {new Date(ingredient.expiry_date).toLocaleDateString()}</InfoText>
        </View>
        {/* 수정 버튼은 selectionMode 아닐 때만 */}
        {!selectionMode && onEdit && (
          <TouchableOpacity onPress={() => onEdit(ingredient)} style={{ marginLeft: 12 }} hitSlop={8}>
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

IngredientCard.displayName = 'IngredientCard'; 
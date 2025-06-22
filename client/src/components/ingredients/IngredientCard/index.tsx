import { useRef, useState } from 'react';
import type { IngredientCardProps } from './types';
import { Title, InfoText } from './styles';
import { View, TouchableOpacity, PanResponder, GestureResponderEvent, Animated, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// D-day 계산 함수 추가
function getDDay(expiryDate: string) {
  if (!expiryDate) return '';
  const today = new Date();
  today.setHours(0,0,0,0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);
  const diff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (isNaN(diff)) return '';
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-day';
  return `D+${Math.abs(diff)}`;
}

export const IngredientCard = ({
  ingredient,
  compact,
  selectionMode,
  selected,
  onSelect,
  onLongPress,
  onEdit,
  onDelete,
  hideImage,
  minimalView,
}: Pick<IngredientCardProps, 'ingredient' | 'compact' | 'selectionMode' | 'selected' | 'onSelect' | 'onLongPress' | 'onEdit' | 'onDelete' | 'hideImage' | 'minimalView'>) => {
  const storageTypeLabel = {
    ROOM_TEMP: '실온',
    REFRIGERATED: '냉장',
    FROZEN: '냉동',
  }[ingredient.storage_type];

  // 시각적 피드백(pressIn/pressOut + scale + 배경색)
  const [pressed, setPressed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  
  // 스와이프 기능을 위한 상태와 애니메이션
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const [isSwipeDeleteVisible, setIsSwipeDeleteVisible] = useState(false);
  const SWIPE_THRESHOLD = 80; // 스와이프 임계값

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  // 스와이프 제스처 핸들러
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 가로 스와이프일 때만 반응하고, 선택 모드가 아닐 때만 작동
      return !selectionMode && !minimalView && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
    },
    onPanResponderGrant: () => {
      // 간단하게 현재 애니메이션 값으로 시작
      translateX.stopAnimation();
      deleteOpacity.stopAnimation();
    },
    onPanResponderMove: (evt, gestureState) => {
      // 오른쪽에서 왼쪽 스와이프만 허용 (음수 방향), 최대 -100까지만
      const newValue = Math.max(-100, Math.min(0, gestureState.dx));
      translateX.setValue(newValue);
      
      // 스와이프 거리에 따라 삭제 버튼 투명도 조절 (0 ~ 1)
      const swipeDistance = Math.abs(newValue);
      const opacity = Math.min(1, swipeDistance / SWIPE_THRESHOLD);
      deleteOpacity.setValue(opacity);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -SWIPE_THRESHOLD) {
        // 임계값을 넘으면 삭제 버튼 고정 표시
        setIsSwipeDeleteVisible(true);
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -80,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        // 임계값을 넘지 않으면 원래 위치로 복원
        setIsSwipeDeleteVisible(false);
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    },
  });

  // 스와이프 삭제 핸들러
  const handleSwipeDelete = () => {
    if (onDelete) {
      onDelete(ingredient.id);
    }
    // 삭제 후 원래 위치로 복원
    setIsSwipeDeleteVisible(false);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  // 스와이프 취소 (다른 곳 터치 시)
  const resetSwipe = () => {
    if (isSwipeDeleteVisible) {
      setIsSwipeDeleteVisible(false);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(deleteOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const isSelected = !!selected;

  // Container 스타일 직접 적용
  const containerStyle = minimalView
    ? {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        margin: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      }
    : {
        backgroundColor: isSelected && selectionMode ? '#e6f0ff' : '#fff',
        borderRadius: 8,
        padding: compact ? 8 : 16,
        margin: compact ? 4 : 8,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      };

  const expiryLabel = !ingredient.expiry_date
    ? '없음'
    : isNaN(new Date(ingredient.expiry_date).getTime())
      ? '없음'
      : new Date(ingredient.expiry_date).toLocaleDateString();

  // 이미지 URL이 있으면 사용, 없으면 placeholder
  const imageUrl = ingredient.imageUrl
    ? { uri: ingredient.imageUrl }
    : require('../../../../assets/images/paprika.png');

  if (minimalView) {
    // 유통기한 D-day에 따라 배경색 결정
    let bgColor = '#fff';
    if (ingredient.expiry_date) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const expiry = new Date(ingredient.expiry_date);
      expiry.setHours(0,0,0,0);
      const diff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if(diff < 0) bgColor = '#ff5b5b';
      else if (diff === 0 || diff === 1) bgColor = '#ff9d5b'; // 빨간색 #ffd0cc
      else if (diff === 2 || diff === 3) bgColor = '#ffce5b'; // 노란색
      else if (diff >= 4 && diff <= 7) bgColor = '#ffce5b'; // 연두색
    }
    return (
      <Animated.View style={[containerStyle, { backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', height: '100%', borderRadius: 12, transform: [{ scale }] }]}> 
        {/* 이름만 표시 (사진, D-day 등 기타 정보는 표시하지 않음) */}
        <Text style={{ fontWeight: 'bold', fontSize: 13, color: 'white', textAlign: 'center' }}>{ingredient.name}</Text>
      </Animated.View>
    );
  }

  return (
    <View style={{ 
      position: 'relative', 
      marginHorizontal: compact ? 4 : 8,
      marginVertical: compact ? 4 : 8,
    }}>
      {/* 스와이프 삭제 버튼 (뒤쪽에 고정) */}
      {!selectionMode && !minimalView && (
        <Animated.View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: '#ff3b30',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          zIndex: 1,
          opacity: deleteOpacity,
        }}>
          <TouchableOpacity
            onPress={handleSwipeDelete}
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
            }}
            activeOpacity={0.7}
            disabled={!isSwipeDeleteVisible} // 완전히 나타났을 때만 터치 가능
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
              삭제
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* 메인 카드 컨테이너 */}
      <Animated.View 
        style={[
          {
            ...containerStyle,
            margin: 0, // 외부에서 마진 처리
          },
          { 
            transform: [{ scale }, { translateX }],
            zIndex: 2,
          }
        ]}
        {...(!selectionMode && !minimalView ? panResponder.panHandlers : {})}
      > 
        {/* 사진: 맨 왼쪽 */}
        {!hideImage && (
          <Image
            source={imageUrl}
            style={{ width: 64, height: 64, borderRadius: 32, marginRight: 15, backgroundColor: '#eee' }}
            resizeMode="cover"
          />
        )}
        {/* 텍스트 정보 (이름, 수량, 유통기한만) */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={0.95}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={selectionMode ? (() => onSelect && onSelect(ingredient.id)) : resetSwipe}
            onLongPress={onLongPress}
          >
            <Title compact={compact} style={{ fontSize: compact ? 16 : 16 }}>{ingredient.name}</Title>
            <InfoText compact={compact} style={{ fontSize: compact ? 9.6 : 11.2 }}>수량: {ingredient.quantity}</InfoText>
            <InfoText compact={compact} style={{ fontSize: compact ? 9.6 : 11.2 }}>{expiryLabel}</InfoText>
          </TouchableOpacity>
        </View>
        {/* 선택/편집 버튼 등은 기존대로 오른쪽에 유지, D-day는 연필 아이콘 왼쪽에 별도 표시 */}
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
            marginLeft: 8,
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
        {!selectionMode && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            {/* D-day 강조 표시: 연필 아이콘 왼쪽 */}
            <Text style={{ marginRight: 10, color: 'black', fontWeight: 'light', fontSize: 23}}>
              {getDDay(ingredient.expiry_date)}
            </Text>
            <TouchableOpacity
              onPress={() => onEdit && onEdit(ingredient)}
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: '#f8f9fa',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

IngredientCard.displayName = 'IngredientCard'; 
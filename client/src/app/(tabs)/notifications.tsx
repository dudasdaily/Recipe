import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationHistory } from '@/types/api';
import { useNotificationStore } from '@/stores/notification';

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  const {
    notificationHistory,
    clearNotificationHistory,
    cleanupDuplicateNotifications,
  } = useNotificationStore();

  // 디버깅: 컴포넌트 마운트 시 히스토리 상태 출력
  React.useEffect(() => {
    console.log('📋 알림 히스토리 화면 로드됨:', {
      totalCount: notificationHistory.length,
      history: notificationHistory.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        sentAt: item.sentAt
      }))
    });
    
    // 중복 알림이 있으면 자동으로 정리
    if (notificationHistory.length > 1) {
      const hasDuplicates = notificationHistory.some((item, index) => 
        notificationHistory.slice(0, index).some(other => 
          item.title === other.title && 
          item.body === other.body && 
          item.type === other.type
        )
      );
      
      if (hasDuplicates) {
        console.log('🔄 중복 알림 감지, 자동 정리 시작');
        cleanupDuplicateNotifications();
      }
    }
  }, [notificationHistory, cleanupDuplicateNotifications]);

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 알림 히스토리 새로고침 시작');
    // 로컬 데이터만 사용하므로 즉시 완료
    setTimeout(() => {
      setRefreshing(false);
      console.log('✅ 알림 히스토리 새로고침 완료');
    }, 500);
  };

  // 알림 타입에 따른 아이콘과 색상
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'EXPIRY_ALERT':
        return { icon: '⚠️', color: '#FF6B6B', title: '유통기한 알림' };
      case 'TEST_NOTIFICATION':
        return { icon: '🧪', color: '#4ECDC4', title: '테스트 알림' };
      case 'LOCAL_NOTIFICATION':
        return { icon: '📱', color: '#45B7D1', title: '로컬 알림' };
      default:
        return { icon: '📢', color: '#45B7D1', title: '일반 알림' };
    }
  };

  // 날짜 포맷팅 (정확한 시간 표시)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return '방금 전';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  function getDDay(expiryDate: string) {
    if (!expiryDate) return '';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.floor((expiry.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (isNaN(diff)) return '';
    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return 'D-day';
    return `D+${Math.abs(diff)}`;
  }

  // 알림 아이템 렌더링
  const renderNotificationItem = ({ item }: { item: NotificationHistory }) => {
    const style = getNotificationStyle(item.type);

    return (
      <View style={styles.notificationItem}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>{style.icon}</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatDate(item.sentAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.notificationBody}>
          {item.body}
        </Text>
      </View>
    );
  };

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>알림이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        새로운 알림이 오면 여기에 표시됩니다
      </Text>
    </View>
  );

  // 중복 알림 정리
  const handleCleanupDuplicates = () => {
    console.log('🧹 중복 알림 정리 요청됨, 현재 개수:', notificationHistory.length);
    
    Alert.alert(
      '중복 알림 정리',
      '중복된 알림을 정리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '정리', 
          onPress: () => {
            console.log('🧹 중복 알림 정리 실행');
            cleanupDuplicateNotifications();
            console.log('✅ 중복 알림 정리 완료');
          }
        },
      ]
    );
  };

  // 히스토리 삭제
  const handleClearHistory = () => {
    console.log('🗑️ 알림 히스토리 삭제 요청됨, 현재 개수:', notificationHistory.length);
    
    Alert.alert(
      '알림 히스토리 삭제',
      '모든 알림 히스토리를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            console.log('🗑️ 알림 히스토리 삭제 실행');
            clearNotificationHistory();
            console.log('✅ 알림 히스토리 삭제 완료');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.buttonTouchArea}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButton}>새로고침</Text>
          </TouchableOpacity>
          {notificationHistory.length > 1 && (
            <TouchableOpacity 
              style={styles.buttonTouchArea}
              onPress={handleCleanupDuplicates}
              activeOpacity={0.7}
            >
              <Text style={styles.cleanupButton}>중복정리</Text>
            </TouchableOpacity>
          )}
          {notificationHistory.length > 0 && (
            <TouchableOpacity 
              style={styles.buttonTouchArea}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButton}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notificationHistory}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonTouchArea: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cleanupButton: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 
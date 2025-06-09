import { View, Text, StyleSheet, Switch } from 'react-native';
import { useNotificationStore } from '@/stores/notification';

export default function SettingsScreen() {
  const { enabled, enableNotifications, disableNotifications } = useNotificationStore();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 설정</Text>
        <View style={styles.row}>
          <Text style={styles.label}>유통기한 알림</Text>
          <Switch
            value={enabled}
            onValueChange={(value) =>
              value ? enableNotifications() : disableNotifications()
            }
          />
        </View>
      </View>
    </View>
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
}); 
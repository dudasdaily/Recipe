import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import type { ApiResponse, Ingredient } from '@/types/api';
import { IngredientCard } from '@/components/ingredients/IngredientCard';

export default function HomeScreen() {
  const { data, isLoading } = useQuery<ApiResponse<Ingredient[]>>({
    queryKey: ['ingredients'],
    queryFn: () => apiClient.get('/ingredients'),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={data?.data || []}
        renderItem={({ item }) => (
          <IngredientCard ingredient={item} />
        )}
        estimatedItemSize={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 
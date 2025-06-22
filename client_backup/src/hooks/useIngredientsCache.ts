import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIngredients } from './query/useIngredients';

const CACHED_INGREDIENTS_KEY = 'cached_ingredients';
const CACHE_TIMESTAMP_KEY = 'cached_ingredients_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

/**
 * 재료 데이터를 로컬에 캐싱하여 오프라인에서도 사용 가능하게 하는 훅
 */
export const useIngredientsCache = () => {
  const { data: ingredients, isSuccess } = useIngredients();

  // 재료 데이터가 성공적으로 로드되면 캐시에 저장
  useEffect(() => {
    if (isSuccess && ingredients) {
      const cacheIngredients = async () => {
        try {
          const cacheData = {
            ingredients,
            timestamp: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem(CACHED_INGREDIENTS_KEY, JSON.stringify(ingredients));
          await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
          
          console.log(`📦 ${ingredients.length}개의 재료가 로컬 캐시에 저장되었습니다.`);
        } catch (error) {
          console.error('❌ 재료 캐시 저장 실패:', error);
        }
      };

      cacheIngredients();
    }
  }, [ingredients, isSuccess]);

  // 캐시된 재료 데이터 가져오기
  const getCachedIngredients = async () => {
    try {
      const [cachedData, cachedTimestamp] = await Promise.all([
        AsyncStorage.getItem(CACHED_INGREDIENTS_KEY),
        AsyncStorage.getItem(CACHE_TIMESTAMP_KEY)
      ]);

      if (!cachedData || !cachedTimestamp) {
        console.log('ℹ️ 캐시된 재료 데이터가 없습니다.');
        return null;
      }

      // 캐시 유효성 검사
      const cacheTime = new Date(cachedTimestamp).getTime();
      const now = new Date().getTime();
      
      if (now - cacheTime > CACHE_DURATION) {
        console.log('⚠️ 캐시된 재료 데이터가 오래되었습니다. (24시간 초과)');
        // 오래된 캐시는 삭제하지 않고 경고만 출력 (오프라인에서도 사용할 수 있도록)
      }

      const ingredients = JSON.parse(cachedData);
      console.log(`📦 캐시에서 ${ingredients.length}개의 재료를 불러왔습니다.`);
      return ingredients;
    } catch (error) {
      console.error('❌ 캐시된 재료 데이터 로드 실패:', error);
      return null;
    }
  };

  // 캐시 정리
  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHED_INGREDIENTS_KEY),
        AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY)
      ]);
      console.log('✅ 재료 캐시가 정리되었습니다.');
    } catch (error) {
      console.error('❌ 캐시 정리 실패:', error);
    }
  };

  return {
    getCachedIngredients,
    clearCache,
  };
}; 
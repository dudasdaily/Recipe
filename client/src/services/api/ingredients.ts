import { apiClient } from './client';
import type { Ingredient } from '@/types/api';

// 재료 목록 조회
export const getIngredients = async (): Promise<Ingredient[]> => {
  const res = await apiClient.get('/ingredients');
  return res.data;
};

// 재료 생성
export const createIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> => {
  // 요청 정보 로그
  console.log('[재료 추가 요청] URL: /ingredients, payload:', ingredient);
  const res = await apiClient.post('/ingredients', ingredient);
  return res.data;
};

// 재료 상세 조회
export const getIngredient = async (id: number): Promise<Ingredient> => {
  const res = await apiClient.get(`/ingredients/${id}`);
  return res.data;
};

// 재료 수정
export const updateIngredient = async (id: number, ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> => {
  // 요청 정보 로그
  console.log('[재료 수정 요청] URL:', `/ingredients/${id}`, 'payload:', ingredient);
  const res = await apiClient.put(`/ingredients/${id}`, ingredient);
  console.log('[재료 수정 성공] response:', res.data);
  return res.data;
};

// 재료 삭제
export const deleteIngredient = async (id: number): Promise<void> => {
  await apiClient.delete(`/ingredients/${id}`);
}; 
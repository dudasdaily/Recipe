import { create } from 'zustand';
import type { 
  ReceiptItem, 
  Receipt, 
  OcrReceiptResponse 
} from '@/types/api';

type ReceiptProcessingState = {
  // 영수증 처리 상태
  isProcessing: boolean;
  processedReceipt: Receipt | null;
  recognizedItems: ReceiptItem[];
  
  // 재료 편집 상태
  editableItems: ReceiptItem[];
  selectedItemIds: number[];
  
  // 모드 전환 관련
  isTransitionModalVisible: boolean;
  transitionMessage: string;
  
  // 진행 상태
  currentStep: 'SCAN' | 'REVIEW' | 'EDIT' | 'SAVE';
};

type ReceiptProcessingActions = {
  // 영수증 처리 액션
  setProcessing: (isProcessing: boolean) => void;
  setReceiptResult: (result: OcrReceiptResponse) => void;
  clearReceipt: () => void;
  
  // 재료 편집 액션
  updateEditableItem: (itemId: number, updates: Partial<ReceiptItem>) => void;
  removeEditableItem: (itemId: number) => void;
  addEditableItem: (item: Omit<ReceiptItem, 'id'>) => void;
  
  // 선택 관리
  toggleItemSelection: (itemId: number) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  
  // 모드 전환
  showTransitionModal: (message: string) => void;
  hideTransitionModal: () => void;
  
  // 진행 상태
  setCurrentStep: (step: ReceiptProcessingState['currentStep']) => void;
  
  // 초기화
  resetState: () => void;
};

const initialState: ReceiptProcessingState = {
  isProcessing: false,
  processedReceipt: null,
  recognizedItems: [],
  editableItems: [],
  selectedItemIds: [],
  isTransitionModalVisible: false,
  transitionMessage: '',
  currentStep: 'SCAN',
};

export const useReceiptStore = create<ReceiptProcessingState & ReceiptProcessingActions>((set, get) => ({
  ...initialState,
  
  // 영수증 처리 액션
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  setReceiptResult: (result) => {
    const { receipt, items } = result.data;
    set({
      processedReceipt: receipt,
      recognizedItems: items,
      editableItems: items.map(item => ({ ...item })), // 깊은 복사
      currentStep: 'REVIEW',
      isProcessing: false,
    });
  },
  
  clearReceipt: () => set({
    processedReceipt: null,
    recognizedItems: [],
    editableItems: [],
    selectedItemIds: [],
    currentStep: 'SCAN',
  }),
  
  // 재료 편집 액션
  updateEditableItem: (itemId, updates) => {
    set((state) => ({
      editableItems: state.editableItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  },
  
  removeEditableItem: (itemId) => {
    set((state) => ({
      editableItems: state.editableItems.filter(item => item.id !== itemId),
      selectedItemIds: state.selectedItemIds.filter(id => id !== itemId),
    }));
  },
  
  addEditableItem: (newItem) => {
    const tempId = Date.now(); // 임시 ID
    set((state) => ({
      editableItems: [
        ...state.editableItems,
        { ...newItem, id: tempId, receiptId: state.processedReceipt?.id || 0 },
      ],
    }));
  },
  
  // 선택 관리
  toggleItemSelection: (itemId) => {
    set((state) => ({
      selectedItemIds: state.selectedItemIds.includes(itemId)
        ? state.selectedItemIds.filter(id => id !== itemId)
        : [...state.selectedItemIds, itemId],
    }));
  },
  
  selectAllItems: () => {
    set((state) => ({
      selectedItemIds: state.editableItems.map(item => item.id),
    }));
  },
  
  clearSelection: () => set({ selectedItemIds: [] }),
  
  // 모드 전환
  showTransitionModal: (message) => {
    set({
      isTransitionModalVisible: true,
      transitionMessage: message,
    });
  },
  
  hideTransitionModal: () => {
    set({
      isTransitionModalVisible: false,
      transitionMessage: '',
    });
  },
  
  // 진행 상태
  setCurrentStep: (step) => set({ currentStep: step }),
  
  // 초기화
  resetState: () => set(initialState),
})); 
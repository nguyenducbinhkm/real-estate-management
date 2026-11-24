import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  criteria: {
    keyword: '',
    propertyType: '',
    transactionType: '',
    provinceCode: '',
    districtCode: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    page: 1,
    pageSize: 24, // chia hết cho 4 cột của lưới tin
  },
  // Câu tìm kiếm người dùng gõ (đã được phân tích thành các bộ lọc trong criteria).
  searchText: '',
  results: [],
  total: 0,
  loading: false,
  error: '',

  setSearchText(searchText) {
    set({ searchText });
  },

  setCriteria(criteria) {
    set((state) => ({ criteria: { ...state.criteria, ...criteria } }));
  },
  setResults(results, total) {
    set({ results, total });
  },
  setLoading(loading) {
    set({ loading });
  },
  setError(error) {
    set({ error });
  },
}));

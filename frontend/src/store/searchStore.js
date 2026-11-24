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
    pageSize: 20,
  },
  results: [],
  total: 0,
  loading: false,
  error: '',

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

import create from "zustand";

export const useFilterStore = create((set) => ({
  filters: {
    dateRange: null,
    severity: null,
    source: null,
    search: "",
  },
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
}));
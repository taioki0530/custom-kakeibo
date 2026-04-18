import { create } from "zustand";
import type { DashboardData } from "../types";
import { getDashboardData } from "../db/queries/dashboard";

interface DashboardStore {
  data: DashboardData | null;
  isLoading: boolean;
  year: number;
  month: number;
  setMonth: (year: number, month: number) => void;
  refresh: () => Promise<void>;
}

const now = new Date();

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: null,
  isLoading: false,
  year: now.getFullYear(),
  month: now.getMonth() + 1,

  setMonth: (year, month) => {
    set({ year, month });
    get().refresh();
  },

  refresh: async () => {
    const { year, month } = get();
    set({ isLoading: true });
    try {
      const data = await getDashboardData(year, month);
      set({ data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));

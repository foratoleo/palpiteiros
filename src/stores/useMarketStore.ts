import { create } from "zustand";
import { Market } from "@/types";

interface MarketStore {
  markets: Market[];
  selectedMarket: Market | null;
  isLoading: boolean;
  error: string | null;
  setMarkets: (markets: Market[]) => void;
  setSelectedMarket: (market: Market | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  markets: [],
  selectedMarket: null,
  isLoading: false,
  error: null,
  setMarkets: (markets) => set({ markets }),
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

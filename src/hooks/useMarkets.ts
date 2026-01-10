import { useQuery } from "@tanstack/react-query";
import { marketService } from "@/services/market.service";
import { Market } from "@/types";

export function useMarkets(params?: {
  limit?: number;
  offset?: number;
  tag?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["markets", params],
    queryFn: () => marketService.getMarkets(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => marketService.getMarketById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useMarketPriceHistory(marketId: string) {
  return useQuery({
    queryKey: ["marketPriceHistory", marketId],
    queryFn: () => marketService.getMarketPriceHistory(marketId),
    enabled: !!marketId,
    staleTime: 60000, // 1 minute
  });
}

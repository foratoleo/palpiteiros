import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      marketId,
      outcome,
      type,
      price,
      size,
    }: {
      marketId: string;
      outcome: string;
      type: "buy" | "sell";
      price: number;
      size: number;
    }) => orderService.placeOrder(marketId, outcome, type, price, size),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUserOrders(userId: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => orderService.getUserOrders(userId),
    enabled: !!userId,
  });
}

export function useMarketOrders(marketId: string) {
  return useQuery({
    queryKey: ["orders", marketId],
    queryFn: () => orderService.getMarketOrders(marketId),
    enabled: !!marketId,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

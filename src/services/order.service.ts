import { supabase } from "@/config/supabase";
import { Order } from "@/types";

class OrderService {
  async placeOrder(marketId: string, outcome: string, type: "buy" | "sell", price: number, size: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("orders")
      .insert({
        market_id: marketId,
        user_id: user.id,
        outcome,
        type,
        price,
        size,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMarketOrders(marketId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async cancelOrder(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const orderService = new OrderService();

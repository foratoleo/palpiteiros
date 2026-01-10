import { APP_CONFIG } from "@/config/app";
import { Market, PaginatedResponse } from "@/types";

class MarketService {
  private baseUrl = APP_CONFIG.gammaApiUrl;

  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    tag?: string;
    search?: string;
  }): Promise<PaginatedResponse<Market>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.search) searchParams.set("search", params.search);

    const response = await fetch(`${this.baseUrl}/markets?${searchParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch markets");
    }

    const data = await response.json();
    return {
      data: data.markets || [],
      total: data.total || 0,
      page: Math.floor((params?.offset || 0) / (params?.limit || 20)) + 1,
      pageSize: params?.limit || 20,
      hasMore: data.hasMore || false,
    };
  }

  async getMarketById(id: string): Promise<Market> {
    const response = await fetch(`${this.baseUrl}/markets/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch market");
    }
    return response.json();
  }

  async getMarketPriceHistory(marketId: string): Promise<Array<{ timestamp: string; price: number }>> {
    const response = await fetch(`${this.baseUrl}/markets/${marketId}/price-history`);
    if (!response.ok) {
      throw new Error("Failed to fetch price history");
    }
    return response.json();
  }

  async getMarketOrders(marketId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/markets/${marketId}/orders`);
    if (!response.ok) {
      throw new Error("Failed to fetch market orders");
    }
    return response.json();
  }
}

export const marketService = new MarketService();

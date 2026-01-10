// Market Types
export interface Market {
  id: string;
  question: string;
  description?: string;
  slug: string;
  outcomes: string[];
  tags: string[];
  endTime: string;
  liquidity?: number;
  volume?: number;
  probability?: number;
  status: "active" | "closed" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  type: "buy" | "sell";
  price: number;
  size: number;
  status: "pending" | "filled" | "cancelled";
  createdAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  size: number;
  avgPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  balance: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Database Types for Palpiteiros
 *
 * Auto-generated types based on Supabase schema
 * Schema: supabase/migrations/
 *
 * Migrations:
 * - 001_initial_schema.sql
 * - 002_add_markets_table.sql
 * - 003_add_user_data.sql
 * - 004_add_breaking_markets.sql
 * - 005_add_newsletter_subscriptions.sql
 *
 * To regenerate:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Start Docker (required for local Supabase)
 * 3. Run: supabase gen types typescript --local > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      markets: {
        Row: {
          id: string
          question: string
          condition_id: string
          slug: string
          description: string | null
          end_date: string | null
          start_date: string | null
          outcomes: MarketOutcome[]
          volume: number | null
          liquidity: number | null
          active: boolean
          closed: boolean
          archived: boolean | null
          tags: Tag[]
          category: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          condition_id: string
          slug: string
          description?: string | null
          end_date?: string | null
          start_date?: string | null
          outcomes?: MarketOutcome[]
          volume?: number | null
          liquidity?: number | null
          active?: boolean
          closed?: boolean
          archived?: boolean | null
          tags?: Tag[]
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          condition_id?: string
          slug?: string
          description?: string | null
          end_date?: string | null
          start_date?: string | null
          outcomes?: MarketOutcome[]
          volume?: number | null
          liquidity?: number | null
          active?: boolean
          closed?: boolean
          archived?: boolean | null
          tags?: Tag[]
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      market_prices: {
        Row: {
          id: string
          market_id: string | null
          price_yes: number | null
          price_no: number | null
          volume_24h: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          market_id?: string | null
          price_yes?: number | null
          price_no?: number | null
          volume_24h?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          market_id?: string | null
          price_yes?: number | null
          price_no?: number | null
          volume_24h?: number | null
          timestamp?: string
        }
      }
      user_portfolios: {
        Row: {
          id: string
          user_id: string
          market_id: string
          outcome: string
          size: number
          average_price: number
          current_price: number | null
          pnl: number | null
          pnl_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          market_id: string
          outcome: string
          size: number
          average_price: number
          current_price?: number | null
          pnl?: number | null
          pnl_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          market_id?: string
          outcome?: string
          size?: number
          average_price?: number
          current_price?: number | null
          pnl?: number | null
          pnl_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          market_id: string
          condition: 'above' | 'below'
          target_price: number
          triggered: boolean
          triggered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          market_id: string
          condition: 'above' | 'below'
          target_price: number
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          market_id?: string
          condition?: 'above' | 'below'
          target_price?: number
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark'
          currency: string
          notifications_enabled: boolean
          particle_effects: boolean
          data_refresh_interval: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark'
          currency?: string
          notifications_enabled?: boolean
          particle_effects?: boolean
          data_refresh_interval?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark'
          currency?: string
          notifications_enabled?: boolean
          particle_effects?: boolean
          data_refresh_interval?: number
          created_at?: string
          updated_at?: string
        }
      }
      market_price_history: {
        Row: {
          id: string
          market_id: string
          price_yes: number
          price_no: number
          volume: number
          timestamp: string
        }
        Insert: {
          id?: string
          market_id: string
          price_yes: number
          price_no: number
          volume: number
          timestamp?: string
        }
        Update: {
          id?: string
          market_id?: string
          price_yes?: number
          price_no?: number
          volume?: number
          timestamp?: string
        }
      }
      market_movement_cache: {
        Row: {
          market_id: string
          price_change_24h: number | null
          volume_change_24h: number | null
          price_high_24h: number | null
          price_low_24h: number | null
          volatility_index_24h: number | null
          composite_score: number | null
          last_updated: string
        }
        Insert: {
          market_id: string
          price_change_24h?: number | null
          volume_change_24h?: number | null
          price_high_24h?: number | null
          price_low_24h?: number | null
          volatility_index_24h?: number | null
          composite_score?: number | null
          last_updated?: string
        }
        Update: {
          market_id?: string
          price_change_24h?: number | null
          volume_change_24h?: number | null
          price_high_24h?: number | null
          price_low_24h?: number | null
          volatility_index_24h?: number | null
          composite_score?: number | null
          last_updated?: string
        }
      }
      breaking_newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          active: boolean
          frequency: 'daily' | 'weekly'
          created_at: string
          last_sent_at: string | null
          unsubscribed_at: string | null
          unsubscribe_token: string
        }
        Insert: {
          id?: string
          email: string
          active?: boolean
          frequency?: 'daily' | 'weekly'
          created_at?: string
          last_sent_at?: string | null
          unsubscribed_at?: string | null
          unsubscribe_token?: string
        }
        Update: {
          id?: string
          email?: string
          active?: boolean
          frequency?: 'daily' | 'weekly'
          created_at?: string
          last_sent_at?: string | null
          unsubscribed_at?: string | null
          unsubscribe_token?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// JSON Object Types
export interface MarketOutcome {
  name: string
  price: number
}

export interface Tag {
  label: string
  slug: string
}

// Table Row Types
export type Market = Database["public"]["Tables"]["markets"]["Row"]
export type MarketInsert = Database["public"]["Tables"]["markets"]["Insert"]
export type MarketUpdate = Database["public"]["Tables"]["markets"]["Update"]

export type MarketPrice = Database["public"]["Tables"]["market_prices"]["Row"]
export type MarketPriceInsert = Database["public"]["Tables"]["market_prices"]["Insert"]
export type MarketPriceUpdate = Database["public"]["Tables"]["market_prices"]["Update"]

export type UserPortfolio = Database["public"]["Tables"]["user_portfolios"]["Row"]
export type UserPortfolioInsert = Database["public"]["Tables"]["user_portfolios"]["Insert"]
export type UserPortfolioUpdate = Database["public"]["Tables"]["user_portfolios"]["Update"]

export type PriceAlert = Database["public"]["Tables"]["price_alerts"]["Row"]
export type PriceAlertInsert = Database["public"]["Tables"]["price_alerts"]["Insert"]
export type PriceAlertUpdate = Database["public"]["Tables"]["price_alerts"]["Update"]

export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]
export type UserPreferencesInsert = Database["public"]["Tables"]["user_preferences"]["Insert"]
export type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"]

export type MarketPriceHistory = Database["public"]["Tables"]["market_price_history"]["Row"]
export type MarketPriceHistoryInsert = Database["public"]["Tables"]["market_price_history"]["Insert"]
export type MarketPriceHistoryUpdate = Database["public"]["Tables"]["market_price_history"]["Update"]

export type MarketMovementCache = Database["public"]["Tables"]["market_movement_cache"]["Row"]
export type MarketMovementCacheInsert = Database["public"]["Tables"]["market_movement_cache"]["Insert"]
export type MarketMovementCacheUpdate = Database["public"]["Tables"]["market_movement_cache"]["Update"]

export type BreakingNewsletterSubscription = Database["public"]["Tables"]["breaking_newsletter_subscriptions"]["Row"]
export type BreakingNewsletterSubscriptionInsert = Database["public"]["Tables"]["breaking_newsletter_subscriptions"]["Insert"]
export type BreakingNewsletterSubscriptionUpdate = Database["public"]["Tables"]["breaking_newsletter_subscriptions"]["Update"]

// Tables Type for Supabase Client
export type Tables = Database["public"]["Tables"]
export type TablesInsert = {
  markets: MarketInsert
  market_prices: MarketPriceInsert
  user_portfolios: UserPortfolioInsert
  price_alerts: PriceAlertInsert
  user_preferences: UserPreferencesInsert
  market_price_history: MarketPriceHistoryInsert
  market_movement_cache: MarketMovementCacheInsert
  breaking_newsletter_subscriptions: BreakingNewsletterSubscriptionInsert
}
export type TablesUpdate = {
  markets: MarketUpdate
  market_prices: MarketPriceUpdate
  user_portfolios: UserPortfolioUpdate
  price_alerts: PriceAlertUpdate
  user_preferences: UserPreferencesUpdate
  market_price_history: MarketPriceHistoryUpdate
  market_movement_cache: MarketMovementCacheUpdate
  breaking_newsletter_subscriptions: BreakingNewsletterSubscriptionUpdate
}

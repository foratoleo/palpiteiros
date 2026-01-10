export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Palpiteiros",
  defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME as "light" | "dark") || "dark",
  gammaApiUrl: process.env.NEXT_PUBLIC_GAMMA_API_URL || "https://gamma-api.polymarket.com",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
} as const;

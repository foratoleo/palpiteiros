import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Palpiteiros - Prediction Market Platform",
    template: "%s | Palpiteiros",
  },
  description:
    "Trade on the world's most accurate prediction markets. Buy and sell shares on real-world events including politics, sports, economics, and more.",
  applicationName: "Palpiteiros",
  authors: [{ name: "Palpiteiros Team" }],
  generator: "Next.js",
  keywords: [
    "prediction market",
    "polymarket",
    "betting",
    "trading",
    "crypto",
    "politics",
    "sports betting",
    "forecasting",
  ],
  creators: [{ name: "Palpiteiros Team" }],
  publisher: "Palpiteiros",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://palpiteiros.com",
    title: "Palpiteiros - Prediction Market Platform",
    description:
      "Trade on the world's most accurate prediction markets. Buy and sell shares on real-world events.",
    siteName: "Palpiteiros",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Palpiteiros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Palpiteiros - Prediction Market Platform",
    description:
      "Trade on the world's most accurate prediction markets.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarket } from "@/hooks";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Activity,
  Star,
  StarOff,
  ArrowLeft,
  Share2,
  Info,
} from "lucide-react";

// Mock price history data
const generatePriceHistory = () => {
  const data = [];
  let price = 0.5;
  for (let i = 0; i < 30; i++) {
    price = price + (Math.random() - 0.5) * 0.1;
    price = Math.max(0.01, Math.min(0.99, price));
    data.push({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      price: price * 100,
    });
  }
  return data;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [tradeAmount, setTradeAmount] = React.useState("10");
  const [selectedOutcome, setSelectedOutcome] = React.useState<"yes" | "no">("yes");

  // Fetch market data using the useMarket hook
  const { market, isLoading, error } = useMarket({
    marketId: params.id || "",
    enabled: !!params.id,
  });

  const [priceHistory] = React.useState(generatePriceHistory());

  // Mock order book data
  const orderBook = {
    yes: [
      { price: 65, amount: 1250 },
      { price: 64, amount: 2400 },
      { price: 63, amount: 1800 },
      { price: 62, amount: 3200 },
      { price: 61, amount: 1500 },
    ],
    no: [
      { price: 38, amount: 1100 },
      { price: 39, amount: 2100 },
      { price: 40, amount: 1900 },
      { price: 41, amount: 2800 },
      { price: 42, amount: 1600 },
    ],
  };

  // Mock related markets (TODO: fetch from API)
  const relatedMarkets = [];

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Loading market...</h2>
            <p className="text-muted-foreground">
              Please wait while we fetch the market data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="p-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Market not found</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || "The market you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/markets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!market) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="p-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Market not found</h2>
            <p className="text-muted-foreground mb-4">
              The market you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/markets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPrice = market.current_price || 0.5;
  const priceChange = market.price_change_24h || 0;
  const isPriceUp = priceChange >= 0;

  const handleTrade = () => {
    // TODO: Implement trade logic
    console.log("Trading", selectedOutcome, tradeAmount);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      {/* Market Header */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{market.category || "General"}</Badge>
                  <Badge variant={market.active ? "default" : "secondary"}>
                    {market.active ? "Active" : "Closed"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{market.question}</CardTitle>
                {market.description && (
                  <CardDescription className="mt-2 text-base">
                    {market.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-1">
                  {priceHistory.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${point.price}%` }}
                      transition={{ delay: i * 0.02, duration: 0.5 }}
                      className={cn(
                        "flex-1 rounded-t transition-colors",
                        point.price > 50 ? "bg-green-500/80" : "bg-red-500/80"
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{priceHistory[0]?.date}</span>
                  <span>30 days</span>
                  <span>{priceHistory[priceHistory.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Market Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold mt-1">
                    {(currentPrice * 100).toFixed(1)}%
                  </p>
                  <p className={cn("text-xs mt-1 flex items-center gap-1", isPriceUp ? "text-green-500" : "text-red-500")}>
                    {isPriceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(priceChange).toFixed(1)}% 24h
                  </p>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Volume 24h</p>
                  <p className="text-2xl font-bold mt-1">
                    ${market.volume_24h?.toFixed(0) || "0"}
                  </p>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Liquidity</p>
                  <p className="text-2xl font-bold mt-1">
                    ${market.liquidity?.toFixed(0) || "0"}
                  </p>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold mt-1">
                    <Users className="h-5 w-5 inline-block mr-1" />
                    {Math.floor(Math.random() * 5000) + 500}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Order Book */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Yes Orders */}
                  <div>
                    <p className="text-sm font-medium text-green-500 mb-3">Buy Yes</p>
                    <div className="space-y-2">
                      {orderBook.yes.map((order, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{order.price}%</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-green-500/20 rounded" style={{ width: `${order.amount / 50}px` }} />
                            <span className="w-16 text-right">{order.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* No Orders */}
                  <div>
                    <p className="text-sm font-medium text-red-500 mb-3">Buy No</p>
                    <div className="space-y-2">
                      {orderBook.no.map((order, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{order.price}%</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-red-500/20 rounded" style={{ width: `${order.amount / 50}px` }} />
                            <span className="w-16 text-right">{order.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Markets */}
          {relatedMarkets.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Related Markets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedMarkets.map((related) => (
                      <Link key={related.id} href={`/markets/${related.id}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{related.question}</p>
                                <p className="text-sm text-muted-foreground">
                                  {related.current_price ? `${(related.current_price * 100).toFixed(1)}%` : "N/A"}
                                </p>
                              </div>
                              <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Trading Sidebar */}
        <div className="space-y-6">
          {/* Trade Card */}
          <motion.div variants={itemVariants} className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Outcome Selection */}
                <Tabs
                  value={selectedOutcome}
                  onValueChange={(v) => setSelectedOutcome(v as "yes" | "no")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yes" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                      Yes
                    </TabsTrigger>
                    <TabsTrigger value="no" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                      No
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Current Price */}
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold mt-1">
                    {selectedOutcome === "yes"
                      ? `${(currentPrice * 100).toFixed(1)}%`
                      : `${((1 - currentPrice) * 100).toFixed(1)}%`}
                  </p>
                </div>

                <Separator />

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ($)</label>
                  <Input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setTradeAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Trade Summary */}
                <Card variant="glass" className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shares</span>
                      <span className="font-medium">
                        {((parseFloat(tradeAmount) || 0) / (selectedOutcome === "yes" ? currentPrice : 1 - currentPrice)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Price</span>
                      <span className="font-medium">
                        {selectedOutcome === "yes"
                          ? `${(currentPrice * 100).toFixed(1)}%`
                          : `${((1 - currentPrice) * 100).toFixed(1)}%`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Potential Return</span>
                      <span className="font-bold text-green-500">
                        +${((parseFloat(tradeAmount) || 0) * (selectedOutcome === "yes" ? (1 - currentPrice) / currentPrice : currentPrice / (1 - currentPrice))).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleTrade}
                  disabled={!market.active}
                >
                  {market.active ? `Buy ${selectedOutcome.toUpperCase()}` : "Market Closed"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By trading, you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Market Info */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Market Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {market.end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Date
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(market.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Status
                  </span>
                  <Badge variant={market.active ? "default" : "secondary"}>
                    {market.active ? "Active" : "Closed"}
                  </Badge>
                </div>
                {market.volume_24h && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      24h Volume
                    </span>
                    <span className="text-sm font-medium">
                      ${market.volume_24h.toFixed(0)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

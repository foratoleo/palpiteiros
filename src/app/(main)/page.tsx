"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { useMarketStore } from "@/stores";
import {
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Flame,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const stats = [
  {
    name: "Total Markets",
    value: "1,247",
    change: "+12%",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    name: "Total Volume",
    value: "$45.2M",
    change: "+8%",
    icon: Activity,
    color: "text-blue-500",
  },
  {
    name: "Active Users",
    value: "89.2K",
    change: "+23%",
    icon: Users,
    color: "text-purple-500",
  },
];

const featuredCategories = [
  { name: "Politics", href: "/markets?category=politics", count: 234 },
  { name: "Sports", href: "/markets?category=sports", count: 189 },
  { name: "Crypto", href: "/markets?category=crypto", count: 156 },
  { name: "Economics", href: "/markets?category=economics", count: 98 },
];

export default function HomePage() {
  const { markets } = useMarketStore();
  const featuredMarkets = markets.slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12 lg:p-16 mb-8"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Live Prediction Markets</span>
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Trade on the Future
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
          >
            Buy and sell shares on real-world events. Politics, sports, crypto, and more.
            Put your knowledge to the test and profit from your predictions.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="gap-2" asChild>
              <Link href="/markets">
                Explore Markets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link href="/portfolio">Start Trading</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mb-8"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.name} variants={itemVariants}>
                <Card variant="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.name}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={cn("h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center", stat.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-green-500 mt-2">{stat.change} this week</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Breaking Markets CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mb-8"
      >
        <Card
          variant="glass"
          className="relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-background to-red-500/5 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"
            />
          </div>

          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg"
                >
                  <Flame className="h-7 w-7" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl md:text-2xl font-bold">Breaking Markets</h3>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                      Hot
                    </Badge>
                  </div>
                  <p className="text-muted-foreground max-w-md">
                    See what's moving right now. Markets with significant price changes, volume spikes, and high volatility.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
                asChild
              >
                <Link href="/breaking">
                  View Breaking
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Real-time updates</span>
              <span className="text-xs text-muted-foreground mx-2">|</span>
              <Activity className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Live price tracking</span>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Featured Markets */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Featured Markets</h2>
            <p className="text-muted-foreground">Trending prediction markets</p>
          </div>
          <Button variant="ghost" className="gap-2" asChild>
            <Link href="/markets">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredMarkets.length > 0 ? (
            featuredMarkets.map((market) => (
              <motion.div key={market.id} variants={itemVariants}>
                <Link href={`/markets/${market.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {market.category || "General"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          <span>{market.volume_24h?.toFixed(0) || "0"} vol</span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 mt-2">
                        {market.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="text-xl font-bold">
                            {market.current_price ? `${(market.current_price * 100).toFixed(1)}%` : "N/A"}
                          </p>
                        </div>
                        <Button size="sm" variant="default">
                          Trade
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Loading...
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">
                      Loading market data...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-12 bg-muted/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">Find markets that interest you</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Link href={category.href}>
                <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.count} markets</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-8"
      >
        <Card variant="elevated" className="overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5" />
            <CardContent className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <Badge variant="secondary">Get Started</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Ready to make your first prediction?
                  </h2>
                  <p className="text-muted-foreground">
                    Join thousands of traders predicting real-world events. Start with as little as $10.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" asChild>
                    <Link href="/markets">Browse Markets</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/portfolio">View Portfolio</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}

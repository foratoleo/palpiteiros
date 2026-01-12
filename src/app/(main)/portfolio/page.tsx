"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePortfolioStore } from "@/stores";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  X,
  ArrowUpDown,
  Calendar,
  PieChart,
  LineChart,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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

// Mock data for development
const mockPositions = [
  {
    id: "pos-1",
    market: {
      id: "mkt-1",
      question: "Will Bitcoin reach $100k by end of 2025?",
      category: "Crypto",
      active: true,
      current_price: 0.65,
    },
    outcome: "Yes",
    size: 100,
    average_price: 0.55,
    current_price: 0.65,
    pnl: 10,
    pnl_percentage: 18.18,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "pos-2",
    market: {
      id: "mkt-2",
      question: "Will AI pass the Turing test by 2026?",
      category: "Technology",
      active: true,
      current_price: 0.42,
    },
    outcome: "Yes",
    size: 50,
    average_price: 0.35,
    current_price: 0.42,
    pnl: 3.5,
    pnl_percentage: 20,
    created_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "pos-3",
    market: {
      id: "mkt-3",
      question: "Will SpaceX successfully land on Mars by 2030?",
      category: "Science",
      active: true,
      current_price: 0.28,
    },
    outcome: "No",
    size: 75,
    average_price: 0.75,
    current_price: 0.72,
    pnl: -2.25,
    pnl_percentage: -3,
    created_at: "2025-01-10T00:00:00Z",
  },
];

const mockSummary = {
  totalValue: 5000,
  totalInvested: 4500,
  totalPnl: 500,
  totalPnlPercentage: 11.11,
  activePositions: 3,
  closedPositions: 12,
  winRate: 66.67,
};

export default function PortfolioPage() {
  const { positions, summary, closePosition } = usePortfolioStore();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [sortField, setSortField] = React.useState("pnl");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  // Use mock data if no real data
  const displayPositions = positions.length > 0 ? positions : mockPositions;
  const displaySummary = summary || mockSummary;

  const sortedPositions = React.useMemo(() => {
    return [...displayPositions].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      let comparison = 0;

      switch (sortField) {
        case "pnl":
          comparison = (a.pnl || 0) - (b.pnl || 0);
          break;
        case "pnl_percentage":
          comparison = (a.pnl_percentage || 0) - (b.pnl_percentage || 0);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return comparison * multiplier;
    });
  }, [displayPositions, sortField, sortDirection]);

  const handleXPosition = (positionId: string) => {
    // TODO: Implement close position logic
    console.log("Closing position:", positionId);
  };

  // Pie chart data (allocation by category)
  const pieData = React.useMemo(() => {
    const categoryMap = new Map<string, number>();
    displayPositions.forEach((pos) => {
      const category = pos.market.category || "Other";
      const value = pos.size * (pos.current_price || 0);
      categoryMap.set(category, (categoryMap.get(category) || 0) + value);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [displayPositions]);

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Track your positions and performance
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/markets">
            <Wallet className="h-4 w-4" />
            Find Markets
          </Link>
        </Button>
      </div>

      {/* Portfolio Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold mt-1">
                    ${displaySummary.totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    displaySummary.totalPnl >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {displaySummary.totalPnl >= 0 ? "+" : ""}${displaySummary.totalPnl.toFixed(2)}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    displaySummary.totalPnlPercentage >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {displaySummary.totalPnlPercentage >= 0 ? "+" : ""}{displaySummary.totalPnlPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  displaySummary.totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {displaySummary.totalPnl >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold mt-1">
                    {displaySummary.activePositions}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold mt-1">
                    {displaySummary.winRate?.toFixed(1) || "0"}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  {/* Simple CSS pie chart */}
                  <div className="relative w-48 h-48 rounded-full" style={{
                    background: `conic-gradient(${pieData.map((d, i) => {
                      const prevPercent = pieData.slice(0, i).reduce((sum, p) => sum + p.value, 0);
                      const percent = (d.value / displaySummary.totalValue) * 100;
                      return `${colors[i % colors.length]} ${prevPercent / displaySummary.totalValue * 100}% ${(prevPercent + d.value) / displaySummary.totalValue * 100}%`;
                    }).join(", ")})`
                  }}>
                    <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">${displaySummary.totalValue.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-1">
                  {[3000, 3200, 3500, 3400, 3800, 4200, 4100, 4500, 4800, 4700, 4900, 5000].map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / 5500) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>12 months ago</span>
                  <span>Now</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPositions.slice(0, 5).map((position) => (
                  <PositionRow
                    key={position.id}
                    position={position}
                    onX={() => handleXPosition(position.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input placeholder="Search positions..." />
                </div>
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pnl">P&L</SelectItem>
                    <SelectItem value="pnl_percentage">P&L %</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="created_at">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {sortedPositions.map((position) => (
              <Link key={position.id} href={`/markets/${position.market.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <PositionRow
                      position={position}
                      onX={(e) => {
                        e?.preventDefault();
                        handleXPosition(position.id);
                      }}
                      showDetails
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trade History</h3>
              <p className="text-muted-foreground">
                Your closed positions and trade history will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Position Row Component
interface PositionRowProps {
  position: any;
  onX: (e?: React.MouseEvent) => void;
  showDetails?: boolean;
}

function PositionRow({ position, onX, showDetails = false }: PositionRowProps) {
  const pnl = position.pnl || 0;
  const pnlPercentage = position.pnl_percentage || 0;
  const isProfitable = pnl >= 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {position.market.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {position.outcome}
          </Badge>
        </div>
        {showDetails ? (
          <Link href={`/markets/${position.market.id}`} className="font-medium hover:underline block truncate">
            {position.market.question}
          </Link>
        ) : (
          <p className="text-sm font-medium truncate">{position.market.question}</p>
        )}
        {showDetails && (
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span>Size: {position.size}</span>
            <span>Avg: ${(position.average_price * 100).toFixed(1)}%</span>
            <span>Current: ${(position.current_price * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="text-right">
        <p className={cn("font-semibold", isProfitable ? "text-green-500" : "text-red-500")}>
          {isProfitable ? "+" : ""}${pnl.toFixed(2)}
        </p>
        <p className={cn("text-xs", isProfitable ? "text-green-500" : "text-red-500")}>
          {isProfitable ? "+" : ""}{pnlPercentage.toFixed(1)}%
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onX}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

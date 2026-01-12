"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAlertStore, useMarketStore, AlertCondition } from "@/stores";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Pause,
  Play,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Target,
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

// Mock alerts data
const mockAlerts = [
  {
    id: "alert-1",
    market: {
      id: "mkt-1",
      question: "Will Bitcoin reach $100k by end of 2025?",
      category: "Crypto",
      current_price: 0.65,
    },
    condition: AlertCondition.ABOVE,
    target_price: 0.70,
    triggered: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "alert-2",
    market: {
      id: "mkt-2",
      question: "Will AI pass the Turing test by 2026?",
      category: "Technology",
      current_price: 0.42,
    },
    condition: AlertCondition.BELOW,
    target_price: 0.30,
    triggered: false,
    created_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "alert-3",
    market: {
      id: "mkt-3",
      question: "Will SpaceX successfully land on Mars by 2030?",
      category: "Science",
      current_price: 0.28,
    },
    condition: AlertCondition.ABOVE,
    target_price: 0.35,
    triggered: true,
    triggered_at: "2025-01-08T12:30:00Z",
    created_at: "2025-01-02T00:00:00Z",
  },
];

const alertStats = {
  active: 2,
  triggered: 1,
  paused: 0,
};

export default function AlertsPage() {
  const { alerts, addAlert, deleteAlert, pauseAlerts, resumeAlerts } = useAlertStore();
  const { markets } = useMarketStore();

  const [open, setOpen] = React.useState(false);
  const [selectedMarketId, setSelectedMarketId] = React.useState("");
  const [condition, setCondition] = React.useState<AlertCondition>(AlertCondition.ABOVE);
  const [targetPrice, setTargetPrice] = React.useState("50");

  // Use mock data if no real data
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const activeAlerts = displayAlerts.filter((a) => !a.triggered);
  const triggeredAlerts = displayAlerts.filter((a) => a.triggered);

  const handleCreateAlert = () => {
    if (!selectedMarketId || !targetPrice) return;

    addAlert({
      market_id: selectedMarketId,
      market: markets.find((m) => m.id === selectedMarketId)!,
      condition,
      target_price: parseFloat(targetPrice) / 100,
    });

    setOpen(false);
    setSelectedMarketId("");
    setTargetPrice("50");
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId);
  };

  const getConditionIcon = (condition: AlertCondition) => {
    switch (condition) {
      case AlertCondition.ABOVE:
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case AlertCondition.BELOW:
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case AlertCondition.CROSS:
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getConditionLabel = (condition: AlertCondition) => {
    switch (condition) {
      case AlertCondition.ABOVE:
        return "Above";
      case AlertCondition.BELOW:
        return "Below";
      case AlertCondition.CROSS:
        return "Cross";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when market prices hit your targets
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set a target price to receive notifications when the market reaches it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Market</label>
                <Select value={selectedMarketId} onValueChange={setSelectedMarketId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.slice(0, 10).map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select value={condition} onValueChange={(v) => setCondition(v as AlertCondition)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AlertCondition.ABOVE}>Price goes above</SelectItem>
                    <SelectItem value={AlertCondition.BELOW}>Price goes below</SelectItem>
                    <SelectItem value={AlertCondition.CROSS}>Price crosses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Price (%)</label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min="1"
                  max="99"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlert}>Create Alert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold mt-1">{alertStats.active}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-500" />
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
                  <p className="text-sm text-muted-foreground">Triggered</p>
                  <p className="text-2xl font-bold mt-1">{alertStats.triggered}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-blue-500" />
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
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-bold mt-1">{alertStats.paused}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Pause className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Active Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          {activeAlerts.length > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause All
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </div>
          )}
        </div>

        {activeAlerts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {activeAlerts.map((alert) => (
              <motion.div key={alert.id} variants={itemVariants}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getConditionIcon(alert.condition)}
                          <Badge variant="secondary">{alert.market.category}</Badge>
                        </div>
                        <Link
                          href={`/markets/${alert.market.id}`}
                          className="font-medium hover:underline block"
                        >
                          {alert.market.question}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Current: <span className="font-medium text-foreground">
                              {alert.market.current_price !== undefined ? `${(alert.market.current_price * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Target: <span className="font-medium text-foreground">
                              {(alert.target_price * 100).toFixed(1)}%
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {getConditionLabel(alert.condition)} target
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active alerts</h3>
              <p className="text-muted-foreground mb-4">
                Create your first price alert to get notified when markets hit your targets.
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Triggered Alerts</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {triggeredAlerts.map((alert) => (
              <motion.div key={alert.id} variants={itemVariants}>
                <Card variant="glass" className="border-blue-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-blue-500">
                            <Check className="h-3 w-3 mr-1" />
                            Triggered
                          </Badge>
                          {alert.triggered_at && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.triggered_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/markets/${alert.market.id}`}
                          className="font-medium hover:underline block"
                        >
                          {alert.market.question}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Target: {(alert.target_price * 100).toFixed(1)}%
                          </span>
                          <span className="text-green-500">
                            Target reached!
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

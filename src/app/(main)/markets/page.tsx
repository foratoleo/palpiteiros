"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarketStore, MarketViewMode, MarketSortField } from "@/stores";
import { useMarkets } from "@/hooks/use-markets";
import { MarketsGridSkeleton } from "@/components/market/markets-grid-skeleton";
import { mapUIToGammaTagSlug } from "@/lib/category-mapper";
import {
  Grid3x3,
  List,
  LayoutList,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  StarOff,
  Filter,
  ChevronDown,
  Search,
  Sparkles,
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

const sortOptions = [
  { value: MarketSortField.END_DATE, label: "Ending Soon" },
  { value: MarketSortField.VOLUME, label: "Volume" },
  { value: MarketSortField.LIQUIDITY, label: "Liquidity" },
  { value: MarketSortField.PRICE, label: "Price" },
  { value: MarketSortField.CREATED, label: "Newest" },
];

const categories = [
  "All",
  "Politics",
  "Sports",
  "Crypto",
  "Economics",
  "Technology",
  "Entertainment",
  "Science",
  "World Events",
];

// Inner component that uses useSearchParams
function MarketsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const {
    viewMode,
    setViewMode,
    filters,
    setFilters,
    sortOption,
    setSort,
    searchQuery,
    setSearch,
    toggleFavorite,
    isFavorite,
    resetFilters,
    _filterVersion, // Used to force useMemo re-computation when filters change
  } = useMarketStore();

  // Fetch markets from API with filters from Zustand store
  // Convert UI categories to API-compatible format
  const apiFilters = React.useMemo(() => {
    const result: any = {
      active: filters.active !== undefined ? filters.active : true,
      closed: filters.closed !== undefined ? filters.closed : false,
    };

    // Pass categories for API-level filtering via tag_slug
    if (filters.categories && filters.categories.length > 0) {
      result.categories = filters.categories;
    }

    // Pass other filters as needed
    if (filters.minLiquidity !== undefined) {
      result.minLiquidity = filters.minLiquidity;
    }
    if (filters.minVolume !== undefined) {
      result.minVolume = filters.minVolume;
    }
    if (filters.priceRange) {
      result.priceRange = filters.priceRange;
    }

    return result;
  }, [filters]);

  const { markets, isLoading: isLoadingMarkets, error: marketsError } = useMarkets({
    enabled: true, // Always enabled on markets page
    filters: apiFilters,
  });

  // Current category for logging (must be declared before useEffects that use it)
  const currentCategory = filters.categories?.[0] || "all";

  // Debug: Log data when it changes
  React.useEffect(() => {
    console.log('[MarketsPage] Data update:', {
      marketsCount: markets?.length || 0,
      isLoading: isLoadingMarkets,
      error: marketsError?.message,
      firstMarket: markets?.[0]?.question?.substring(0, 50),
      categories: filters.categories,
      currentCategory
    });
  }, [markets, isLoadingMarkets, marketsError, filters.categories, currentCategory]);

  // NOTE: TanStack Query should handle cache invalidation automatically via query key changes
  // When category changes, the query key changes, triggering a refetch with correct data

  // Filter and sort markets using useMemo to prevent race conditions
  // Memoization ensures React uses a consistent markets snapshot during rendering
  const filteredMarkets = React.useMemo(() => {
    // CRITICAL: Force deep copy to prevent stale references
    const marketsCopy = JSON.parse(JSON.stringify(markets || [])) as Market[];
    let filtered = marketsCopy;

    console.log('[MarketsPage] Filtering markets:', {
      inputCount: markets?.length || 0,
      categories: filters.categories,
      firstInputMarket: markets?.[0]?.question?.substring(0, 50)
    });

    // Apply active filter
    if (filters.active !== undefined) {
      filtered = filtered.filter((m) => m.active === filters.active);
    }

    // Category filtering is done at API level via tag_slug parameter
    // No need for redundant client-side category filtering

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((m) =>
        m.tags?.some((tag: any) => filters.tags!.includes(tag.slug))
      );
    }

    // Apply liquidity range
    if (filters.minLiquidity !== undefined) {
      filtered = filtered.filter((m) => (m.liquidity || 0) >= filters.minLiquidity!);
    }
    if (filters.maxLiquidity !== undefined) {
      filtered = filtered.filter((m) => (m.liquidity || 0) <= filters.maxLiquidity!);
    }

    // Apply volume range
    if (filters.minVolume !== undefined) {
      filtered = filtered.filter((m) => (m.volume || 0) >= filters.minVolume!);
    }
    if (filters.maxVolume !== undefined) {
      filtered = filtered.filter((m) => (m.volume || 0) <= filters.maxVolume!);
    }

    // Apply price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter((m) => {
        const price = m.current_price || 0;
        return price >= min && price <= max;
      });
    }

    // Apply closing soon filter
    if (filters.closingSoon) {
      const oneDay = 24 * 60 * 60 * 1000;
      const tomorrow = Date.now() + oneDay;
      filtered = filtered.filter((m) => {
        const endDate = m.end_date ? new Date(m.end_date).getTime() : Infinity;
        return endDate <= tomorrow;
      });
    }

    // Apply hot filter (top 20% by volume)
    if (filters.hot) {
      const sortedByVolume = [...filtered].sort((a, b) => (b.volume || 0) - (a.volume || 0));
      const hotThreshold = Math.floor(sortedByVolume.length * 0.2);
      const hotIds = new Set(sortedByVolume.slice(0, hotThreshold).map((m) => m.id));
      filtered = filtered.filter((m) => hotIds.has(m.id));
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.question.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tags?.some((tag: any) => tag.label.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const { field, direction } = sortOption;
    const multiplier = direction === "asc" ? 1 : -1;

    // DEBUG: Log before sorting
    console.log('[MarketsPage] Before sort:', {
      filteredCount: filtered.length,
      firstFiltered: filtered[0]?.question?.substring(0, 50),
      sortField: field,
      sortDirection: direction
    });

    // CRITICAL FIX: Use .toSorted() to create a new array instead of mutating
    // This prevents React from reusing stale array references across renders
    const sorted = filtered.toSorted((a, b) => {
      let comparison = 0;

      switch (field) {
        case "endDate":
          const aDate = a.end_date ? new Date(a.end_date).getTime() : Infinity;
          const bDate = b.end_date ? new Date(b.end_date).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case "volume":
          comparison = (a.volume || 0) - (b.volume || 0);
          break;
        case "liquidity":
          comparison = (a.liquidity || 0) - (b.liquidity || 0);
          break;
        case "price":
          comparison = (a.current_price || 0) - (b.current_price || 0);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "price_change_24h":
          comparison = (a.price_change_24h || 0) - (b.price_change_24h || 0);
          break;
        default:
          comparison = 0;
      }

      return comparison * multiplier;
    });

    // DEBUG: Log after sorting
    console.log('[MarketsPage] After sort:', {
      sortedCount: sorted.length,
      firstSorted: sorted[0]?.question?.substring(0, 50)
    });

    console.log('[MarketsPage] Filtered result:', {
      outputCount: sorted.length,
      firstOutputMarket: sorted[0]?.question?.substring(0, 50)
    });

    return sorted;
  }, [markets, filters, searchQuery, sortOption, _filterVersion]); // Include _filterVersion to force re-computation

  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 20;

  // Calculate pagination
  const totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayMarkets = filteredMarkets.slice(startIndex, endIndex);

  // Reset to page 0 when filters change
  React.useEffect(() => {
    setCurrentPage(0);
  }, [filters, searchQuery, sortOption]);

  // T17.2: Memoize event handlers with useCallback to prevent child re-renders
  const handleCategoryChange = React.useCallback((category: string) => {
    if (category === "All") {
      setFilters({ categories: [] });
    } else {
      // IMPORTANT: Store category in lowercase for consistent matching
      // The category mapper in useMarkets will convert to proper tag_slug
      setFilters({ categories: [category.toLowerCase()] });
    }
  }, [setFilters]);

  const handleSortChange = React.useCallback((value: string) => {
    setSort(value as MarketSortField);
  }, [setSort]);

  // Debug log at render time to see what data is actually being rendered
  console.log('[MarketsPage] RENDER:', {
    currentCategory,
    filteredMarketsCount: filteredMarkets.length,
    firstFilteredMarket: filteredMarkets[0]?.question?.substring(0, 50),
    displayMarketsCount: displayMarkets.length,
    firstDisplayMarket: displayMarkets[0]?.question?.substring(0, 50)
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">
            {filteredMarkets.length} {filteredMarkets.length === 1 ? "market" : "markets"} available
            {totalPages > 1 && (
              <span className="ml-2">
                • Showing {startIndex + 1}-{Math.min(endIndex, filteredMarkets.length)} of {filteredMarkets.length}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === MarketViewMode.GRID ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(MarketViewMode.GRID)}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === MarketViewMode.LIST ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(MarketViewMode.LIST)}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === MarketViewMode.COMPACT ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(MarketViewMode.COMPACT)}
              className="h-8"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <Select
              value={sortOption.field}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              className="w-full lg:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronDown className="h-4 w-4 ml-2 rotate-180" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t space-y-4"
            >
              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={filters.categories?.includes(category.toLowerCase()) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: {priceRange[0]}% - {priceRange[1]}%
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={100}
                  step={5}
                  className="py-4"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.closingSoon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ closingSoon: !filters.closingSoon })}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Closing Soon
                </Button>
                <Button
                  variant={filters.hot ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ hot: !filters.hot })}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Hot Markets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset All
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => handleCategoryChange(category)}
              className="whitespace-nowrap"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Markets Grid/List */}
      {isLoadingMarkets ? (
        <MarketsGridSkeleton viewMode={viewMode} />
      ) : displayMarkets.length > 0 ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === MarketViewMode.GRID
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : viewMode === MarketViewMode.COMPACT
                ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
                : "space-y-3"
            }
          >
            {displayMarkets.map((market) => (
              <motion.div key={market.id} variants={itemVariants}>
                <Link href={`/markets/${market.id}`}>
                  <MarketCard
                    market={market}
                    viewMode={viewMode}
                    isFavorite={isFavorite(market.id)}
                    onToggleFavorite={(e) => {
                      e.preventDefault();
                      toggleFavorite(market.id);
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No markets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filters.categories?.length
                ? "Try adjusting your search or filters"
                : "Markets will appear here once loaded"}
            </p>
            {(searchQuery || filters.categories?.length) && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Wrapper with Suspense boundary for useSearchParams
export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading markets...</div>}>
      <MarketsPageContent />
    </Suspense>
  );
}

// Market Card Component
// T17.2: Memoized to prevent unnecessary re-renders in the markets grid
interface MarketCardProps {
  market: any;
  viewMode: MarketViewMode;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const MarketCard = React.memo(function MarketCard({ market, viewMode, isFavorite, onToggleFavorite }: MarketCardProps) {
  const priceChange = market.price_change_24h || 0;
  const isPriceUp = priceChange >= 0;

  if (viewMode === MarketViewMode.COMPACT) {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{market.question}</p>
              <p className="text-lg font-bold">
                {market.current_price ? `${(market.current_price * 100).toFixed(0)}%` : "N/A"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onToggleFavorite}
            >
              {isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === MarketViewMode.LIST) {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {market.category || "General"}
                </Badge>
                {market.end_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(market.end_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="font-semibold truncate">{market.question}</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-xl font-bold">
                  {market.current_price ? `${(market.current_price * 100).toFixed(1)}%` : "N/A"}
                </p>
              </div>
              <div className="text-right w-20">
                <p className="text-sm text-muted-foreground">24h</p>
                <p className={cn("text-sm font-medium flex items-center justify-end gap-1", isPriceUp ? "text-green-500" : "text-red-500")}>
                  {isPriceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(priceChange).toFixed(1)}%
                </p>
              </div>
              <div className="text-right w-24">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="font-medium">
                  ${market.volume_24h?.toFixed(0) || "0"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onToggleFavorite}>
                {isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {market.category || "General"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2"
            onClick={onToggleFavorite}
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 opacity-0 group-hover:opacity-50" />
            )}
          </Button>
        </div>
        <CardTitle className="line-clamp-2 mt-2">{market.question}</CardTitle>
        {market.description && (
          <CardDescription className="line-clamp-2">
            {market.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="text-2xl font-bold">
              {market.current_price ? `${(market.current_price * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>

          {/* Price Change */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">24h Change</span>
            <span className={cn("text-sm font-medium flex items-center gap-1", isPriceUp ? "text-green-500" : "text-red-500")}>
              {isPriceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(priceChange).toFixed(1)}%
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volume 24h</span>
            <span className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {market.volume_24h?.toFixed(0) || "0"}
            </span>
          </div>

          {/* End Date */}
          {market.end_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ends</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(market.end_date).toLocaleDateString()}
              </span>
            </div>
          )}

          <Button className="w-full mt-2" size="sm">
            Trade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

MarketCard.displayName = 'MarketCard';

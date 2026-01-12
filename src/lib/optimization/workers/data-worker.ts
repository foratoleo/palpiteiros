/**
 * Data Processing Worker
 *
 * Worker for performing heavy data operations off the main thread.
 * Handles filtering, sorting, aggregating, and transforming data.
 *
 * @module optimization/workers/data-worker
 */

// ============================================================================
// Worker Script
// ============================================================================

/**
 * The worker script as a string
 */
export const DATA_WORKER_SCRIPT = `
/**
 * Data Processing Worker
 * Handles heavy data operations off the main thread
 */

// Message handlers
const handlers = {
  filter: handleFilter,
  sort: handleSort,
  aggregate: handleAggregate,
  transform: handleTransform,
  group: handleGroup,
  search: handleSearch,
  paginate: handlePaginate,
  bulkOperation: handleBulkOperation,
  marketFilter: handleMarketFilter,
  marketSort: handleMarketSort,
  marketAggregate: handleMarketAggregate,
};

// Main message handler
self.onmessage = function(e) {
  const { id, type, data } = e.data;

  const handler = handlers[type as keyof typeof handlers];
  if (!handler) {
    self.postMessage({
      id,
      type,
      error: new Error(\`Unknown message type: \${type}\`),
      timestamp: Date.now(),
    });
    return;
  }

  try {
    const result = handler(data);
    self.postMessage({
      id,
      type,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    self.postMessage({
      id,
      type,
      error: error instanceof Error ? error : new Error(String(error)),
      timestamp: Date.now(),
    });
  }
};

// ============================================================================
// Handlers
// ============================================================================

function handleFilter(data) {
  const { items, predicate } = data;

  if (typeof predicate === 'function') {
    // For stringified predicates, we need to eval (not ideal but necessary for serialization)
    // In production, use a different approach
    return items.filter((item, index) => {
      try {
        const fn = new Function('item', 'index', 'return ' + predicate);
        return fn(item, index);
      } catch {
        return true;
      }
    });
  }

  // Simple field-based filtering
  const { field, operator, value } = data;
  return items.filter(item => {
    const itemValue = getNestedValue(item, field);

    switch (operator) {
      case 'eq': return itemValue === value;
      case 'ne': return itemValue !== value;
      case 'gt': return itemValue > value;
      case 'gte': return itemValue >= value;
      case 'lt': return itemValue < value;
      case 'lte': return itemValue <= value;
      case 'contains': return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith': return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'endsWith': return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'in': return Array.isArray(value) && value.includes(itemValue);
      case 'nin': return Array.isArray(value) && !value.includes(itemValue);
      default: return true;
    }
  });
}

function handleSort(data) {
  const { items, sortBy, order = 'asc' } = data;
  const multiplier = order === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy);
    const bValue = getNestedValue(b, sortBy);

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return -1 * multiplier;
    if (aStr > bStr) return 1 * multiplier;
    return 0;
  });
}

function handleAggregate(data) {
  const { items, operations } = data;
  const result = {};

  for (const op of operations) {
    const { field, type, as } = op;
    const values = items
      .map(item => getNestedValue(item, field))
      .filter(v => v !== null && v !== undefined);

    const key = as || \`\${field}_\${type}\`;

    switch (type) {
      case 'count':
        result[key] = values.length;
        break;
      case 'sum':
        result[key] = values.reduce((sum, v) => sum + (Number(v) || 0), 0);
        break;
      case 'avg':
      case 'mean':
        result[key] = values.reduce((sum, v) => sum + (Number(v) || 0), 0) / values.length || 0;
        break;
      case 'min':
        result[key] = Math.min(...values.map(Number));
        break;
      case 'max':
        result[key] = Math.max(...values.map(Number));
        break;
      case 'first':
        result[key] = values[0];
        break;
      case 'last':
        result[key] = values[values.length - 1];
        break;
      case 'unique':
        result[key] = [...new Set(values)];
        break;
      case 'uniqueCount':
        result[key] = new Set(values).size;
        break;
    }
  }

  return result;
}

function handleTransform(data) {
  const { items, transform } = data;

  if (typeof transform === 'string') {
    // Apply transformation using new Function
    const fn = new Function('item', 'index', \`return \${transform}\`);
    return items.map((item, index) => fn(item, index));
  }

  // Field-based transformation
  const { mappings } = data;
  return items.map(item => {
    const result = { ...item };
    for (const [source, target] of Object.entries(mappings)) {
      result[target] = getNestedValue(item, source);
    }
    return result;
  });
}

function handleGroup(data) {
  const { items, groupBy, aggregate: aggregateOps } = data;
  const groups = new Map();

  for (const item of items) {
    const key = getNestedValue(item, groupBy);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  }

  // Convert to array and apply aggregations if needed
  const result = [];

  if (aggregateOps) {
    for (const [key, groupItems] of groups) {
      const groupResult = { [groupBy]: key };

      for (const op of aggregateOps) {
        const { field, type, as } = op;
        const values = groupItems
          .map(item => getNestedValue(item, field))
          .filter(v => v !== null && v !== undefined);

        const resultKey = as || \`\${field}_\${type}\`;

        switch (type) {
          case 'count':
            groupResult[resultKey] = values.length;
            break;
          case 'sum':
            groupResult[resultKey] = values.reduce((sum, v) => sum + (Number(v) || 0), 0);
            break;
          case 'avg':
            groupResult[resultKey] = values.reduce((sum, v) => sum + (Number(v) || 0), 0) / values.length || 0;
            break;
          case 'min':
            groupResult[resultKey] = Math.min(...values.map(Number));
            break;
          case 'max':
            groupResult[resultKey] = Math.max(...values.map(Number));
            break;
        }
      }

      result.push(groupResult);
    }
  } else {
    for (const [key, groupItems] of groups) {
      result.push({ [groupBy]: key, items: groupItems });
    }
  }

  return result;
}

function handleSearch(data) {
  const { items, query, fields = [], fuzzy = false, limit } = data;
  if (!query) return items;

  const searchLower = query.toLowerCase();
  const results = [];

  for (const item of items) {
    let match = false;
    let score = 0;

    if (fields.length === 0) {
      // Search all string fields
      for (const value of Object.values(item)) {
        if (typeof value === 'string') {
          const valueLower = value.toLowerCase();
          if (valueLower.includes(searchLower)) {
            match = true;
            score += valueLower === searchLower ? 2 : 1;
          }
        }
      }
    } else {
      // Search specified fields
      for (const field of fields) {
        const value = getNestedValue(item, field);
        if (typeof value === 'string') {
          const valueLower = value.toLowerCase();

          if (fuzzy) {
            // Fuzzy matching using Levenshtein distance
            const distance = levenshteinDistance(valueLower, searchLower);
            const threshold = Math.max(3, Math.floor(searchLower.length * 0.3));
            if (distance <= threshold) {
              match = true;
              score += 1;
            }
          } else {
            if (valueLower.includes(searchLower)) {
              match = true;
              score += valueLower === searchLower ? 2 : 1;
            }
          }
        }
      }
    }

    if (match) {
      results.push({ item, score });

      if (limit && results.length >= limit) {
        break;
      }
    }
  }

  // Sort by score (descending) and return items
  return results
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}

function handlePaginate(data) {
  const { items, page = 1, pageSize = 10 } = data;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    hasNext: endIndex < items.length,
    hasPrev: page > 1,
  };
}

function handleBulkOperation(data) {
  const { items, operations } = data;
  let result = [...items];

  for (const op of operations) {
    switch (op.type) {
      case 'filter':
        result = handleFilter({ items: result, ...op });
        break;
      case 'sort':
        result = handleSort({ items: result, ...op });
        break;
      case 'map':
        result = result.map(op.fn);
        break;
      case 'reduce':
        result = [result.reduce(op.fn, op.initial)];
        break;
    }
  }

  return result;
}

// ============================================================================
// Market-Specific Handlers
// ============================================================================

function handleMarketFilter(data) {
  const { markets, filters } = data;

  return markets.filter(market => {
    // Category filter
    if (filters.categories?.length > 0) {
      if (!market.category || !filters.categories.includes(market.category)) {
        return false;
      }
    }

    // Status filter
    if (filters.statuses?.length > 0) {
      if (!market.status || !filters.statuses.includes(market.status)) {
        return false;
      }
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const price = market.currentPrice ?? market.price ?? 0;
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    // Volume filter
    if (filters.minVolume !== undefined) {
      const volume = market.volume24h ?? market.volume ?? 0;
      if (volume < filters.minVolume) return false;
    }

    // Liquidity filter
    if (filters.minLiquidity !== undefined) {
      const liquidity = market.liquidity ?? market.orderBook?.liquidity ?? 0;
      if (liquidity < filters.minLiquidity) return false;
    }

    // End date filter
    if (filters.endDateBefore) {
      if (market.endDate && new Date(market.endDate) > new Date(filters.endDateBefore)) {
        return false;
      }
    }

    if (filters.endDateAfter) {
      if (market.endDate && new Date(market.endDate) < new Date(filters.endDateAfter)) {
        return false;
      }
    }

    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = [
        market.question,
        market.description,
        market.category,
        market.tags?.join(' ') ?? '',
      ].join(' ').toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Favorites only
    if (filters.favoritesOnly && !market.isFavorite) {
      return false;
    }

    return true;
  });
}

function handleMarketSort(data) {
  const { markets, sortBy, order = 'desc' } = data;
  const multiplier = order === 'desc' ? -1 : 1;

  return [...markets].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'volume':
        aValue = a.volume24h ?? a.volume ?? 0;
        bValue = b.volume24h ?? b.volume ?? 0;
        break;
      case 'liquidity':
        aValue = a.liquidity ?? a.orderBook?.liquidity ?? 0;
        bValue = b.liquidity ?? b.orderBook?.liquidity ?? 0;
        break;
      case 'endDate':
        aValue = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        bValue = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        break;
      case 'created':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      case 'price':
      default:
        aValue = a.currentPrice ?? a.price ?? 0;
        bValue = b.currentPrice ?? b.price ?? 0;
        break;
    }

    if (aValue === bValue) return 0;
    return (aValue - bValue) * multiplier;
  });
}

function handleMarketAggregate(data) {
  const { markets, groupBy } = data;
  const groups = new Map();

  for (const market of markets) {
    const key = groupBy === 'category' ? market.category : 'All';

    if (!groups.has(key)) {
      groups.set(key, {
        count: 0,
        totalVolume: 0,
        totalLiquidity: 0,
        avgPrice: 0,
        priceSum: 0,
      });
    }

    const group = groups.get(key);
    group.count++;
    group.totalVolume += market.volume24h ?? market.volume ?? 0;
    group.totalLiquidity += market.liquidity ?? market.orderBook?.liquidity ?? 0;
    group.priceSum += market.currentPrice ?? market.price ?? 0;
  }

  // Calculate averages
  const result = [];
  for (const [key, group] of groups) {
    result.push({
      [groupBy]: key,
      count: group.count,
      totalVolume: group.totalVolume,
      totalLiquidity: group.totalLiquidity,
      avgPrice: group.count > 0 ? group.priceSum / group.count : 0,
    });
  }

  return result;
}

// ============================================================================
// Utilities
// ============================================================================

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value == null) return null;
    value = value[key];
  }

  return value;
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
`;

// ============================================================================
// Types
// ============================================================================

export type FilterOperation = {
  field?: string;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'nin';
  value?: unknown;
  predicate?: string;
};

export type SortOperation = {
  sortBy: string;
  order?: 'asc' | 'desc';
};

export type AggregateOperation = {
  field: string;
  type: 'count' | 'sum' | 'avg' | 'mean' | 'min' | 'max' | 'first' | 'last' | 'unique' | 'uniqueCount';
  as?: string;
};

export type MarketFilters = {
  categories?: string[];
  statuses?: string[];
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minLiquidity?: number;
  endDateBefore?: string;
  endDateAfter?: string;
  query?: string;
  favoritesOnly?: boolean;
};

export type MarketSortBy = 'volume' | 'liquidity' | 'endDate' | 'created' | 'price';

export type PaginationResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ============================================================================
// Message Types
// ============================================================================

export type DataWorkerMessageType =
  | 'filter'
  | 'sort'
  | 'aggregate'
  | 'transform'
  | 'group'
  | 'search'
  | 'paginate'
  | 'bulkOperation'
  | 'marketFilter'
  | 'marketSort'
  | 'marketAggregate';

export type DataWorkerMessage = {
  filter: { items: unknown[] } & FilterOperation;
  sort: { items: unknown[] } & SortOperation;
  aggregate: { items: unknown[]; operations: AggregateOperation[] };
  transform: { items: unknown[]; transform?: string; mappings?: Record<string, string> };
  group: { items: unknown[]; groupBy: string; aggregate?: AggregateOperation[] };
  search: { items: unknown[]; query: string; fields?: string[]; fuzzy?: boolean; limit?: number };
  paginate: { items: unknown[]; page?: number; pageSize?: number };
  bulkOperation: { items: unknown[]; operations: unknown[] };
  marketFilter: { markets: unknown[]; filters: MarketFilters };
  marketSort: { markets: unknown[]; sortBy: MarketSortBy; order?: 'asc' | 'desc' };
  marketAggregate: { markets: unknown[]; groupBy?: string };
};

export type DataWorkerResponse<T = unknown> = T;

export default DATA_WORKER_SCRIPT;

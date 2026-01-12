/**
 * Category Mapper
 *
 * Maps Gamma API categories to UI-friendly category names.
 * The Gamma API returns categories like "US-current-affairs", "Tech", etc.
 * We map these to our UI categories: "Politics", "Technology", etc.
 */

/**
 * Mapping of Gamma API categories to UI categories
 */
const GAMMA_TO_UI_CATEGORY: Record<string, string> = {
  // Politics
  'US-current-affairs': 'Politics',
  'Politics': 'Politics',
  'Elections': 'Politics',
  'Government': 'Politics',

  // Technology
  'Tech': 'Technology',
  'Technology': 'Technology',
  'AI': 'Technology',
  'Software': 'Technology',

  // Crypto
  'Crypto': 'Crypto',
  'Blockchain': 'Crypto',
  'Bitcoin': 'Crypto',
  'DeFi': 'Crypto',
  'NFT': 'Crypto',
  'Web3': 'Crypto',

  // Economics
  'Economics': 'Economics',
  'Finance': 'Economics',
  'Markets': 'Economics',
  'Business': 'Economics',

  // Sports
  'Sports': 'Sports',
  'ESports': 'Sports',
  'Football': 'Sports',
  'Basketball': 'Sports',
  'Baseball': 'Sports',

  // Entertainment
  'Entertainment': 'Entertainment',
  'Movies': 'Entertainment',
  'TV': 'Entertainment',
  'Music': 'Entertainment',
  'Awards': 'Entertainment',

  // Science
  'Science': 'Science',
  'Climate': 'Science',
  'Space': 'Science',
  'Health': 'Science',
  'Medicine': 'Science',

  // World Events
  'World': 'World Events',
  'International': 'World Events',
  'Geopolitics': 'World Events',
  'War': 'World Events',
}

/**
 * Map a Gamma API category to a UI category
 *
 * @param gammaCategory - Category from Gamma API
 * @returns UI-friendly category name, or "General" if no mapping exists
 *
 * @example
 * ```ts
 * mapGammaCategoryToUI('US-current-affairs') // Returns 'Politics'
 * mapGammaCategoryToUI('Tech') // Returns 'Technology'
 * mapGammaCategoryToUI('Unknown') // Returns 'General'
 * ```
 */
export function mapGammaCategoryToUI(gammaCategory: string | null | undefined): string {
  if (!gammaCategory) {
    return 'General'
  }

  // Try exact match first
  if (GAMMA_TO_UI_CATEGORY[gammaCategory]) {
    return GAMMA_TO_UI_CATEGORY[gammaCategory]
  }

  // Try partial match (case-insensitive)
  const gammaLower = gammaCategory.toLowerCase()
  for (const [gamma, ui] of Object.entries(GAMMA_TO_UI_CATEGORY)) {
    if (gamma.toLowerCase() === gammaLower) {
      return ui
    }
  }

  // Check if it contains any known keyword
  if (gammaLower.includes('politic') || gammaLower.includes('election') || gammaLower.includes('government')) {
    return 'Politics'
  }
  if (gammaLower.includes('tech') || gammaLower.includes('soft') || gammaLower.includes('ai')) {
    return 'Technology'
  }
  if (gammaLower.includes('crypto') || gammaLower.includes('blockchain') || gammaLower.includes('bitcoin') || gammaLower.includes('defi')) {
    return 'Crypto'
  }
  if (gammaLower.includes('econom') || gammaLower.includes('financ') || gammaLower.includes('market') || gammaLower.includes('business')) {
    return 'Economics'
  }
  if (gammaLower.includes('sport') || gammaLower.includes('esport') || gammaLower.includes('game')) {
    return 'Sports'
  }
  if (gammaLower.includes('entert') || gammaLower.includes('movie') || gammaLower.includes('tv') || gammaLower.includes('music')) {
    return 'Entertainment'
  }
  if (gammaLower.includes('science') || gammaLower.includes('climat') || gammaLower.includes('space') || gammaLower.includes('health')) {
    return 'Science'
  }
  if (gammaLower.includes('world') || gammaLower.includes('internat') || gammaLower.includes('geopolit') || gammaLower.includes('war')) {
    return 'World Events'
  }

  // Default fallback
  return 'General'
}

/**
 * Get all available UI categories
 */
export function getUICategories(): string[] {
  return [
    'All',
    'Politics',
    'Sports',
    'Crypto',
    'Economics',
    'Technology',
    'Entertainment',
    'Science',
    'World Events',
  ]
}

/**
 * Map UI category to Gamma API tag_slug
 *
 * Maps our UI category names to the corresponding tag_slug parameter
 * that the Gamma API expects for filtering.
 *
 * @param uiCategory - UI category name (e.g., "Politics", "Sports")
 * @returns Gamma API tag_slug, or undefined for "All"
 *
 * @example
 * ```ts
 * mapUIToGammaTagSlug('Politics') // Returns 'politics'
 * mapUIToGammaTagSlug('Crypto') // Returns 'crypto'
 * mapUIToGammaTagSlug('All') // Returns undefined
 * ```
 */
export function mapUIToGammaTagSlug(uiCategory: string): string | undefined {
  const categoryMap: Record<string, string> = {
    'politics': 'politics',
    'sports': 'sports',
    'crypto': 'crypto',
    'economics': 'economics',
    'technology': 'tech',
    'entertainment': 'entertainment',
    'science': 'science',
    'world events': 'world-events',
  }

  return categoryMap[uiCategory.toLowerCase()]
}

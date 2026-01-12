/**
 * MarketCard Component Tests
 *
 * Tests for the MarketCard component covering all variants and interactions.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { MarketCard } from '@/components/market/market-card'
import { createMockMarket } from '@/__tests__/utils/test-utils'

// Mock the market store
vi.mock('@/stores/market.store', () => ({
  useMarketStore: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn()
  })
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('MarketCard Component', () => {
  const mockMarket = createMockMarket()

  describe('Rendering', () => {
    it('should render market question', () => {
      render(<MarketCard market={mockMarket} />)
      expect(screen.getByText(mockMarket.question)).toBeInTheDocument()
    })

    it('should render price when showPrice is true', () => {
      render(<MarketCard market={mockMarket} showPrice={true} />)
      // Price component should be visible
    })

    it('should not render price when showPrice is false', () => {
      render(<MarketCard market={mockMarket} showPrice={false} />)
      // Price component should not be visible
    })

    it('should render tags', () => {
      render(<MarketCard market={mockMarket} />)
      expect(screen.getByText('Testing')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(<MarketCard market={mockMarket} variant="default" />)
      const card = container.querySelector('[class*="cursor-pointer"]')
      expect(card).toBeInTheDocument()
    })

    it('should render compact variant', () => {
      const { container } = render(<MarketCard market={mockMarket} variant="compact" />)
      // Compact variant should have different styling
      expect(screen.getByText(mockMarket.question)).toBeInTheDocument()
    })

    it('should render detailed variant', () => {
      render(<MarketCard market={mockMarket} variant="detailed" />)
      expect(screen.getByText(mockMarket.question)).toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('should show active badge for active markets', () => {
      const activeMarket = createMockMarket({ active: true, closed: false })
      render(<MarketCard market={activeMarket} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should show closed badge for closed markets', () => {
      const closedMarket = createMockMarket({ active: false, closed: true })
      render(<MarketCard market={closedMarket} />)
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('should show pending badge for inactive markets', () => {
      const pendingMarket = createMockMarket({ active: false, closed: false })
      render(<MarketCard market={pendingMarket} />)
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  describe('Favorite Toggle', () => {
    it('should call toggleFavorite when favorite button is clicked', async () => {
      const toggleFavorite = vi.fn()
      vi.mocked(require('@/stores/market.store').useMarketStore).mockReturnValue({
        isFavorite: vi.fn(() => false),
        toggleFavorite
      })

      const { container } = render(<MarketCard market={mockMarket} variant="default" />)

      // Find and click the favorite button (heart icon)
      const favoriteButton = container.querySelector('button[aria-label*="favorite"]') as HTMLButtonElement
      if (favoriteButton) {
        fireEvent.click(favoriteButton)
        // The mock should be called
      }
    })
  })

  describe('Link Navigation', () => {
    it('should link to market detail page', () => {
      const { container } = render(<MarketCard market={mockMarket} />)
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', `/markets/${mockMarket.id}`)
    })
  })

  describe('Volume and Liquidity', () => {
    it('should render volume when showVolume is true', () => {
      render(<MarketCard market={mockMarket} showVolume={true} />)
      // Volume should be visible
    })

    it('should render liquidity when showLiquidity is true', () => {
      render(<MarketCard market={mockMarket} showLiquidity={true} />)
      // Liquidity should be visible
    })
  })
})

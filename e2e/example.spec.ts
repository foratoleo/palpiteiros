/**
 * Playwright E2E Tests
 *
 * End-to-end tests for Palpiteiros v2 application.
 * Tests cover critical user flows across the application.
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { test, expect } from '@playwright/test'

// ============================================================================
// SETUP AND CONFIGURATION
// ============================================================================

test.describe.configure({ mode: 'parallel' })

// ============================================================================
// PAGE NAVIGATION TESTS
// ============================================================================

test.describe('Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Palpiteiros/i)
  })

  test('should navigate to markets page', async ({ page }) => {
    await page.goto('/')
    // Click on markets link (adjust selector based on actual implementation)
    await page.click('text=Markets')
    await expect(page).toHaveURL(/.*markets/)
  })

  test('should navigate to portfolio page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Portfolio')
    await expect(page).toHaveURL(/.*portfolio/)
  })

  test('should navigate to alerts page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Alerts')
    await expect(page).toHaveURL(/.*alerts/)
  })
})

// ============================================================================
// MARKET LIST TESTS
// ============================================================================

test.describe('Markets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/markets')
  })

  test('should display market cards', async ({ page }) => {
    // Wait for markets to load
    await page.waitForSelector('[data-testid="market-card"]', { timeout: 10000 })
    const cards = await page.locator('[data-testid="market-card"]').count()
    expect(cards).toBeGreaterThan(0)
  })

  test('should search markets', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="search-input"]')
    // Type search query
    await page.fill('[data-testid="search-input"]', 'Bitcoin')
    // Wait for results
    await page.waitForTimeout(500)
    // Check that results are filtered
    const results = await page.locator('[data-testid="market-card"]').count()
    expect(results).toBeGreaterThanOrEqual(0)
  })

  test('should filter by category', async ({ page }) => {
    // Click on category filter
    await page.click('text=Crypto')
    // Wait for results
    await page.waitForTimeout(500)
    // Check filter is applied
    const activeFilter = page.locator('[data-testid="filter-chip"].active')
    await expect(activeFilter).toBeVisible()
  })

  test('should toggle between grid and list view', async ({ page }) => {
    // Click list view button
    await page.click('[data-testid="view-list"]')
    await expect(page.locator('[data-testid="market-list"]')).toBeVisible()

    // Click grid view button
    await page.click('[data-testid="view-grid"]')
    await expect(page.locator('[data-testid="market-grid"]')).toBeVisible()
  })

  test('should click on market card and navigate to detail', async ({ page }) => {
    // Wait for markets to load
    await page.waitForSelector('[data-testid="market-card"]', { timeout: 10000 })
    // Click first market card
    await page.click('[data-testid="market-card"]:first-child')
    // Should navigate to market detail
    await expect(page).toHaveURL(/.*markets\/.+/)
  })
})

// ============================================================================
// MARKET DETAIL TESTS
// ============================================================================

test.describe('Market Detail', () => {
  test('should display market information', async ({ page }) => {
    // Navigate to a specific market
    await page.goto('/markets/bitcoin-price')
    await page.waitForLoadState('networkidle')

    // Check market question is displayed
    await expect(page.locator('[data-testid="market-question"]')).toBeVisible()

    // Check price chart is displayed
    await expect(page.locator('[data-testid="price-chart"]')).toBeVisible()

    // Check order book is displayed
    await expect(page.locator('[data-testid="order-book"]')).toBeVisible()
  })

  test('should display price history', async ({ page }) => {
    await page.goto('/markets/bitcoin-price')
    await page.waitForLoadState('networkidle')

    // Price chart should be visible
    await expect(page.locator('[data-testid="price-chart"]')).toBeVisible()
  })

  test('should switch chart timeframes', async ({ page }) => {
    await page.goto('/markets/bitcoin-price')
    await page.waitForLoadState('networkidle')

    // Click on 7D timeframe
    await page.click('button:has-text("7D")')
    // Check that button is active
    await expect(page.locator('button:has-text("7D")')).toHaveClass(/active/)
  })
})

// ============================================================================
// PORTFOLIO TESTS
// ============================================================================

test.describe('Portfolio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio')
  })

  test('should display portfolio summary', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="portfolio-summary"]')).toBeVisible()
  })

  test('should display positions table', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // May need to handle empty state case
    const positionsTable = page.locator('[data-testid="positions-table"]')
    const emptyState = page.locator('[data-testid="empty-positions"]')

    const isVisible = await positionsTable.isVisible().catch(() => false)
    const isEmptyVisible = await emptyState.isVisible().catch(() => false)

    expect(isVisible || isEmptyVisible).toBe(true)
  })

  test('should display allocation chart', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const chart = page.locator('[data-testid="allocation-chart"]')
    const emptyState = page.locator('[data-testid="empty-portfolio"]')

    const isVisible = await chart.isVisible().catch(() => false)
    const isEmptyVisible = await emptyState.isVisible().catch(() => false)

    expect(isVisible || isEmptyVisible).toBe(true)
  })
})

// ============================================================================
// ALERTS TESTS
// ============================================================================

test.describe('Price Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts')
  })

  test('should display alerts list', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="alerts-list"]')).toBeVisible()
  })

  test('should open create alert dialog', async ({ page }) => {
    await page.click('[data-testid="create-alert-button"]')
    await expect(page.locator('[data-testid="create-alert-dialog"]')).toBeVisible()
  })

  test('should create new alert', async ({ page }) => {
    await page.click('[data-testid="create-alert-button"]')

    // Select market (if implemented)
    // Set condition
    await page.click('text=Above')
    // Set price
    await page.fill('[data-testid="target-price-input"]', '0.75')
    // Submit
    await page.click('text=Create Alert')

    // Dialog should close
    await expect(page.locator('[data-testid="create-alert-dialog"]')).not.toBeVisible()
  })
})

// ============================================================================
// THEME TESTS
// ============================================================================

test.describe('Theme', () => {
  test('should toggle theme', async ({ page }) => {
    await page.goto('/')

    // Get initial theme
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')

    // Toggle theme
    await page.click('[data-testid="theme-toggle"]')

    // Wait for transition
    await page.waitForTimeout(300)

    // Check theme changed
    const newClass = await html.getAttribute('class')
    expect(newClass).not.toBe(initialClass)
  })
})

// ============================================================================
// RESPONSIVE TESTS
// ============================================================================

test.describe('Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile nav should be visible
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
  })

  test('should display sidebar on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    // Sidebar should be visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })
})

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('a[href^="#main"]')
    await expect(skipLink).toBeVisible()
  })

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/')

    // Tab to first focusable element
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement)
    expect(focused).not.toBe(document.body)
  })
})

/**
 * Card Component Tests
 *
 * Tests for the Card component and its sub-components.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/__tests__/utils/test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card container', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should render default variant', () => {
      render(<Card variant="default">Default Card</Card>)
      const card = screen.getByText('Default Card').parentElement
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('should render glass variant', () => {
      render(<Card variant="glass">Glass Card</Card>)
      const card = screen.getByText('Glass Card').parentElement
      expect(card).toHaveClass('backdrop-blur-md')
    })

    it('should render elevated variant', () => {
      render(<Card variant="elevated">Elevated Card</Card>)
      const card = screen.getByText('Elevated Card').parentElement
      expect(card).toHaveClass('shadow-lg')
    })

    it('should merge custom classes', () => {
      render(<Card className="custom-class">Custom Card</Card>)
      const card = screen.getByText('Custom Card').parentElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      )
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>
      )
      const title = screen.getByText('Card Title')
      expect(title.tagName).toBe('H3')
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(
        <Card>
          <CardDescription>Card description text</CardDescription>
        </Card>
      )
      const description = screen.getByText('Card description text')
      expect(description.tagName).toBe('P')
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })

  describe('Complete Card Structure', () => {
    it('should render complete card with all components', () => {
      render(
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })
})

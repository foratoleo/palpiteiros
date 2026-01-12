/**
 * Next.js 15 Not Found Page
 *
 * Custom 404 page for undefined routes.
 * Replaces the default Next.js 404 page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

"use client";

export const dynamic = 'force-dynamic';

import { NotFoundPage } from '@/components/errors/error-page'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

// ============================================================================
// NOT FOUND PAGE COMPONENT
// ============================================================================

/**
 * Not Found Page
 *
 * Displayed when a route is not found (404 error).
 * This file is required to override the default Next.js 404 page.
 */
export default function NotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showBack={true}
      showRefresh={false}
      showHome={true}
      actions={[
        {
          label: 'Go to Markets',
          onClick: () => (window.location.href = '/markets'),
          variant: 'outline',
          icon: <Home className="h-4 w-4" />
        }
      ]}
      supportEmail="support@palpiteiros.com"
      githubUrl="https://github.com/palpiteiros/palpiteiros-v2/issues"
      docsUrl="https://docs.palpiteiros.com"
    >
      {/* Additional helpful links */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <p className="text-sm text-muted-foreground">You might be looking for:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/markets">Markets</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portfolio">Portfolio</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/alerts">Alerts</Link>
          </Button>
        </div>
      </div>
    </NotFoundPage>
  )
}

// ============================================================================
// TRIGGERING NOT FOUND
// ============================================================================

/**
 * To programmatically trigger the not-found page:
 *
 * import { notFound } from 'next/navigation'
 *
 * async function fetchData(id: string) {
 *   const res = await fetch(`https://api.example.com/items/${id}`)
 *   if (!res.ok) {
 *     notFound() // Triggers not-found.tsx
 *   }
 *   return res.json()
 * }
 */

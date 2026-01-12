import { NextRequest, NextResponse } from 'next/server'

const GAMMA_API_URL = 'https://gamma-api.polymarket.com'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gammaUrl = new URL('/markets', GAMMA_API_URL)
    searchParams.forEach((value, key) => {
      gammaUrl.searchParams.append(key, value)
    })

    console.log('[API Proxy] Fetching from Gamma API:', gammaUrl.toString())

    const response = await fetch(gammaUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Palpiteiros-v2/1.0'
      }
    })

    if (!response.ok) {
      console.error('[API Proxy] Gamma API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Gamma API error', status: response.status, message: response.statusText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[API Proxy] Success:', data.length, 'markets')

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('[API Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

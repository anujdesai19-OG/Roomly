import { NextRequest, NextResponse } from 'next/server'
import type { RoomType } from '@/types/session'

// Stub: always returns a 2 bed / 2 bath layout.
// In a real implementation this would query a property data API.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address: string = body.address ?? ''

    // Small artificial delay to simulate network call
    await new Promise((r) => setTimeout(r, 300))

    const defaultRooms: RoomType[] = ['LIVING_ROOM', 'BEDROOM']

    return NextResponse.json({
      beds: 2,
      baths: 2,
      estimatedSqft: null,
      rooms: defaultRooms,
      source: 'stub',
      address,
    })
  } catch {
    return NextResponse.json({ error: 'Address lookup failed' }, { status: 500 })
  }
}

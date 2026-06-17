import { NextResponse } from 'next/server'

// the8_world_map was replaced by the8_maps in v2. See /api/the8adventurers/maps.
export async function GET() {
  return NextResponse.json({ error: 'Deprecated — use /api/the8adventurers/maps' }, { status: 410 })
}

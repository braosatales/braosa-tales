import { NextResponse } from 'next/server'

// Replaced by /api/the8adventurers/maps (POST with FormData) in v2.
export async function POST() {
  return NextResponse.json({ error: 'Deprecated — use /api/the8adventurers/maps' }, { status: 410 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Deprecated — use /api/the8adventurers/maps' }, { status: 410 })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { contractId1, contractId2 } = await req.json()

    // Fetch both contracts with their analyses
    const { data: contract1 } = await supabase
      .from('contracts')
      .select('*, analyses(*)')
      .eq('id', contractId1)
      .single()

    const { data: contract2 } = await supabase
      .from('contracts')
      .select('*, analyses(*)')
      .eq('id', contractId2)
      .single()

    if (!contract1 || !contract2) {
      return NextResponse.json({ error: 'One or both contracts not found' }, { status: 404 })
    }

    if (!contract1.analyses?.length || !contract2.analyses?.length) {
      return NextResponse.json({ error: 'Both contracts must be analyzed first' }, { status: 400 })
    }

    return NextResponse.json({
      contract1: {
        id: contract1.id,
        filename: contract1.filename,
        analysis: contract1.analyses[0],
      },
      contract2: {
        id: contract2.id,
        filename: contract2.filename,
        analysis: contract2.analyses[0],
      },
    })
  } catch (err) {
    console.error('Compare error:', err)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
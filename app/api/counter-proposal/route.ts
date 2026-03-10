import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCounterProposal } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { contractId } = await req.json()

    const { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('contract_id', contractId)
      .single()

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const counterProposal = await generateCounterProposal(analysis.clauses)

    return NextResponse.json({ success: true, counterProposal })
  } catch (err) {
    console.error('Counter proposal error:', err)
    return NextResponse.json({ error: 'Failed to generate counter proposal' }, { status: 500 })
  }
}
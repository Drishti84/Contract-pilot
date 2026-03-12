import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCounterProposal } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { contractId } = await req.json()

    const { data: analyses, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('contract_id', contractId)
      .limit(1)

    if (analysisError) {
      return NextResponse.json({ error: analysisError.message }, { status: 500 })
    }

    const analysis = analyses?.[0]

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const counterProposal = await generateCounterProposal(analysis.clauses)

    return NextResponse.json({ success: true, counterProposal })
  } catch (err) {
    console.error('Counter proposal error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate counter proposal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

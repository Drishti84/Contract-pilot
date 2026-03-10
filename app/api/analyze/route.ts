import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analyzeContract } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { contractId } = await req.json()

    if (!contractId) {
      return NextResponse.json({ error: 'No contract ID provided' }, { status: 400 })
    }

    // Fetch contract text from Supabase
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (!contract.raw_text) {
      return NextResponse.json({ error: 'No text found in contract' }, { status: 400 })
    }

    // Call Claude API
    const analysis = await analyzeContract(contract.raw_text)

    // Save analysis to Supabase
    const { error: insertError } = await supabase
      .from('analyses')
      .insert({
        contract_id: contractId,
        overall_score: analysis.overall_score,
        summary: analysis.summary,
        clauses: analysis.clauses
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update contract status to analyzed
    await supabase
      .from('contracts')
      .update({ status: 'analyzed' })
      .eq('id', contractId)

    return NextResponse.json({ success: true, analysis })

  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
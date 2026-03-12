'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ContractAnalysis } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import SideBySideView from '@/components/SideBySideView'

export default function ContractPage() {
  const { id } = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [rawText, setRawText] = useState('')
  const [filename, setFilename] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      // Fetch contract
      const { data: contract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single()

      if (!contract) { setError('Contract not found'); setLoading(false); return }

      setRawText(contract.raw_text || '')
      setFilename(contract.filename || '')

      // If already analyzed, fetch existing analysis
      if (contract.status === 'analyzed') {
        const { data: existingAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .eq('contract_id', id)
          .limit(1)

        const existingAnalysis = existingAnalyses?.[0]

        if (existingAnalysis) {
          setAnalysis({
            overall_score: existingAnalysis.overall_score,
            summary: existingAnalysis.summary,
            clauses: existingAnalysis.clauses,
          })
          setLoading(false)
          return
        }
      }

      // Otherwise run analysis
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: id }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); return }
        setAnalysis(data.analysis)
      } catch {
        setError('Analysis failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="text-6xl animate-spin">⚙️</div>
        <p className="text-xl font-semibold text-gray-700">Analyzing your contract...</p>
        <p className="text-gray-400 text-sm">AI is reviewing clauses. This takes ~15 seconds.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-lg font-medium">⚠️ {error}</p>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 underline text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <h1 className="text-xl font-bold text-gray-900">ContractPilot</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
  {/* Counter Proposal Button */}
  <div className="flex justify-end">
    <button
      onClick={() => router.push(`/counter-proposal/${id}`)}
      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition text-sm flex items-center gap-2"
    >
      ✍️ Generate Counter-Proposal
    </button>
  </div>

  <SideBySideView
    rawText={rawText}
    analysis={analysis}
    filename={filename}
  />
</div>
    </main>
  )
}

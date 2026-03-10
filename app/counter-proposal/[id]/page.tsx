'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RiskBadge from '@/components/RiskBadge'
import { RiskLevel } from '@/lib/types'

export default function CounterProposalPage() {
  const { id } = useParams()
  const router = useRouter()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/counter-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: id }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setProposals(data.counterProposal)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="text-5xl animate-spin">✍️</div>
        <p className="text-xl font-semibold text-gray-700">Generating counter-proposal...</p>
        <p className="text-gray-400 text-sm">AI is rewriting risky clauses in your favour.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-lg">⚠️ {error}</p>
          <button onClick={() => router.back()} className="text-blue-600 underline text-sm">← Go back</button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <h1 className="text-xl font-bold text-gray-900">ContractPilot</h1>
        </div>
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
          ← Back to Analysis
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Title */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
          <h2 className="text-3xl font-black text-blue-900">✍️ Counter-Proposal</h2>
          <p className="text-blue-700 mt-2">
            These are AI-rewritten versions of your risky clauses — freelancer-friendly alternatives you can propose to the client.
          </p>
          <p className="text-blue-500 text-sm mt-2 font-medium">
            {proposals.length} clauses rewritten
          </p>
        </div>

        {/* Clause rewrites */}
        <div className="space-y-6">
          {proposals.map((proposal, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <span className="font-bold text-gray-900">{proposal.type}</span>
                <RiskBadge risk={proposal.risk as RiskLevel} />
              </div>

              <div className="p-6 space-y-6">
                {/* Original */}
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">
                    ❌ Original (Risky)
                  </p>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <p className="text-sm text-red-900 italic leading-relaxed">
                      "{proposal.original}"
                    </p>
                  </div>
                </div>

                {/* Rewritten */}
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
                    ✅ Suggested Replacement (Freelancer-Friendly)
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 leading-relaxed font-medium">
                      "{proposal.rewritten}"
                    </p>
                  </div>
                </div>

                {/* What changed */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    💡 What changed & why
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{proposal.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Important Disclaimer</p>
          <p>This counter-proposal is AI-generated and for informational purposes only. Always consult a qualified lawyer before signing or sending contract modifications.</p>
        </div>
      </div>
    </main>
  )
}
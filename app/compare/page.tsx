'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import RiskBadge from '@/components/RiskBadge'
import { Clause, RiskLevel } from '@/lib/types'

const CLAUSE_TYPES = [
  'Payment Terms',
  'IP Rights',
  'Termination',
  'Liability',
  'Non-Compete',
  'Confidentiality',
]

const riskScore = { Low: 1, Medium: 2, High: 3 }

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const id1 = searchParams.get('id1')
  const id2 = searchParams.get('id2')

  useEffect(() => {
    const load = async () => {
      if (!id1 || !id2) { setError('Two contract IDs required'); setLoading(false); return }

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId1: id1, contractId2: id2 }),
      })
      const result = await res.json()
      if (result.error) { setError(result.error); setLoading(false); return }
      setData(result)
      setLoading(false)
    }
    load()
  }, [id1, id2])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="text-5xl animate-spin">⚙️</div>
        <p className="text-xl font-semibold text-gray-700">Comparing contracts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-lg">⚠️ {error}</p>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 underline text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { contract1, contract2 } = data

  const getClauseByType = (clauses: Clause[], type: string) =>
    clauses.find((c) => c.type === type)

  const overallWinner = () => {
    const score1 = riskScore[contract1.analysis.overall_score as RiskLevel]
    const score2 = riskScore[contract2.analysis.overall_score as RiskLevel]
    if (score1 < score2) return 1
    if (score2 < score1) return 2
    return 0
  }

  const winner = overallWinner()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <h1 className="text-xl font-bold text-gray-900">ContractPilot</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        <div>
          <h2 className="text-3xl font-bold text-gray-900">Contract Comparison</h2>
          <p className="text-gray-500 mt-1">Side-by-side risk analysis of two contracts</p>
        </div>

        {/* Winner Banner */}
        {winner !== 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-500 font-semibold uppercase tracking-widest mb-1">Better Contract</p>
            <p className="text-2xl font-black text-blue-900">
              🏆 {winner === 1 ? contract1.filename : contract2.filename}
            </p>
            <p className="text-blue-600 text-sm mt-1">has lower overall risk for you as a freelancer</p>
          </div>
        )}
        {winner === 0 && (
          <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-xl font-bold text-gray-700">🤝 Both contracts have equal overall risk</p>
          </div>
        )}

        {/* Overall Score Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {[contract1, contract2].map((c, i) => {
            const bgMap = { Low: 'bg-green-50 border-green-300', Medium: 'bg-yellow-50 border-yellow-300', High: 'bg-red-50 border-red-300' }
            const textMap = { Low: 'text-green-900', Medium: 'text-yellow-900', High: 'text-red-900' }
            const score = c.analysis.overall_score as RiskLevel
            return (
              <div key={i} className={`rounded-xl border-2 p-6 ${bgMap[score]}`}>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Contract {i + 1}</p>
                <p className={`font-bold text-lg truncate ${textMap[score]}`}>📄 {c.filename}</p>
                <div className="mt-3">
                  <RiskBadge risk={score} />
                </div>
                <p className={`text-sm mt-3 opacity-80 leading-relaxed ${textMap[score]}`}>
                  {c.analysis.summary}
                </p>
              </div>
            )
          })}
        </div>

        {/* Clause by Clause Comparison */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Clause-by-Clause Breakdown</h3>
          <div className="space-y-3">
            {CLAUSE_TYPES.map((type) => {
              const c1clause = getClauseByType(contract1.analysis.clauses, type)
              const c2clause = getClauseByType(contract2.analysis.clauses, type)

              if (!c1clause && !c2clause) return null

              const s1 = c1clause ? riskScore[c1clause.risk] : 0
              const s2 = c2clause ? riskScore[c2clause.risk] : 0
              const clauseWinner = s1 < s2 ? 1 : s2 < s1 ? 2 : 0

              return (
                <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Clause Type Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{type}</span>
                    {clauseWinner !== 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        🏆 Contract {clauseWinner} is better here
                      </span>
                    )}
                    {clauseWinner === 0 && c1clause && c2clause && (
                      <span className="text-xs text-gray-400">Equal risk</span>
                    )}
                  </div>

                  {/* Two columns */}
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    {[c1clause, c2clause].map((clause, i) => (
                      <div key={i} className="p-5 space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Contract {i + 1}
                        </p>
                        {clause ? (
                          <>
                            <RiskBadge risk={clause.risk} />
                            <p className="text-xs text-gray-500 italic leading-relaxed">
                              "{clause.excerpt}"
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {clause.explanation}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            No {type} clause found
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
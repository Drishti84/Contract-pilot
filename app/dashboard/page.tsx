'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ContractUploader from '@/components/ContractUploader'
import { supabase } from '@/lib/supabase'
import RiskBadge from '@/components/RiskBadge'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    const fetchContracts = async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, analyses(overall_score)')
        .eq('user_id', session?.user?.email)
        .order('uploaded_at', { ascending: false })
      if (!error && data) setContracts(data)
      setLoading(false)
    }
    if (status === 'authenticated') fetchContracts()
  }, [status])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev
    )
  }

  const handleCompare = () => {
    if (selected.length === 2) {
      router.push(`/compare?id1=${selected[0]}&id2=${selected[1]}`)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <h1 className="text-xl font-bold text-gray-900">ContractPilot</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden sm:block">{session?.user?.email}</span>
          <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-800 transition">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Top */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Contracts</h2>
            <p className="text-gray-500 mt-1">Upload a PDF to get an instant AI risk analysis</p>
          </div>
          <div className="flex gap-3">
            {/* Compare button — only shows when 2 selected */}
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition text-sm"
              >
                ⚖️ Compare Selected ({selected.length}/2)
              </button>
            )}
            {selected.length === 1 && (
              <div className="flex items-center px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 font-medium">
                ✓ 1 selected — pick one more to compare
              </div>
            )}
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              + Upload Contract
            </button>
          </div>
        </div>

        {/* Uploader */}
        {showUploader && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <ContractUploader />
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-500 font-medium">No contracts yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first contract to get started</p>
          </div>
        ) : (
          <>
            {selected.length > 0 && (
              <p className="text-sm text-purple-600 font-medium">
                ☑ Select exactly 2 analyzed contracts to compare them
              </p>
            )}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Filename</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Uploaded</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Risk</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, i) => {
                    const isSelected = selected.includes(contract.id)
                    const isAnalyzed = contract.status === 'analyzed'
                    return (
                      <tr
                        key={contract.id}
                        className={`border-b border-gray-100 transition ${
                          isSelected
                            ? 'bg-purple-50'
                            : i % 2 === 0
                            ? 'bg-white hover:bg-blue-50'
                            : 'bg-gray-50/50 hover:bg-blue-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          {isAnalyzed && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(contract.id)}
                              disabled={!isSelected && selected.length >= 2}
                              className="w-4 h-4 accent-purple-600 cursor-pointer disabled:opacity-30"
                            />
                          )}
                        </td>
                        {/* Row — clickable to view */}
                        <td
                          className="px-6 py-4 font-medium text-gray-900 cursor-pointer"
                          onClick={() => router.push(`/contract/${contract.id}`)}
                        >
                          📄 {contract.filename}
                        </td>
                        <td
                          className="px-6 py-4 text-gray-500 cursor-pointer"
                          onClick={() => router.push(`/contract/${contract.id}`)}
                        >
                          {new Date(contract.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isAnalyzed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isAnalyzed ? '✓ Analyzed' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contract.analyses?.[0]?.overall_score ? (
                            <RiskBadge risk={contract.analyses[0].overall_score} />
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td
                          className="px-6 py-4 text-blue-500 text-xs font-medium cursor-pointer"
                          onClick={() => router.push(`/contract/${contract.id}`)}
                        >
                          View →
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

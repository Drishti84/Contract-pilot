'use client'
import { ContractAnalysis } from '@/lib/types'
import ClauseCard from './ClauseCard'
import OverallScoreBanner from './OverallScoreBanner'

interface Props {
  rawText: string
  analysis: ContractAnalysis
  filename: string
}

export default function SideBySideView({ rawText, analysis, filename }: Props) {
  // Highlight clause excerpts in the raw text
  const getHighlightedText = () => {
    let text = rawText

    const highlights: { excerpt: string; color: string }[] = analysis.clauses.map((c) => ({
      excerpt: c.excerpt,
      color:
        c.risk === 'High'
          ? 'bg-red-200'
          : c.risk === 'Medium'
          ? 'bg-yellow-200'
          : 'bg-green-200',
    }))

    // Build HTML with highlights
    let result = text
    highlights.forEach(({ excerpt, color }) => {
      if (!excerpt) return
      const clean = excerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      result = result.replace(
        new RegExp(clean, 'gi'),
        `<mark class="${color} rounded px-0.5">$&</mark>`
      )
    })

    return result
  }

  return (
    <div className="space-y-8">
      {/* Overall Score Banner */}
      <OverallScoreBanner
        score={analysis.overall_score}
        summary={analysis.summary}
        clauseCount={analysis.clauses.length}
      />

      {/* Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Original Contract Text */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">📄 Original Contract</h3>
            <span className="text-xs text-gray-400 truncate max-w-[160px]">{filename}</span>
          </div>
          <div className="p-6 max-h-[700px] overflow-y-auto">
            <div
              className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono"
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
          </div>
          {/* Legend */}
          <div className="px-6 py-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span><mark className="bg-red-200 rounded px-1">■</mark> High Risk</span>
            <span><mark className="bg-yellow-200 rounded px-1">■</mark> Medium Risk</span>
            <span><mark className="bg-green-200 rounded px-1">■</mark> Low Risk</span>
          </div>
        </div>

        {/* Right: AI Clause Analysis */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 px-1">
            🤖 AI Analysis ({analysis.clauses.length} clauses)
          </h3>
          <div className="space-y-4 max-h-[740px] overflow-y-auto pr-1">
            {analysis.clauses.map((clause, i) => (
              <ClauseCard key={i} clause={clause} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
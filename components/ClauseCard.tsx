import { Clause } from '@/lib/types'
import RiskBadge from './RiskBadge'

export default function ClauseCard({ clause }: { clause: Clause }) {
  const borderColors = {
    Low: 'border-l-green-500',
    Medium: 'border-l-yellow-500',
    High: 'border-l-red-500',
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColors[clause.risk]} p-6 space-y-4 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-base">{clause.type}</span>
        <RiskBadge risk={clause.risk} />
      </div>

      {/* Excerpt */}
      <blockquote className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-4 leading-relaxed">
        "{clause.excerpt}"
      </blockquote>

      {/* Explanation */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Why this matters
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{clause.explanation}</p>
      </div>

      {/* Suggestion */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">
          💡 What to negotiate
        </p>
        <p className="text-sm text-blue-900 leading-relaxed">{clause.suggestion}</p>
      </div>
    </div>
  )
}
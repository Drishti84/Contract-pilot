import { RiskLevel } from '@/lib/types'

interface Props {
  score: RiskLevel
  summary: string
  clauseCount: number
}

export default function OverallScoreBanner({ score, summary, clauseCount }: Props) {
  const styles = {
    Low: {
      bg: 'bg-green-50 border-green-300',
      text: 'text-green-900',
      badge: 'bg-green-600',
      icon: '✅',
    },
    Medium: {
      bg: 'bg-yellow-50 border-yellow-300',
      text: 'text-yellow-900',
      badge: 'bg-yellow-500',
      icon: '⚠️',
    },
    High: {
      bg: 'bg-red-50 border-red-300',
      text: 'text-red-900',
      badge: 'bg-red-600',
      icon: '🚨',
    },
  }

  const s = styles[score]

  return (
    <div className={`rounded-2xl border-2 ${s.bg} p-8`}>
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <p className={`text-sm font-semibold uppercase tracking-widest opacity-60 ${s.text}`}>
            Overall Contract Risk
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{s.icon}</span>
            <h2 className={`text-4xl font-black ${s.text}`}>{score} Risk</h2>
          </div>
          <p className={`text-sm opacity-70 ${s.text}`}>
            {clauseCount} clauses analyzed
          </p>
        </div>
      </div>
      <p className={`mt-5 text-base leading-relaxed ${s.text} opacity-90`}>
        {summary}
      </p>
    </div>
  )
}
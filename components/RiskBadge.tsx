import { RiskLevel } from '@/lib/types'

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles = {
    Low: 'bg-green-100 text-green-800 border border-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    High: 'bg-red-100 text-red-800 border border-red-300',
  }

  const icons = {
    Low: '🟢',
    Medium: '🟡',
    High: '🔴',
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${styles[risk]}`}>
      {icons[risk]} {risk} Risk
    </span>
  )
}
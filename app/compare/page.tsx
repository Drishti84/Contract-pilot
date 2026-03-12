import { Suspense } from 'react'
import ComparePageClient from './ComparePageClient'

function ComparePageFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="text-5xl animate-spin">Loading...</div>
      <p className="text-xl font-semibold text-gray-700">Preparing comparison...</p>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageFallback />}>
      <ComparePageClient />
    </Suspense>
  )
}

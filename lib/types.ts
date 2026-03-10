export type RiskLevel = 'Low' | 'Medium' | 'High'

export type ClauseType =
  | 'Payment Terms'
  | 'IP Rights'
  | 'Termination'
  | 'Liability'
  | 'Non-Compete'
  | 'Confidentiality'

export interface Clause {
  type: ClauseType
  risk: RiskLevel
  excerpt: string
  explanation: string
  suggestion: string
}

export interface ContractAnalysis {
  overall_score: RiskLevel
  summary: string
  clauses: Clause[]
}

export interface Contract {
  id: string
  filename: string
  uploaded_at: string
  status: 'pending' | 'analyzed'
  analysis?: ContractAnalysis
}
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const STATIC_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
].filter(Boolean) as string[]

type GeminiModelInfo = {
  name?: string
  supportedGenerationMethods?: string[]
}

async function getApiSupportedModelCandidates() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!res.ok) return []

    const payload = (await res.json()) as { models?: GeminiModelInfo[] }
    const models = payload.models ?? []

    const supported = models
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => model.name?.replace(/^models\//, ''))
      .filter((name): name is string => Boolean(name))

    return supported
  } catch {
    return []
  }
}

function rankModelName(name: string) {
  if (name === 'gemini-2.0-flash') return 1
  if (name === 'gemini-2.0-flash-lite') return 2
  if (name === 'gemini-1.5-flash') return 3
  if (name === 'gemini-1.5-pro') return 4
  if (name.includes('flash')) return 5
  return 10
}

async function generateWithModelFallback(prompt: string) {
  const apiModels = await getApiSupportedModelCandidates()
  const MODEL_CANDIDATES = Array.from(new Set([...STATIC_MODEL_CANDIDATES, ...apiModels])).sort(
    (a, b) => rankModelName(a) - rankModelName(b)
  )

  let text = ''
  let lastError: unknown = null

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      text = result.response.text()
      break
    } catch (err) {
      lastError = err
    }
  }

  if (!text) {
    throw lastError ?? new Error('No Gemini model could generate content')
  }

  return text
}

export async function analyzeContract(contractText: string) {
  const prompt = `You are ContractPilot, an expert legal AI trained to review freelance and agency contracts.

Analyze the following contract and return ONLY a valid JSON object. No explanation, no markdown, no preamble, no backticks.

Identify clauses in these categories:
- Payment Terms
- IP Rights
- Termination
- Liability
- Non-Compete
- Confidentiality

For each clause found, assess risk from the freelancer's perspective.

Return this exact JSON structure:
{
  "overall_score": "Low" or "Medium" or "High",
  "summary": "2-3 sentence plain English summary of the contract biggest risks",
  "clauses": [
    {
      "type": "IP Rights",
      "risk": "High",
      "excerpt": "exact quote from contract max 100 words",
      "explanation": "plain English explanation of why this is risky for the freelancer",
      "suggestion": "what the freelancer should negotiate or change"
    }
  ]
}

Risk scoring rules:
- High: Clause significantly disadvantages the freelancer or removes their rights
- Medium: Clause is unusual or could be problematic in certain situations
- Low: Standard clause, acceptable for most freelancers

CONTRACT TEXT:
---
${contractText}
---

Return only the JSON object. No markdown. No backticks. Just raw JSON.`
  const text = await generateWithModelFallback(prompt)

  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}


export async function generateCounterProposal(clauses: any[]) {
  const riskyClause = clauses
    .filter((c) => c.risk === 'High' || c.risk === 'Medium')
    .map((c) => `Type: ${c.type}\nRisk: ${c.risk}\nOriginal: ${c.excerpt}\nIssue: ${c.explanation}`)
    .join('\n\n')

  const prompt = `You are a legal expert helping freelancers negotiate better contracts.

Below are risky clauses from a contract. For each one, rewrite it in a freelancer-friendly way.

Return ONLY a valid JSON array. No markdown, no backticks, no preamble.

Format:
[
  {
    "type": "IP Rights",
    "risk": "High",
    "original": "original clause text",
    "rewritten": "new freelancer-friendly version of the clause",
    "explanation": "what changed and why this version is better for you"
  }
]

RISKY CLAUSES:
${riskyClause}

Return only the JSON array.`

  const text = await generateWithModelFallback(prompt)
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

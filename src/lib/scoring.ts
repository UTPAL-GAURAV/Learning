import type { Session } from '@/types'

export function computeReadinessScore(session: Session): number {
  const { qa } = session
  if (qa.length === 0) return 0

  // 40% — correct-on-first-try rate
  const firstTryCorrect = qa.filter(q => q.attempts[0]?.correct === true).length
  const firstTryScore = qa.length > 0 ? (firstTryCorrect / qa.length) * 40 : 0

  // 30% — recent performance (last 5 attempts across all questions)
  const allAttempts = qa.flatMap(q => q.attempts).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const recentAttempts = allAttempts.slice(0, 5)
  const recentScore = recentAttempts.length > 0
    ? (recentAttempts.filter(a => a.correct).length / recentAttempts.length) * 30
    : 0

  // 20% — coverage (questions with at least one attempt)
  const attempted = qa.filter(q => q.attempts.length > 0).length
  const coverageScore = (attempted / qa.length) * 20

  // 10% — recency penalty (decays if not reviewed in > 14 days)
  const daysSinceUpdate = (Date.now() - new Date(session.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  const recencyScore = daysSinceUpdate > 14 ? 0 : 10 * (1 - daysSinceUpdate / 14)

  return Math.round(firstTryScore + recentScore + coverageScore + recencyScore)
}

export function getScoreLabel(score: number): 'Ready' | 'In Progress' | 'Needs Work' | 'New' {
  if (score >= 75) return 'Ready'
  if (score >= 45) return 'In Progress'
  if (score > 0) return 'Needs Work'
  return 'New'
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600'
  if (score >= 45) return 'text-amber-600'
  if (score > 0) return 'text-red-600'
  return 'text-slate-400'
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 45) return 'bg-amber-500'
  if (score > 0) return 'bg-red-500'
  return 'bg-slate-300'
}
